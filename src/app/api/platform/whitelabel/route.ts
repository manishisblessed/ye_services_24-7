import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-server";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { toErrorResponse } from "@/lib/security/apiErrors";
import {
  provisionCustomDomain,
  teardownCustomDomain,
} from "@/lib/cloudflare/domains";
import {
  isCloudflareSaasConfigured,
  cloudflareSaasFallbackHostname,
} from "@/lib/cloudflare/client";

/**
 * Whitelabel profile management (Phase 4).
 *   GET — own profile (or null)
 *   PUT — create/update; setting status LIVE requires brandName + subdomain
 *
 * Available to platform tiers (MD/SD) and admins.
 */
export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

const PLATFORM_ROLES = new Set([
  "WHITELABEL_PARTNER",
  "MASTER_DISTRIBUTOR",
  "SUPER_DISTRIBUTOR",
  "ADMIN",
  "MASTER_ADMIN",
]);

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const SUBDOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;
const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;
const RESERVED_SUBDOMAINS = new Set(["www", "api", "app", "admin", "dashboard", "mail", "cdn", "static", "assets"]);

const Body = z.object({
  brandName: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(120).optional().nullable(),
  logoUrl: z.string().url().max(500).optional().nullable(),
  faviconUrl: z.string().url().max(500).optional().nullable(),
  primaryColor: z.string().regex(HEX_COLOR).optional(),
  accentColor: z.string().regex(HEX_COLOR).optional(),
  supportEmail: z.string().email().max(120).optional().nullable(),
  supportPhone: z.string().regex(/^\d{10}$/).optional().nullable(),
  subdomain: z.string().trim().toLowerCase().regex(SUBDOMAIN_RE).optional().nullable(),
  customDomain: z.string().trim().toLowerCase().regex(DOMAIN_RE).max(253).optional().nullable(),
  status: z.enum(["DRAFT", "LIVE"]).optional(),
}).strict();

function serialize(p: NonNullable<Awaited<ReturnType<typeof prisma.whitelabelProfile.findUnique>>>) {
  return {
    brandName: p.brandName,
    tagline: p.tagline,
    logoUrl: p.logoUrl,
    faviconUrl: p.faviconUrl,
    primaryColor: p.primaryColor,
    accentColor: p.accentColor,
    supportEmail: p.supportEmail,
    supportPhone: p.supportPhone,
    subdomain: p.subdomain,
    customDomain: p.customDomain,
    status: p.status,
    sslStatus: p.sslStatus,
    domainVerified: p.domainVerified,
    updatedAt: p.updatedAt.toISOString(),
  };
}

/** DNS setup metadata surfaced to the brand portal. */
function dnsInfo() {
  return {
    saasEnabled: isCloudflareSaasConfigured(),
    cnameTarget: cloudflareSaasFallbackHostname(),
  };
}

export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    return toErrorResponse(e);
  }
  if (!PLATFORM_ROLES.has(user.role)) {
    return NextResponse.json({ error: "White-label is available to Master/Super Distributors" }, { status: 403 });
  }

  const profile = await prisma.whitelabelProfile.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ profile: profile ? serialize(profile) : null, dns: dnsInfo() });
}

export async function PUT(req: Request) {
  let user;
  try {
    user = await requireAuth();
    await enforceRateLimit(`whitelabel:save:${user.id}`, RATE_LIMITS.sensitiveWrite);
  } catch (e) {
    return toErrorResponse(e);
  }
  if (!PLATFORM_ROLES.has(user.role)) {
    return NextResponse.json({ error: "White-label is available to Master/Super Distributors" }, { status: 403 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;

  if (body.subdomain && RESERVED_SUBDOMAINS.has(body.subdomain)) {
    return NextResponse.json({ error: `Subdomain "${body.subdomain}" is reserved` }, { status: 400 });
  }
  if (body.status === "LIVE" && !body.customDomain) {
    return NextResponse.json({ error: "Going live requires a custom domain" }, { status: 400 });
  }

  const existing = await prisma.whitelabelProfile.findUnique({ where: { userId: user.id } });
  // A SUSPENDED profile (admin action) cannot self-serve back to LIVE.
  if (existing?.status === "SUSPENDED" && body.status === "LIVE") {
    return NextResponse.json({ error: "Profile is suspended — contact support" }, { status: 403 });
  }

  // Whether the partner is requesting go-live in this call.
  const goLiveRequested = body.status === "LIVE" && existing?.status !== "SUSPENDED";

  // Did the custom domain change? If so, the old Cloudflare hostname (if any)
  // must be torn down before we provision the new one.
  const newDomain = body.customDomain ?? null;
  const domainChanged = (existing?.customDomain ?? null) !== newDomain;

  const data = {
    brandName: body.brandName,
    tagline: body.tagline ?? null,
    logoUrl: body.logoUrl ?? null,
    faviconUrl: body.faviconUrl ?? null,
    primaryColor: body.primaryColor ?? "#185df5",
    accentColor: body.accentColor ?? "#f97606",
    supportEmail: body.supportEmail ?? null,
    supportPhone: body.supportPhone ?? null,
    subdomain: body.subdomain ?? null,
    customDomain: newDomain,
    // NOTE: we do NOT flip to LIVE here. Go-live is handled by
    // provisionCustomDomain() below, which sets PENDING (awaiting SSL) or LIVE
    // (manual fallback / already active).
    //   - Changing the domain (without going live in the same call) resets the
    //     profile to DRAFT: the new domain needs its own hostname + CNAME, so it
    //     must be re-activated via Go live.
    //   - An explicit DRAFT save records DRAFT.
    //   - Otherwise status is left untouched (a LIVE brand stays LIVE on edits).
    ...(!goLiveRequested && existing?.status !== "SUSPENDED"
      ? domainChanged
        ? { status: "DRAFT" }
        : body.status === "DRAFT"
          ? { status: "DRAFT" }
          : {}
      : {}),
  };

  try {
    const saved = await prisma.whitelabelProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    // If the domain changed, drop the stale Cloudflare custom hostname so we
    // don't leak certs/records for a domain the partner no longer uses.
    if (domainChanged && existing?.cfCustomHostnameId) {
      await teardownCustomDomain(saved.id).catch(() => {});
    }

    // Go-live: provision the Cloudflare custom hostname and move to PENDING
    // (or LIVE when Cloudflare isn't configured / the cert is already active).
    let provision: Awaited<ReturnType<typeof provisionCustomDomain>> | null = null;
    if (goLiveRequested) {
      provision = await provisionCustomDomain(saved.id);
      if (provision.outcome === "error") {
        return NextResponse.json(
          { error: `Could not start go-live: ${provision.error ?? "Cloudflare error"}` },
          { status: 502 }
        );
      }
    }

    const fresh = await prisma.whitelabelProfile.findUnique({ where: { id: saved.id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: goLiveRequested ? "whitelabel.golive" : "whitelabel.saved",
        entity: "WhitelabelProfile",
        entityId: saved.id,
        meta: {
          brandName: saved.brandName,
          subdomain: saved.subdomain,
          customDomain: saved.customDomain,
          status: fresh?.status ?? saved.status,
          ...(provision ? { provisionOutcome: provision.outcome, sslStatus: provision.sslStatus } : {}),
        },
      },
    });

    return NextResponse.json({
      profile: serialize(fresh ?? saved),
      dns: dnsInfo(),
      ...(provision ? { provision } : {}),
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "That subdomain or domain is already taken" }, { status: 409 });
    }
    return toErrorResponse(e);
  }
}
