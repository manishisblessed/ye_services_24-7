"use client";

import { useSession, signOut } from "next-auth/react";
import { toDisplayRole, type RoleDisplay } from "./auth";

/**
 * Legacy session shape that existing dashboard components expect.
 * This bridges NextAuth's session format to what the UI already uses.
 */
export type LegacySession = {
  name: string;
  email: string;
  phone: string;
  role: RoleDisplay;
  walletBalance: number;
  monthlyTurnover?: number;
  loggedInAt: number;
  mustChangePassword?: boolean;
  userCode?: string;
  allowedTabs: string[];
  /** White-label tenancy — null/false for native BankingPoint24 accounts. */
  platformOwnerId: string | null;
  isTenantOwner: boolean;
  /** True when this account belongs to any white-label company. */
  isTenantMember: boolean;
};

/**
 * Drop-in replacement for the old getSession() pattern.
 * Components can use:
 *   const { session, loading } = useAuth();
 * instead of:
 *   const [session, setSession] = useState(null);
 *   useEffect(() => setSession(getSession()), []);
 */
export function useAuth() {
  const { data, status } = useSession();

  if (status === "loading" || !data?.user) {
    return { session: null, loading: status === "loading", signOut };
  }

  const user = data.user;
  const platformOwnerId = (user as any).platformOwnerId ?? null;
  const isTenantOwner = (user as any).isTenantOwner ?? false;
  const dbRole = (user as any).role ?? "RETAILER";
  const legacySession: LegacySession = {
    name: user.name ?? "",
    email: user.email ?? "",
    phone: (user as any).phone ?? "",
    role: toDisplayRole(dbRole),
    walletBalance: (user as any).walletBalance ?? 0,
    loggedInAt: Date.now(),
    userCode: (user as any).userCode ?? undefined,
    allowedTabs: (user as any).allowedTabs ?? [],
    platformOwnerId,
    isTenantOwner,
    isTenantMember:
      dbRole === "WHITELABEL_PARTNER" || isTenantOwner === true || Boolean(platformOwnerId),
  };

  return { session: legacySession, loading: false, signOut };
}
