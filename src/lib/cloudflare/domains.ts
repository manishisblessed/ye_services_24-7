/**
 * White-label custom-domain lifecycle (Cloudflare for SaaS).
 *
 * Bridges the WhitelabelProfile status machine and the Cloudflare Custom
 * Hostname API:
 *
 *   provisionCustomDomain()  — called when a partner clicks "Go Live". Creates
 *                              (or reuses) the Cloudflare custom hostname and
 *                              moves the profile to PENDING.
 *   syncCustomDomainStatus() — re-polls Cloudflare for one profile, mirrors
 *                              ssl.status, and auto-promotes PENDING → LIVE the
 *                              moment the cert is active.
 *   sweepPendingDomains()    — worker sweep: syncs every PENDING profile.
 *   teardownCustomDomain()   — deletes the Cloudflare hostname (domain change /
 *                              suspension) and clears the stored id.
 *
 * All functions are safe to call when Cloudflare isn't configured — they no-op
 * or report so callers can fall back to the legacy manual A-record flow.
 */

import { prisma } from "@/lib/db";
import { ensureTenantDefaultScheme } from "@/lib/scheme/tenant";
import {
  createCustomHostname,
  deleteCustomHostname,
  getCustomHostname,
  isCloudflareSaasConfigured,
  CloudflareError,
  type CfCustomHostname,
} from "./client";

/**
 * Flip a white-label owner into an active tenant the moment their site goes
 * live: grant tenant-owner powers AND seed a starter default scheme (cloned
 * from the platform default) so their retailers can transact from day one.
 * Idempotent — safe to call on every LIVE transition.
 */
export async function activateTenantOwner(ownerUserId: string): Promise<void> {
  await prisma.user.update({
    where: { id: ownerUserId },
    data: { isTenantOwner: true },
  });
  await ensureTenantDefaultScheme(ownerUserId).catch(() => {
    /* seeding failure must never block go-live; a partner can create a scheme manually */
  });
}

export type ProvisionResult = {
  /** "pending" = Cloudflare provisioning started; "live" = already active;
   *  "manual" = Cloudflare not configured, legacy flow; "error" = failed. */
  outcome: "pending" | "live" | "manual" | "error";
  status: string; // resulting profile status
  sslStatus: string | null;
  cname: string | null; // CNAME target the partner must add
  error?: string;
};

/** Map Cloudflare's ssl.status onto our coarse profile status. */
function isActive(cf: CfCustomHostname): boolean {
  return cf.status === "active" && cf.ssl?.status === "active";
}

/**
 * Provision (or re-provision) the Cloudflare custom hostname for a profile's
 * customDomain and move it to PENDING. Idempotent: if a hostname id already
 * exists it is re-synced instead of duplicated.
 */
export async function provisionCustomDomain(
  profileId: string
): Promise<ProvisionResult> {
  const profile = await prisma.whitelabelProfile.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      customDomain: true,
      cfCustomHostnameId: true,
      status: true,
    },
  });

  if (!profile) {
    return { outcome: "error", status: "DRAFT", sslStatus: null, cname: null, error: "Profile not found" };
  }
  if (!profile.customDomain) {
    return { outcome: "error", status: profile.status, sslStatus: null, cname: null, error: "No custom domain set" };
  }

  // Cloudflare not wired up → legacy manual flow: flip straight to LIVE.
  if (!isCloudflareSaasConfigured()) {
    const live = await prisma.whitelabelProfile.update({
      where: { id: profile.id },
      data: { status: "LIVE" },
      select: { userId: true },
    });
    await activateTenantOwner(live.userId);
    return { outcome: "manual", status: "LIVE", sslStatus: null, cname: null };
  }

  try {
    let cf: CfCustomHostname;

    if (profile.cfCustomHostnameId) {
      // Reuse the existing hostname; re-fetch its live status.
      cf = await getCustomHostname(profile.cfCustomHostnameId);
      // If the stored hostname no longer matches the domain, recreate it.
      if (cf.hostname !== profile.customDomain) {
        await deleteCustomHostname(profile.cfCustomHostnameId).catch(() => {});
        cf = await createCustomHostname(profile.customDomain);
      }
    } else {
      cf = await createCustomHostname(profile.customDomain);
    }

    const active = isActive(cf);
    const status = active ? "LIVE" : "PENDING";

    const updated = await prisma.whitelabelProfile.update({
      where: { id: profile.id },
      data: {
        cfCustomHostnameId: cf.id,
        sslStatus: cf.ssl?.status ?? null,
        domainVerified: active,
        domainCheckedAt: new Date(),
        status,
      },
      select: { userId: true },
    });

    // Already-active hostname (e.g. re-provision after cert issued): activate now.
    if (status === "LIVE" && profile.status !== "LIVE") {
      await activateTenantOwner(updated.userId);
    }

    return {
      outcome: active ? "live" : "pending",
      status,
      sslStatus: cf.ssl?.status ?? null,
      cname: fallbackCname(),
    };
  } catch (e) {
    const msg = e instanceof CloudflareError ? e.message : String(e);
    return { outcome: "error", status: profile.status, sslStatus: null, cname: fallbackCname(), error: msg };
  }
}

