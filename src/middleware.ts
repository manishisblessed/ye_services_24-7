import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { MAX_BODY_BYTES } from "@/lib/env";
import { TENANT_HEADER, TENANT_DOMAIN_HEADER } from "@/lib/tenant/context";

const isDev = process.env.NODE_ENV !== "production";

// NOTE: Tenant (white-label) resolution does NOT happen here. The Edge
// middleware runtime cannot run the Prisma query engine (no DB connection), so
// any Prisma call here fails silently in production. Instead the middleware
// forwards the VERIFIED request host as the `x-tenant-domain` header and the
// Node runtime (see getTenantBrand / resolveTenantIdFromHost in
// lib/tenant/context.ts) performs the actual DB lookup. The client-supplied
// `x-tenant-id` header is always stripped so a tenant can never be spoofed.

/**
 * Content-Security-Policy applied to every document response.
 *
 * Uses 'unsafe-inline' for script-src because Next.js 14.x does not reliably
 * propagate the x-nonce to every inline <script> it emits (bootstrap, data,
 * font-loader, etc.), causing the browser to block hydration entirely.
 *
 * TODO: migrate to nonce-based CSP once upgraded to Next.js 15+ which has
 * first-class nonce support via the `experimental.serverActions.nonce` flag.
 *
 * Cloudflare Turnstile (CAPTCHA) is explicitly allowlisted for script/frame/
 * connect so it works when SECURITY_CAPTCHA_ENABLED is on.
 */
function buildCsp(): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://api.qrserver.com https://images.unsplash.com https://api.dicebear.com https://logo.clearbit.com",
    "font-src 'self' data:",
    "connect-src 'self' https://challenges.cloudflare.com https://ip-api.com https://api.cloudinary.com https://*.amazonaws.com",
    "frame-src 'self' https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

const ADMIN_PATHS: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/dashboard/master-admin", roles: ["MASTER_ADMIN"] },
  { prefix: "/dashboard/sub-admin", roles: ["SUPPORT", "MASTER_ADMIN"] },
  // FINANCE gets read access to the admin area; write APIs enforce their own
  // stricter role checks (FINANCE is never accepted on mutating endpoints).
  // WHITELABEL_PARTNER (tenant root) is allowed into the admin area but is then
  // confined to the tenant-safe allowlist below.
  { prefix: "/dashboard/admin", roles: ["MASTER_ADMIN", "ADMIN", "SUPPORT", "FINANCE", "WHITELABEL_PARTNER"] },
];

/**
 * White-label tenant isolation (middleware layer).
 *
 * A "tenant member" is any account bound to a white-label company: a
 * WHITELABEL_PARTNER (tenant root), a flagged tenant owner, or any user with a
 * platformOwnerId. Tenant admins have full platform functionality EXCEPT for
 * platform-owner-only pages listed in the denylist below.
 */
const TENANT_ADMIN_PAGE_DENYLIST = [
  "/dashboard/admin/audit",       // Activity Log — platform-wide
  "/dashboard/admin/system",      // System Health — platform-wide
  "/dashboard/admin/join-requests", // Entry Gate — platform-wide
  "/dashboard/admin/kyc",         // ID Verification — platform-wide
  "/dashboard/admin/disputes",    // Helpdesk — platform-wide
  "/dashboard/admin/whitelabel",  // Partner Brands — WLP management
];

const TENANT_ADMIN_API_DENYLIST = [
  "/api/admin/audit",
  "/api/admin/system",
  "/api/admin/join-requests",
  "/api/admin/kyc",
  "/api/admin/disputes",
  "/api/admin/whitelabel",
];

function isTenantMemberToken(token: {
  role?: unknown;
  platformOwnerId?: unknown;
  isTenantOwner?: unknown;
}): boolean {
  return (
    token.role === "WHITELABEL_PARTNER" ||
    token.isTenantOwner === true ||
    Boolean(token.platformOwnerId)
  );
}

/** BBPS bill-pay pages: only RETAILER can access. */
const BBPS_PATHS: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/dashboard/bill-pay", roles: ["RETAILER"] },
];

/** Payout consumer page: only network tiers (RT/DT/MD/SD) can access.
 *  Note: /dashboard/payout-approvals is a separate path and is NOT blocked. */
