/**
 * Tenant context — white-label brand resolution.
 *
 * Server-side: resolves a LIVE WhitelabelProfile from the incoming request's
 * host header (injected by the middleware as x-tenant-id). Returns null for
 * native BankingPoint24 requests.
 *
 * The resolved brand is safe to embed in RSC/SSR since it contains no PII.
 */

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { cache } from "react";

export type TenantBrand = {
  id: string;
  /** White-label owner user-id (platformOwnerId for members). */
  ownerId: string;
  brandName: string;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  accentColor: string;
  supportEmail: string | null;
  supportPhone: string | null;
  subdomain: string | null;
  customDomain: string | null;
};

/** Header keys written by the middleware. */
export const TENANT_HEADER = "x-tenant-id";
export const TENANT_DOMAIN_HEADER = "x-tenant-domain";

/**
 * Resolve a LIVE white-label tenant's profile-id from a request host.
 *
 * This runs in the Node runtime (RSC / route handlers) where Prisma works —
 * NOT in the Edge middleware, where the Prisma query engine cannot open a DB
 * connection. The middleware only forwards the verified host as the
 * `x-tenant-domain` header; all DB resolution happens here.
 *
 * `cache()` dedupes the lookup across every caller within a single request.
 */
export const resolveTenantIdFromHost = cache(
  async (rawHost: string | null | undefined): Promise<string | null> => {
    if (!rawHost) return null;
    const host = rawHost.split(":")[0].toLowerCase();
    if (!host) return null;

    const platformDomain = (process.env.PLATFORM_DOMAIN ?? "bankingpoint-24.com").toLowerCase();
    const appHost = (process.env.NEXT_PUBLIC_APP_URL ?? "")
      .replace(/^https?:\/\//, "")
      .split(":")[0]
      .toLowerCase();

    // The platform's own domain is never a tenant.
    if (host === appHost || host === platformDomain || host === `www.${platformDomain}`) {
      return null;
    }

    // Subdomain of the platform domain (e.g. kapoor.bankingpoint-24.com).
    let subdomain: string | null = null;
    if (host.endsWith(`.${platformDomain}`)) {
      subdomain = host.slice(0, -(`.${platformDomain}`.length));
    }

    try {
      const profile = await prisma.whitelabelProfile.findFirst({
        where: {
          status: "LIVE",
          OR: [{ customDomain: host }, ...(subdomain ? [{ subdomain }] : [])],
        },
        select: { id: true },
      });
      return profile?.id ?? null;
    } catch {
      return null;
    }
  }
);

/**
 * Resolve tenant brand for the current request.
 *
 * Reads the verified host from the `x-tenant-domain` header (set by the
 * middleware) and resolves the LIVE brand from the database. Uses React's
 * `cache()` so the DB call is deduped per request.
 */
export const getTenantBrand = cache(async (): Promise<TenantBrand | null> => {
  try {
    const headerStore = await headers();
    const host = headerStore.get(TENANT_DOMAIN_HEADER);
    const tenantId = await resolveTenantIdFromHost(host);
    if (!tenantId) return null;

    const profile = await prisma.whitelabelProfile.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        userId: true,
        status: true,
        brandName: true,
        tagline: true,
        logoUrl: true,
        faviconUrl: true,
        primaryColor: true,
        accentColor: true,
        supportEmail: true,
        supportPhone: true,
        subdomain: true,
        customDomain: true,
      },
    });

    if (!profile || profile.status !== "LIVE") return null;

    return {
      id: profile.id,
      ownerId: profile.userId,
      brandName: profile.brandName,
      tagline: profile.tagline,
      logoUrl: profile.logoUrl,
      faviconUrl: profile.faviconUrl,
      primaryColor: profile.primaryColor,
      accentColor: profile.accentColor,
      supportEmail: profile.supportEmail,
      supportPhone: profile.supportPhone,
      subdomain: profile.subdomain,
      customDomain: profile.customDomain,
    };
  } catch {
    return null;
  }
});

/**
 * Resolve the effective platform domain for a given user.
 * For white-label users, returns their tenant's custom domain or subdomain URL.
 * For native users, returns the platform APP_URL.
 */
export async function getEffectivePlatformUrl(platformOwnerId: string | null): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bankingpoint-24.com";
  const platformDomain = process.env.PLATFORM_DOMAIN ?? "bankingpoint-24.com";

  if (!platformOwnerId) return appUrl;

  try {
    const profile = await prisma.whitelabelProfile.findUnique({
      where: { userId: platformOwnerId },
      select: { customDomain: true, subdomain: true, status: true },
    });
    if (!profile || profile.status !== "LIVE") return appUrl;
    if (profile.customDomain) return `https://${profile.customDomain}`;
    if (profile.subdomain) return `https://${profile.subdomain}.${platformDomain}`;
  } catch {
    // fall through to default
  }
  return appUrl;
}