/**
 * Re-poll Cloudflare for one profile and mirror the result. Auto-promotes a
 * PENDING profile to LIVE when the cert is active. Returns the fresh status.
 */
export async function syncCustomDomainStatus(profileId: string): Promise<{
  status: string;
  sslStatus: string | null;
  domainVerified: boolean;
  changed: boolean;
}> {
  const profile = await prisma.whitelabelProfile.findUnique({
    where: { id: profileId },
    select: { id: true, status: true, cfCustomHostnameId: true, sslStatus: true, domainVerified: true },
  });

  if (!profile || !profile.cfCustomHostnameId || !isCloudflareSaasConfigured()) {
    return {
      status: profile?.status ?? "DRAFT",
      sslStatus: profile?.sslStatus ?? null,
      domainVerified: profile?.domainVerified ?? false,
      changed: false,
    };
  }

  let cf: CfCustomHostname;
  try {
    cf = await getCustomHostname(profile.cfCustomHostnameId);
  } catch {
    // Transient Cloudflare error — leave state unchanged, just stamp checkedAt.
    await prisma.whitelabelProfile.update({
      where: { id: profile.id },
      data: { domainCheckedAt: new Date() },
    });
    return {
      status: profile.status,
      sslStatus: profile.sslStatus,
      domainVerified: profile.domainVerified,
      changed: false,
    };
  }

  const active = isActive(cf);
  // Only auto-promote a PENDING profile. Never override DRAFT/SUSPENDED.
  const nextStatus =
    profile.status === "PENDING" && active ? "LIVE" : profile.status;

  const changed =
    nextStatus !== profile.status ||
    (cf.ssl?.status ?? null) !== profile.sslStatus ||
    active !== profile.domainVerified;

  await prisma.whitelabelProfile.update({
    where: { id: profile.id },
    data: {
      sslStatus: cf.ssl?.status ?? null,
      domainVerified: active,
      domainCheckedAt: new Date(),
      status: nextStatus,
    },
  });

  if (nextStatus === "LIVE" && profile.status !== "LIVE") {
    // Unlock the owner's tenant powers + seed their starter scheme the moment
    // the domain goes live.
    const owner = await prisma.whitelabelProfile.findUnique({
      where: { id: profile.id },
      select: { userId: true },
    });
    if (owner) {
      await activateTenantOwner(owner.userId);
    }
  }

  return {
    status: nextStatus,
    sslStatus: cf.ssl?.status ?? null,
    domainVerified: active,
    changed,
  };
}

/**
 * Worker sweep: sync every PENDING profile that has a Cloudflare hostname.
 * Returns counts for logging.
 */
export async function sweepPendingDomains(): Promise<{
  scanned: number;
  promoted: number;
  skipped: boolean;
}> {
  if (!isCloudflareSaasConfigured()) {
    return { scanned: 0, promoted: 0, skipped: true };
  }

  const pending = await prisma.whitelabelProfile.findMany({
    where: { status: "PENDING", cfCustomHostnameId: { not: null } },
    select: { id: true },
    take: 200,
  });

  let promoted = 0;
  for (const p of pending) {
    try {
      const r = await syncCustomDomainStatus(p.id);
      if (r.status === "LIVE") promoted += 1;
    } catch {
      /* per-row failure never aborts the sweep */
    }
  }

  return { scanned: pending.length, promoted, skipped: false };
}

/**
 * Delete the Cloudflare custom hostname for a profile and clear the stored id.
 * Called on domain change or tenant teardown. Best-effort.
 */
export async function teardownCustomDomain(profileId: string): Promise<void> {
  const profile = await prisma.whitelabelProfile.findUnique({
    where: { id: profileId },
    select: { id: true, cfCustomHostnameId: true },
  });
  if (!profile?.cfCustomHostnameId) return;

  if (isCloudflareSaasConfigured()) {
    await deleteCustomHostname(profile.cfCustomHostnameId).catch(() => {});
  }

  await prisma.whitelabelProfile.update({
    where: { id: profile.id },
    data: {
      cfCustomHostnameId: null,
      sslStatus: null,
      domainVerified: false,
    },
  });
}

function fallbackCname(): string | null {
  return process.env.CLOUDFLARE_SAAS_FALLBACK_HOSTNAME ?? null;
}