const PAYOUT_PATHS: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/dashboard/payout", roles: ["RETAILER", "DISTRIBUTOR", "MASTER_DISTRIBUTOR", "SUPER_DISTRIBUTOR"] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 0. Tenant host passthrough — forward the verified request host to the
  //       Node runtime, which resolves the white-label brand from the DB.
  //       (Prisma cannot run in the Edge middleware runtime.)
  const host = req.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";

  // ── 1. Request-size limit on mutating API calls (defense vs oversized bodies).
  //       Video upload proxy routes (/video/upload) handle their own size check
  //       internally (up to KYC_VIDEO_MAX_BYTES = 15 MiB), so skip them here.
  const isVideoUploadProxy = pathname.endsWith("/video/upload");
  if (!isVideoUploadProxy && pathname.startsWith("/api/") && ["POST", "PUT", "PATCH"].includes(req.method)) {
    const len = Number(req.headers.get("content-length") ?? 0);
    if (Number.isFinite(len) && len > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }
  }

  // ── 2. CSP header
  const csp = buildCsp();

  const requestHeaders = new Headers(req.headers);

  // Forward the verified host so downstream Node code (RSCs/APIs) can resolve
  // the tenant brand from the DB. Always strip any client-supplied x-tenant-id
  // so a tenant identity can never be spoofed via a request header.
  requestHeaders.delete(TENANT_HEADER);
  if (host) {
    requestHeaders.set(TENANT_DOMAIN_HEADER, host);
  } else {
    requestHeaders.delete(TENANT_DOMAIN_HEADER);
  }

  // ── 2b. Tenant-member API firewall. Tenant admins have full admin API access
  //        except for platform-owner-only endpoints in the denylist.
  if (pathname.startsWith("/api/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token && isTenantMemberToken(token)) {
      const denied = TENANT_ADMIN_API_DENYLIST.some((p) => pathname.startsWith(p));
      if (denied) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  // ── 3. Auth gate for dashboard routes (replaces withAuth wrapper so we keep
  //       full control of the response headers).
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    const role = (token.role as string) ?? "";
    const rule = ADMIN_PATHS.find((r) => pathname.startsWith(r.prefix));
    if (rule && !rule.roles.includes(role)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Tenant members: block only platform-owner-only admin pages.
    if (
      pathname.startsWith("/dashboard/admin") &&
      isTenantMemberToken(token) &&
      TENANT_ADMIN_PAGE_DENYLIST.some((p) => pathname.startsWith(p))
    ) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // BBPS pages: RETAILER-only (/dashboard/bill-pay/*)
    const bbpsRule = BBPS_PATHS.find((r) => pathname.startsWith(r.prefix));
    if (bbpsRule && !bbpsRule.roles.includes(role)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Payout consumer page: network roles only (/dashboard/payout but NOT
    // /dashboard/payout-approvals which admins need).
    if (pathname.startsWith("/dashboard/payout") && !pathname.startsWith("/dashboard/payout-approvals")) {
      const payoutRule = PAYOUT_PATHS[0];
      if (!payoutRule.roles.includes(role)) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

    // Settlements (partner-wallet bank transfers) are a money movement admins
    // must not perform. Blocked for everyone. Note: "/dashboard/admin/settlements"
    // does not match "/dashboard/admin/settlement-ops" or ".../pos-settlement".
    if (pathname.startsWith("/dashboard/admin/settlements")) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("content-security-policy", csp);

  // ── 4. Anti cache-deception / poisoning / replay.
  //       No cache (browser, nginx, CDN) may ever store authenticated HTML or
  //       API responses. Scoped to /dashboard and /api only — /_next/static,
  //       /_next/image and public assets are already excluded by the matcher,
  //       so their long-lived immutable caching is untouched.
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
    // Server-Sent Events endpoints MUST keep `no-transform`, otherwise a
    // compression/proxy layer (Next's built-in gzip in production, nginx, a CDN)
    // buffers the `text/event-stream` and holds each frame back until the
    // connection closes — which breaks the live push (the feed then only
    // "refreshes" on reconnect / tab-switch). The stream route sets this header
    // itself; we must not clobber it here.
    const isEventStream = req.headers.get("accept") === "text/event-stream";
    res.headers.set(
      "Cache-Control",
      isEventStream
        ? "no-store, no-cache, no-transform, must-revalidate, private"
        : "no-store, no-cache, must-revalidate, private"
    );
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    // Caches that key on the response must vary by the auth cookie so a shared
    // cache can never serve one user's authenticated response to another.
    res.headers.set("Vary", "Cookie");
    // Belt-and-suspenders: disable nginx/proxy response buffering for the stream.
    if (isEventStream) res.headers.set("X-Accel-Buffering", "no");
  }

  return res;
}

export const config = {
  // Run on everything except static assets so the CSP applies to all documents.
  matcher: [
    "/((?!monitoring|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff2?)$).*)",
  ],
};
