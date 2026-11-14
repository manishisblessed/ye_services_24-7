import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { AuthError, type SessionUser } from "../auth-server";

/**
 * Object-level authorization (defense against IDOR / BOLA — the #1 fintech API
 * risk). Role checks alone are not enough: a logged-in retailer must never be
 * able to read another retailer's payout by guessing an id.
 *
 * Access model:
 *   - Admin roles (MASTER_ADMIN, ADMIN, SUPPORT) can access everything.
 *   - A user can always access their own resources.
 *   - A parent in the hierarchy can access their entire downline (descendants).
 */

const ADMIN_ROLES = new Set(["MASTER_ADMIN", "ADMIN", "SUPPORT"]);

/** All back-office staff roles (money oversight + operations). */
const STAFF_ROLES = new Set(["MASTER_ADMIN", "ADMIN", "SUPPORT", "FINANCE"]);

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.has(role);
}

/* ────────────────────────────────────────────────────────────────────────
 * White-label tenant isolation
 *
 * Access model (replaces the blanket "admins see everything"):
 *   - Native platform staff (MASTER_ADMIN/ADMIN/SUPPORT/FINANCE with NO
 *     platformOwnerId and not a tenant owner) → full cross-tenant oversight.
 *   - A white-label partner (tenant root) and their tenant staff → everything
 *     WITHIN their own platformOwnerId boundary, nothing outside it.
 *   - Network users (SD/MD/DT/RT) → self + downline (already inside a tenant).
 * ──────────────────────────────────────────────────────────────────────── */

type TenantActor = {
  id: string;
  role: string;
  platformOwnerId?: string | null;
  isTenantOwner?: boolean;
};

/**
 * The tenant-root user id for this caller, or null for native platform users.
 * A WHITELABEL_PARTNER (or any flagged tenant owner) IS the root; everyone else
 * inherits the root via platformOwnerId.
 */
export function tenantOwnerId(user: TenantActor): string | null {
  if (user.role === "WHITELABEL_PARTNER" || user.isTenantOwner) return user.id;
  return user.platformOwnerId ?? null;
}

/** True when the caller IS a white-label tenant root. */
export function isTenantRoot(user: TenantActor): boolean {
  return user.role === "WHITELABEL_PARTNER" || user.isTenantOwner === true;
}

/** True when the caller is native platform staff with cross-tenant oversight. */
export function isPlatformStaff(user: TenantActor): boolean {
  return STAFF_ROLES.has(user.role) && !user.platformOwnerId && !isTenantRoot(user);
}

/** True when the caller is a staff account (admin/support/finance) of a tenant. */
export function isTenantStaff(user: TenantActor): boolean {
  return STAFF_ROLES.has(user.role) && Boolean(tenantOwnerId(user));
}

/** True when the caller may see every record in their tenant (root or staff). */
export function hasTenantWideScope(user: TenantActor): boolean {
  return isTenantRoot(user) || isTenantStaff(user);
}

