/**
 * Role hierarchy — the single source of truth for role ordering, onboarding
 * permissions, and default child roles in the network tree.
 *
 * Network roles: RETAILER < DISTRIBUTOR < MASTER_DISTRIBUTOR < SUPER_DISTRIBUTOR
 * Staff roles:   SUPPORT < ADMIN < MASTER_ADMIN
 *
 * Network roles onboard their immediate subordinate by default.
 * MASTER_ADMIN can create any network role.
 * ADMIN can only create SUPER_DISTRIBUTOR.
 */

export type DbRole =
  | "RETAILER"
  | "DISTRIBUTOR"
  | "MASTER_DISTRIBUTOR"
  | "SUPER_DISTRIBUTOR"
  | "WHITELABEL_PARTNER"
  | "ADMIN"
  | "SUPPORT"
  | "FINANCE"
  | "MASTER_ADMIN";

/** Numeric rank — higher number = more authority. */
export const ROLE_RANK: Record<DbRole, number> = {
  RETAILER: 10,
  DISTRIBUTOR: 20,
  MASTER_DISTRIBUTOR: 30,
  SUPER_DISTRIBUTOR: 40,
  SUPPORT: 50,
  FINANCE: 50,
  ADMIN: 60,
  // A white-label partner is the master-admin of their OWN tenant. Ranked just
  // below the platform master-admin; their authority is always scoped to their
  // own platformOwnerId boundary (enforced in the API/data layer).
  WHITELABEL_PARTNER: 65,
  MASTER_ADMIN: 70,
};

/** Ordered network tiers from lowest to highest. */
export const NETWORK_TIERS: DbRole[] = [
  "RETAILER",
  "DISTRIBUTOR",
  "MASTER_DISTRIBUTOR",
  "SUPER_DISTRIBUTOR",
];

/**
 * Kebab-case display slugs for the four network roles. These match the `role`
 * query param accepted by `GET /api/admin/users` and the display role returned
 * by that endpoint.
 */
export type NetworkRoleSlug =
  | "retailer"
  | "distributor"
  | "master-distributor"
  | "super-distributor";

/** Role filter value used by the shared user picker (`all` = every tier). */
export type RoleTabValue = "all" | NetworkRoleSlug;

/**
 * Role filter tabs for user pickers — the single source of truth for the
 * "select a role, then pick a user" UX used across the app (POS terminal
 * assignment, scheme assignment, POS rental, etc.). `value` maps directly to
 * the `/api/admin/users` `role` param.
 */
export const ROLE_TABS: readonly { value: RoleTabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "super-distributor", label: "SD" },
  { value: "master-distributor", label: "MD" },
  { value: "distributor", label: "DT" },
  { value: "retailer", label: "RT" },
] as const;

/** Short badge label (RT/DT/MD/SD) for a kebab-case display role. */
export const ROLE_SHORT_LABEL: Record<string, string> = {
  retailer: "RT",
  distributor: "DT",
  "master-distributor": "MD",
  "super-distributor": "SD",
};

/** Staff/admin roles (not part of the onboarding chain). */
export const STAFF_ROLES: DbRole[] = ["SUPPORT", "FINANCE", "ADMIN", "MASTER_ADMIN"];

/**
 * Tenant-root roles — the master-admin of a white-label company. They sit
 * OUTSIDE the network parentId tree (like a platform master-admin) and can mint
 * network tiers + their own staff, always scoped to their platformOwnerId.
 */
export const TENANT_ROOT_ROLES: DbRole[] = ["WHITELABEL_PARTNER"];

/** Roles that can perform onboarding (network + staff-creators + tenant roots). */
export const ONBOARD_CAPABLE_ROLES: DbRole[] = [
  "DISTRIBUTOR",
  "MASTER_DISTRIBUTOR",
  "SUPER_DISTRIBUTOR",
  "WHITELABEL_PARTNER",
  "ADMIN",
  "MASTER_ADMIN",
];

/**
 * Can `creatorRole` onboard a user with `targetRole`?
 *
 * - MASTER_ADMIN can create ANY network role.
 * - WHITELABEL_PARTNER (tenant root) can create ANY network tier within their
 *   own tenant boundary (SD/MD/DT/RT). Their own staff (ADMIN/SUPPORT) are
 *   created through the dedicated staff routes, not the onboarding/invite flow.
 * - ADMIN can ONLY create SUPER_DISTRIBUTOR.
 * - SUPER_DISTRIBUTOR can ONLY create MASTER_DISTRIBUTOR.
 * - MASTER_DISTRIBUTOR can ONLY create DISTRIBUTOR.
 * - DISTRIBUTOR can ONLY create RETAILER.
 * - isTenantOwner (SD/MD) can create SDs under their own domain boundary.
 *   Pass `opts.isTenantOwner = true` from the API layer when the caller has
 *   the white-label tenant-owner flag set.
 */
