import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth-server";
import {
  getCumulativeBalances,
  getUserWiseBalances,
  BALANCE_TIERS,
  type BalanceTier,
} from "@/lib/wallet/aggregates";
import { getPayinSummary, getLivePayinToday, getTopupsByUser, type PayinPeriod } from "@/lib/wallet/payin";
import { getRevenueWalletSummary } from "@/lib/commission/revenue";
import { isPlatformStaff } from "@/lib/security/ownership";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

const PAYIN_PERIODS: readonly PayinPeriod[] = ["today", "week", "month", "year"];

/**
 * GET /api/admin/wallet/aggregates
 *   ?view=cumulative                     → platform liability rollup by tier
 *   ?view=users&role=&q=&page=&pageSize= → user-wise balance listing
 *   ?view=payin&period=today|week|month|year → live payin rollup by rail (ledger)
 *   ?view=payin-today                    → TODAY's live business per rail (source; resets IST midnight)
 *   ?view=revenue                        → Revenue Wallet snapshot (MASTER_ADMIN only)
 */
export async function GET(req: Request) {
  try {
    const user = await requireRole("MASTER_ADMIN", "ADMIN", "FINANCE", "WHITELABEL_PARTNER");
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") ?? "cumulative";

    // The Revenue Wallet is company earnings — visible to the platform owner
    // (master-admin) only, never to plain admins / finance.
    if (view === "revenue") {
      if (user.role !== "MASTER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json(await getRevenueWalletSummary());
    }

    // Payin is platform-level acquiring data: only native platform staff see it.
    if (view === "payin-today") {
      if (!isPlatformStaff(user))
        return NextResponse.json({ totalCount: 0, totalAmount: 0, rails: [], since: new Date().toISOString(), asOf: new Date().toISOString() });
      return NextResponse.json(await getLivePayinToday());
    }

    if (view === "payin") {
      const periodParam = searchParams.get("period") ?? "today";
      const period = (PAYIN_PERIODS as readonly string[]).includes(periodParam)
        ? (periodParam as PayinPeriod)
        : "today";
      if (!isPlatformStaff(user))
        return NextResponse.json({ accountId: null, balance: 0, period, since: new Date().toISOString(), totalCount: 0, totalAmount: 0, rails: [], asOf: new Date().toISOString() });
      return NextResponse.json(await getPayinSummary(period));
    }

    if (view === "topups") {
      const periodParam = searchParams.get("period") ?? "today";
      const period = (PAYIN_PERIODS as readonly string[]).includes(periodParam)
        ? (periodParam as PayinPeriod)
        : "today";
      return NextResponse.json(await getTopupsByUser(period, user));
    }

    if (view === "users") {
      const roleParam = searchParams.get("role") ?? "ALL";
      const role = (BALANCE_TIERS as readonly string[]).includes(roleParam)
        ? (roleParam as BalanceTier)
        : "ALL";
      const data = await getUserWiseBalances({
        role,
        q: searchParams.get("q") ?? undefined,
        page: Number(searchParams.get("page") ?? 1),
        pageSize: Number(searchParams.get("pageSize") ?? 50),
        actor: user,
      });
      return NextResponse.json(data);
    }

    return NextResponse.json(await getCumulativeBalances(user));
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("[admin/wallet/aggregates] GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