/** All user ids belonging to a tenant (the root + every member). */
export async function getTenantMemberIds(ownerId: string): Promise<string[]> {
  const rows = await prisma.user.findMany({
    where: { OR: [{ id: ownerId }, { platformOwnerId: ownerId }] },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

/**
 * Prisma `where` fragment for the **User** table that scopes a list query to
 * what `user` may see. Spread into a User query's `where`.
 *   - Native staff → {} (unrestricted)
 *   - Tenant root/staff → the whole tenant (root + members)
 *   - Network user → self + downline
 */
export async function tenantUserWhere(
  user: TenantActor
): Promise<Record<string, unknown>> {
  if (isPlatformStaff(user)) return {};
  const ownerId = tenantOwnerId(user);
  if (ownerId && hasTenantWideScope(user)) {
    return { OR: [{ id: ownerId }, { platformOwnerId: ownerId }] };
  }
  const descendants = await getDescendantIds(user.id);
  return { id: { in: [user.id, ...descendants] } };
}

/**
 * Prisma `where` fragment for any model that carries a `platformOwnerId`
 * column (Invite, WhitelabelProfile, …). Native staff see all; tenant members
 * are pinned to their own tenant.
 */
export function tenantOwnedWhere(user: TenantActor): Record<string, unknown> {
  if (isPlatformStaff(user)) return {};
  const ownerId = tenantOwnerId(user);
  // Fail closed: a tenant member with no resolvable owner sees nothing.
  return { platformOwnerId: ownerId ?? "__no_tenant__" };
}

/**
 * Prisma `where` fragment that pins a `platformOwnerId`-namespaced CONFIG model
 * (Scheme, …) to the caller's OWN namespace — unlike {@link tenantOwnedWhere},
 * native staff are scoped to the platform namespace (platformOwnerId NULL)
 * rather than seeing every tenant's config. This gives each tenant an isolated
 * scheme namespace and keeps native admins managing only the platform schemes.
 */
export function namespaceWhere(user: TenantActor): { platformOwnerId: string | null } {
  return { platformOwnerId: tenantOwnerId(user) };
}

/**
 * The namespace a caller writes config into: their tenant-root id, or null for
 * native platform staff. Pair with {@link namespaceWhere} on reads.
 */
export function configNamespace(user: TenantActor): string | null {
  return tenantOwnerId(user);
}

/** Throw 403 unless `user` owns (or administers) the given resource owner id.
 *  Only NATIVE platform staff get the blanket bypass; tenant staff must prove
 *  access via `assertCanAccessUser` (tenant/hierarchy aware). */
export function assertOwner(resourceOwnerId: string, user: SessionUser): void {
  if (isPlatformStaff(user)) return;
  if (resourceOwnerId === user.id) return;
  throw new AuthError("Forbidden", 403);
}

/**
 * All descendant user ids beneath `userId` in the hierarchy (excludes self).
 * Uses a single recursive CTE for efficiency.
 */
export async function getDescendantIds(userId: string): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    WITH RECURSIVE downline AS (
      SELECT id FROM "User" WHERE "parentId" = ${userId}
      UNION ALL
      SELECT u.id FROM "User" u
      INNER JOIN downline d ON u."parentId" = d.id
    )
    SELECT id FROM downline
  `;
  return rows.map((r) => r.id);
}

/**
 * All descendant user ids beneath ANY of `rootIds` (excludes the roots). Used
 * to scope staff admins by hierarchy: admins aren't in the parentId tree, so we
 * seed the CTE with the network users they onboarded and expand downward.
 */
export async function getDescendantIdsForMany(rootIds: string[]): Promise<string[]> {
  if (rootIds.length === 0) return [];
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    WITH RECURSIVE downline AS (
      SELECT id FROM "User" WHERE "parentId" IN (${Prisma.join(rootIds)})
      UNION ALL
      SELECT u.id FROM "User" u
      INNER JOIN downline d ON u."parentId" = d.id
    )
    SELECT id FROM downline
  `;
  return rows.map((r) => r.id);
}

/**
 * Immediate children of `userId` (one hierarchy level down only — excludes self
 * and deeper descendants). Used by the POS visibility model where a parent sees
 * only their DIRECT children's terminals: SD→MDs, MD→DTs, DT→RTs.
 */
export async function getDirectChildIds(userId: string): Promise<string[]> {
  const rows = await prisma.user.findMany({
    where: { parentId: userId, deletedAt: null },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

/** True if `targetUserId` is a DIRECT child of `user` (or `user` is self/admin). */
export async function isSelfOrDirectChild(
  targetUserId: string,
  user: SessionUser
): Promise<boolean> {
  if (isAdminRole(user.role)) return true;
  if (targetUserId === user.id) return true;
  const child = await prisma.user.findFirst({
    where: { id: targetUserId, parentId: user.id, deletedAt: null },
    select: { id: true },
  });
  return Boolean(child);
}

/** True if `user` may access data belonging to `targetUserId`. */
export async function canAccessUser(
  targetUserId: string,
  user: SessionUser
): Promise<boolean> {
  if (isPlatformStaff(user)) return true;
  if (targetUserId === user.id) return true;
  // Tenant root / tenant staff: any member of the SAME tenant.
  const ownerId = tenantOwnerId(user);
  if (ownerId && hasTenantWideScope(user)) {
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, platformOwnerId: true },
    });
    if (!target) return false;
    return target.platformOwnerId === ownerId || target.id === ownerId;
  }
  // Network user: self + downline.
  const descendants = await getDescendantIds(user.id);
  return descendants.includes(targetUserId);
}

/** Throw 403 unless `user` may access `targetUserId`'s data. */
export async function assertCanAccessUser(
  targetUserId: string,
  user: SessionUser
): Promise<void> {
  if (!(await canAccessUser(targetUserId, user))) {
    throw new AuthError("Forbidden", 403);
  }
}

/**
 * Build a Prisma `userId` filter that scopes a list query to what `user` is
 * allowed to see: everything for admins, otherwise self + downline.
 *
 * Usage:
 *   const where = { ...(await scopeUserIdFilter(user)) };
 *   prisma.payoutRequest.findMany({ where });
 */
export async function scopeUserIdFilter(
  user: SessionUser
): Promise<{ userId?: { in: string[] } }> {
  if (isPlatformStaff(user)) return {};
  const ownerId = tenantOwnerId(user);
  if (ownerId && hasTenantWideScope(user)) {
    const ids = await getTenantMemberIds(ownerId);
    return { userId: { in: ids } };
  }
  const descendants = await getDescendantIds(user.id);
  return { userId: { in: [user.id, ...descendants] } };
}

/**
 * Like `scopeUserIdFilter` but scopes to self + DIRECT children only (one
 * hierarchy level), never the full subtree. This is the POS visibility model:
 * an SD sees only their direct MDs' terminals, an MD only their direct DTs', a
 * DT only their direct RTs'. Admins are unrestricted.
 */
export async function scopeDirectUserIdFilter(
  user: SessionUser
): Promise<{ userId?: { in: string[] } }> {
  if (isPlatformStaff(user)) return {};
  // Tenant root / staff oversee every terminal in their company.
  const ownerId = tenantOwnerId(user);
  if (ownerId && hasTenantWideScope(user)) {
    const ids = await getTenantMemberIds(ownerId);
    return { userId: { in: ids } };
  }
  const children = await getDirectChildIds(user.id);
  return { userId: { in: [user.id, ...children] } };
}

/**
 * Invite visibility scope for a staff ADMIN. Admins sit outside the network
 * parentId tree (the SDs they invite are top-level with parentId = null), so
 * the only durable link back to the admin is `invite.invitedById`. We anchor on
 * the SDs the admin onboarded and expand to their full downline.
 *
 * Returns:
 *   - actorIds: users whose invites the admin may see (the admin themself +
 *               everyone in their tree) — matched against `invite.invitedById`.
 *   - treeIds:  the network users in the admin's subtree — matched against a
 *               registered invite's `userId` or a pending invite's `parentId`.
 */
export async function getAdminInviteScope(
  user: SessionUser
): Promise<{ actorIds: string[]; treeIds: string[] }> {
  const sdInvites = await prisma.invite.findMany({
    where: { invitedById: user.id, userId: { not: null } },
    select: { userId: true },
  });
  const sdIds = sdInvites
    .map((i) => i.userId)
    .filter((id): id is string => Boolean(id));
  const descendants = sdIds.length ? await getDescendantIdsForMany(sdIds) : [];
  const treeIds = [...new Set([...sdIds, ...descendants])];
  const actorIds = [...new Set([user.id, ...treeIds])];
  return { actorIds, treeIds };
}

/**
 * True if `user` may access a single invite. MASTER_ADMIN and SUPPORT are
 * unrestricted (existing behaviour); an ADMIN may only touch invites within
 * their hierarchy scope (see `getAdminInviteScope`). Other roles: false.
 */
export async function adminInviteInScope(
  user: SessionUser,
  invite: {
    invitedById?: string | null;
    userId?: string | null;
    parentId?: string | null;
  }
): Promise<boolean> {
  if (user.role === "MASTER_ADMIN" || user.role === "SUPPORT") return true;
  if (user.role !== "ADMIN") return false;
  const { actorIds, treeIds } = await getAdminInviteScope(user);
  return Boolean(
    (invite.invitedById && actorIds.includes(invite.invitedById)) ||
      (invite.userId && treeIds.includes(invite.userId)) ||
      (invite.parentId && treeIds.includes(invite.parentId))
  );
}