export function canOnboard(
  creatorRole: string,
  targetRole: string,
  opts?: { isTenantOwner?: boolean }
): boolean {
  const cRank = ROLE_RANK[creatorRole as DbRole];
  const tRank = ROLE_RANK[targetRole as DbRole];
  if (cRank === undefined || tRank === undefined) return false;

  if (creatorRole === "MASTER_ADMIN") {
    return targetRole === "WHITELABEL_PARTNER" || NETWORK_TIERS.includes(targetRole as DbRole);
  }

  // A white-label partner is the master-admin of their own tenant: they can
  // seed any network tier inside their company. platformOwnerId scoping is
  // enforced in the API/data layer so this never crosses tenant boundaries.
  if (creatorRole === "WHITELABEL_PARTNER") {
    return NETWORK_TIERS.includes(targetRole as DbRole);
  }

  if (creatorRole === "ADMIN") {
    return targetRole === "SUPER_DISTRIBUTOR";
  }

  // White-label tenant owners (SD or MD) can create any network tier within
  // their own domain boundary. The API layer enforces platformOwnerId scoping.
  if (opts?.isTenantOwner && NETWORK_TIERS.includes(creatorRole as DbRole)) {
    return NETWORK_TIERS.includes(targetRole as DbRole);
  }

  const cIdx = NETWORK_TIERS.indexOf(creatorRole as DbRole);
  const tIdx = NETWORK_TIERS.indexOf(targetRole as DbRole);
  return cIdx > 0 && tIdx >= 0 && cIdx === tIdx + 1;
}

/**
 * Returns the list of network roles that `creatorRole` is allowed to invite.
 * Used by the frontend to populate the role dropdown dynamically.
 *
 * Pass `isTenantOwner = true` when the caller has the white-label owner flag —
 * they can then invite any network tier (SD/MD/DT/RT) on their domain.
 */
export function allowedInviteRoles(
  creatorRole: string,
  opts?: { isTenantOwner?: boolean }
): DbRole[] {
  if (creatorRole === "MASTER_ADMIN") {
    return ["WHITELABEL_PARTNER", ...([...NETWORK_TIERS].reverse())];
  }
  // Tenant root: can seed any network tier inside their own company.
  if (creatorRole === "WHITELABEL_PARTNER") {
    return [...NETWORK_TIERS].reverse();
  }
  if (creatorRole === "ADMIN") {
    return ["SUPER_DISTRIBUTOR"];
  }
  // Tenant owner: can invite any tier under their domain
  if (opts?.isTenantOwner && NETWORK_TIERS.includes(creatorRole as DbRole)) {
    return [...NETWORK_TIERS].reverse();
  }
  const child = defaultChildRole(creatorRole);
  return child ? [child] : [];
}

/**
 * Default child role when a creator doesn't specify one explicitly.
 * Each role defaults to their immediate subordinate.
 */
export function defaultChildRole(creatorRole: string): DbRole {
  switch (creatorRole) {
    case "MASTER_ADMIN":
    case "ADMIN":
    case "WHITELABEL_PARTNER":
      return "SUPER_DISTRIBUTOR";
    case "SUPER_DISTRIBUTOR":
      return "MASTER_DISTRIBUTOR";
    case "MASTER_DISTRIBUTOR":
      return "DISTRIBUTOR";
    case "DISTRIBUTOR":
      return "RETAILER";
    default:
      return "RETAILER";
  }
}

/** Whether a role is a staff/admin role (not a network role). */
export function isStaffRole(role: string): boolean {
  return STAFF_ROLES.includes(role as DbRole);
}

/**
 * Returns the role that must serve as the parent for a given network role.
 * e.g. RETAILER → DISTRIBUTOR, DISTRIBUTOR → MASTER_DISTRIBUTOR, etc.
 * Returns null for SUPER_DISTRIBUTOR (top of network tree, no required parent).
 */
export function getParentRole(role: string): DbRole | null {
  const idx = NETWORK_TIERS.indexOf(role as DbRole);
  if (idx < 0 || idx >= NETWORK_TIERS.length - 1) return null;
  return NETWORK_TIERS[idx + 1];
}

/* ---------- Upline chain resolution (RT → DT → MD → SD) ---------- */

/** A single ancestor node in a user's upline chain. */
export type UplineNode = {
  id: string;
  name: string;
  role: DbRole;
  userCode: string | null;
  shopName: string | null;
};

/** Fields selected for each node when resolving an upline chain. */
const uplineSelect = {
  id: true,
  name: true,
  role: true,
  userCode: true,
  shopName: true,
} as const;

/**
 * Nested self-relation include covering the full network depth
 * (RETAILER → DISTRIBUTOR → MASTER_DISTRIBUTOR → SUPER_DISTRIBUTOR).
 * The tree is at most 4 tiers deep, so a fixed nesting avoids recursion.
 * Spread this into a Prisma `select` on the User model.
 */
export const uplineInclude = {
  parent: {
    select: {
      ...uplineSelect,
      parent: {
        select: {
          ...uplineSelect,
          parent: {
            select: {
              ...uplineSelect,
              parent: { select: uplineSelect },
            },
          },
        },
      },
    },
  },
} as const;

type LoadedParent = {
  id: string;
  name: string;
  role: string;
  userCode?: string | null;
  shopName?: string | null;
  parent?: LoadedParent | null;
} | null;

/**
 * Flatten a loaded user's ancestors into an ordered upline chain, nearest
 * parent first. e.g. a retailer resolves to [DT, MD, SD].
 */
export function flattenUpline(user: { parent?: LoadedParent } | null): UplineNode[] {
  const out: UplineNode[] = [];
  let cur = user?.parent ?? null;
  while (cur) {
    out.push({
      id: cur.id,
      name: cur.name,
      role: cur.role as DbRole,
      userCode: cur.userCode ?? null,
      shopName: cur.shopName ?? null,
    });
    cur = cur.parent ?? null;
  }
  return out;
}
