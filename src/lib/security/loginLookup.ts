/**
 * Login user resolution — tenant-aware and deterministic.
 *
 * Since the per-tenant identity migration, email/phone are no longer globally
 * unique: the same email/phone may exist in a white-label partner's tenant and
 * on the native platform (or in a different tenant). `userCode` remains globally
 * unique, so a userCode login is always unambiguous.
 *
 * Resolution rules for an email/phone login:
 *   1. If the request arrived on a LIVE partner domain (middleware set the
 *      `x-tenant-id` header), prefer the matching user inside that tenant
 *      (the tenant owner themselves, or a member with platformOwnerId = owner).
 *   2. Otherwise fall back to a deterministic platform-wide lookup, oldest
 *      account first, so the result never depends on arbitrary row ordering.
 */
import { prisma } from "@/lib/db";

/** Resolve the tenant owner's user-id from the middleware `x-tenant-id` header. */
export async function resolveTenantOwnerFromHeader(
  tenantId: string | null | undefined
): Promise<string | null> {
  if (!tenantId) return null;
  try {
    const profile = await prisma.whitelabelProfile.findUnique({
      where: { id: tenantId },
      select: { userId: true, status: true },
    });
    return profile && profile.status === "LIVE" ? profile.userId : null;
  } catch {
    return null;
  }
}

type LoginLookupOptions = {
  /** Also match the globally-unique userCode (public /login portal). */
  includeUserCode?: boolean;
  /** Tenant owner id resolved from the active partner domain, if any. */
  tenantOwnerId?: string | null;
};

/**
 * Find the single user for a login identifier, tenant-scoped when a partner
 * domain is active, otherwise deterministic (oldest account wins).
 */
export async function findLoginUser(identifier: string, opts: LoginLookupOptions = {}) {
  const idMatch: Record<string, unknown>[] = [{ email: identifier }, { phone: identifier }];
  if (opts.includeUserCode) {
    idMatch.push({ userCode: { equals: identifier, mode: "insensitive" } });
  }
  const base = { OR: idMatch, deletedAt: null };

  // 1) Prefer a match inside the active partner tenant.
  if (opts.tenantOwnerId) {
    const scoped = await prisma.user.findFirst({
      where: {
        AND: [
          base,
          { OR: [{ id: opts.tenantOwnerId }, { platformOwnerId: opts.tenantOwnerId }] },
        ],
      },
      orderBy: { createdAt: "asc" },
    });
    if (scoped) return scoped;
  }

  // 2) Deterministic platform-wide fallback.
  return prisma.user.findFirst({ where: base, orderBy: { createdAt: "asc" } });
}
