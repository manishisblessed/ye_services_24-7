import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-server";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { syncCustomDomainStatus } from "@/lib/cloudflare/domains";
import {
  isCloudflareSaasConfigured,
  cloudflareSaasFallbackHostname,
} from "@/lib/cloudflare/client";

/**
 * On-demand custom-domain status check for the brand portal.
 *
 * Re-polls Cloudflare for the caller's own white-label custom hostname and
 * auto-promotes the profile PENDING → LIVE the instant the TLS cert is active.
 * The worker also sweeps this on a schedule; this endpoint lets the partner hit
 * "Check status" and see the result immediately.
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

export async function POST() {
  let user;
  try {
    user = await requireAuth();
    await enforceRateLimit(`whitelabel:domain-status:${user.id}`, RATE_LIMITS.default);
  } catch (e) {
    return toErrorResponse(e);
  }
  if (!PLATFORM_ROLES.has(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.whitelabelProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, sslStatus: true, domainVerified: true, cfCustomHostnameId: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "No white-label profile" }, { status: 404 });
  }

  if (!isCloudflareSaasConfigured() || !profile.cfCustomHostnameId) {
    return NextResponse.json({
      status: profile.status,
      sslStatus: profile.sslStatus,
      domainVerified: profile.domainVerified,
      saasEnabled: isCloudflareSaasConfigured(),
      cnameTarget: cloudflareSaasFallbackHostname(),
    });
  }

  const result = await syncCustomDomainStatus(profile.id);

  return NextResponse.json({
    status: result.status,
    sslStatus: result.sslStatus,
    domainVerified: result.domainVerified,
    saasEnabled: true,
    cnameTarget: cloudflareSaasFallbackHostname(),
  });
}
