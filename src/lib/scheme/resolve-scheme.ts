import { prisma } from "@/lib/db";
import { flags } from "@/lib/env";

/**
 * Which scheme a user's pricing resolved from.
 *   - USER_SCHEME    → the user's explicitly-assigned active scheme
 *   - DEFAULT_SCHEME → the platform default (Scheme.isDefault) via fallback
 *   - NONE           → no resolvable scheme (gate blocks, resolvers zero out)
 */
export type SchemeSource = "USER_SCHEME" | "DEFAULT_SCHEME" | "NONE";

export type ResolvedScheme = {
  schemeId: string | null;
  schemeName: string | null;
  source: SchemeSource;
};

/**
 * The single active default scheme (Scheme.isDefault = true, active) WITHIN a
 * namespace. Admin APIs enforce the single-default invariant per namespace, so
 * at most one row matches. Pass the user's `platformOwnerId`:
 *   - a tenant-root id → that white-label tenant's own default scheme
 *   - null             → the native BankingPoint24 platform default
 * Returns null when no default is configured for that namespace.
 */
export async function getDefaultScheme(
  platformOwnerId: string | null = null,
): Promise<{ id: string; name: string } | null> {
  return prisma.scheme.findFirst({
    where: { isDefault: true, active: true, platformOwnerId: platformOwnerId ?? null },
    select: { id: true, name: true },
  });
}

/**
 * Resolve the scheme that prices a user — the SINGLE source of truth for the
 * "which scheme applies to this user?" question. Every pricing path (service
 * charges, MDR, limits, the scheme gate, and the "My Scheme" view) funnels
 * through here so the default-fallback rule can never drift between callers.
 *
 * Resolution order:
 *   1. The user's explicitly-assigned scheme, if it exists and is active.
 *   2. The platform default scheme — ONLY when SCHEME_DEFAULT_FALLBACK is on.
 *   3. NONE (nonexistent user, or no active scheme and no/absent default).
 *
 * A nonexistent user always resolves to NONE (never falls back to default), so
 * bad ids can't silently acquire pricing.
 */
export async function resolveUserScheme(userId: string): Promise<ResolvedScheme> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { schemeId: true, platformOwnerId: true },
  });
  if (!user) return { schemeId: null, schemeName: null, source: "NONE" };

  // 1. Explicit active assignment always wins.
  if (user.schemeId) {
    const scheme = await prisma.scheme.findFirst({
      where: { id: user.schemeId, active: true },
      select: { id: true, name: true },
    });
    if (scheme) return { schemeId: scheme.id, schemeName: scheme.name, source: "USER_SCHEME" };
  }

  // 2. Fall back to the default scheme OF THE USER'S OWN TENANT (flag-gated).
  //    A white-label partner's retailers fall back to that partner's default
  //    scheme; native users fall back to the native platform default.
  if (flags.schemeDefaultFallback) {
    const def = await getDefaultScheme(user.platformOwnerId ?? null);
    if (def) return { schemeId: def.id, schemeName: def.name, source: "DEFAULT_SCHEME" };
  }

  // 3. Nothing resolves — caller decides (gate blocks / resolver zeroes out).
  return { schemeId: null, schemeName: null, source: "NONE" };
}
