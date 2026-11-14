import { prisma } from "@/lib/db";
import { configNamespace } from "@/lib/security/ownership";
import type { SessionUser } from "@/lib/auth-server";

/**
 * White-label tenant isolation for the Scheme Manager.
 *
 * Every scheme belongs to a namespace via `Scheme.platformOwnerId`:
 *   - a tenant-root user id → a white-label partner's own scheme
 *   - null                  → a native BankingPoint24 platform scheme
 *
 * A caller only ever reads or mutates schemes in THEIR OWN namespace (native
 * staff → platform schemes, a tenant admin/partner → that tenant's schemes), so
 * one partner can never see, assign, or edit another tenant's pricing.
 */

/** The namespace a scheme belongs to for this caller (tenant-root id, or null). */
export function schemeNamespace(user: Pick<SessionUser, "role" | "platformOwnerId" | "isTenantOwner" | "id">): string | null {
  return configNamespace(user);
}

/** Prisma `where` fragment pinning Scheme rows to the caller's namespace. */
export function schemeNamespaceWhere(
  user: Pick<SessionUser, "role" | "platformOwnerId" | "isTenantOwner" | "id">,
): { platformOwnerId: string | null } {
  return { platformOwnerId: schemeNamespace(user) };
}

/**
 * Load a scheme ONLY if it lives in the caller's namespace. Returns null for a
 * missing id OR a cross-tenant id (callers treat both as 404 so a tenant can't
 * probe another tenant's scheme ids).
 */
export async function loadOwnedScheme<T extends Record<string, unknown>>(
  schemeId: string,
  user: Pick<SessionUser, "role" | "platformOwnerId" | "isTenantOwner" | "id">,
  args?: { select?: T; include?: Record<string, unknown> },
) {
  return prisma.scheme.findFirst({
    where: { id: schemeId, ...schemeNamespaceWhere(user) },
    ...(args ?? {}),
  } as never);
}

/** True if the given scheme id exists in the caller's namespace. */
export async function schemeInNamespace(
  schemeId: string,
  user: Pick<SessionUser, "role" | "platformOwnerId" | "isTenantOwner" | "id">,
): Promise<boolean> {
  const hit = await prisma.scheme.findFirst({
    where: { id: schemeId, ...schemeNamespaceWhere(user) },
    select: { id: true },
  });
  return !!hit;
}

/**
 * Seed a starter default scheme for a white-label tenant the first time it goes
 * live. Idempotent: a no-op once the tenant already owns any scheme.
 *
 * The starter scheme CLONES the native platform default (its service slabs and
 * MDR slabs) so a partner's retailers can transact from day one, and the
 * partner can then edit the pricing. If no platform default exists, an empty
 * active default scheme is created so the partner has something to build on.
 *
 * `ownerUserId` is the tenant-root user id (WhitelabelProfile.userId).
 */
export async function ensureTenantDefaultScheme(ownerUserId: string): Promise<{ created: boolean; schemeId: string | null }> {
  // Idempotency: tenant already has at least one scheme → nothing to do.
  const existing = await prisma.scheme.findFirst({
    where: { platformOwnerId: ownerUserId },
    select: { id: true },
  });
  if (existing) return { created: false, schemeId: existing.id };

  // Source pricing = the native platform default scheme (if configured).
  const source = await prisma.scheme.findFirst({
    where: { isDefault: true, active: true, platformOwnerId: null },
    include: { slabs: true, mdrSlabs: true },
  });

  const created = await prisma.$transaction(async (tx) => {
    const scheme = await tx.scheme.create({
      data: {
        name: "Default Scheme",
        description: "Starter pricing — edit charges & commissions for your retailers.",
        active: true,
        isDefault: true,
        platformOwnerId: ownerUserId,
      },
      select: { id: true },
    });

    if (source) {
      if (source.slabs.length > 0) {
        await tx.schemeSlab.createMany({
          data: source.slabs.map((s) => ({
            schemeId: scheme.id,
            service: s.service,
            provider: s.provider,
            minAmount: s.minAmount,
            maxAmount: s.maxAmount,
            chargeType: s.chargeType,
            chargeValue: s.chargeValue,
            chargeGstInclusive: s.chargeGstInclusive,
            vendorCharge: s.vendorCharge,
            commissionType: s.commissionType,
            commissionRetailer: s.commissionRetailer,
            commissionDistributor: s.commissionDistributor,
            commissionMaster: s.commissionMaster,
            commissionSuperDistributor: s.commissionSuperDistributor,
            commissionValue: s.commissionValue,
            active: s.active,
          })),
        });
      }
      if (source.mdrSlabs.length > 0) {
        await tx.mdrSlab.createMany({
          data: source.mdrSlabs.map((m) => ({
            schemeId: scheme.id,
            serviceKind: m.serviceKind,
            paymentMode: m.paymentMode,
            company: m.company,
            cardType: m.cardType,
            brandType: m.brandType,
            classification: m.classification,
            minAmount: m.minAmount,
            maxAmount: m.maxAmount,
            mdrType: m.mdrType,
            mdrValue: m.mdrValue,
            mdrValueT0: m.mdrValueT0,
            vendorCharge: m.vendorCharge,
            vendorChargeT0: m.vendorChargeT0,
            commissionType: m.commissionType,
            commissionRetailer: m.commissionRetailer,
            commissionDistributor: m.commissionDistributor,
            commissionMaster: m.commissionMaster,
            commissionSuperDistributor: m.commissionSuperDistributor,
            commissionDistributorT0: m.commissionDistributorT0,
            commissionMasterT0: m.commissionMasterT0,
            commissionSuperDistributorT0: m.commissionSuperDistributorT0,
            active: m.active,
          })),
        });
      }
    }

    return scheme;
  });

  return { created: true, schemeId: created.id };
}
