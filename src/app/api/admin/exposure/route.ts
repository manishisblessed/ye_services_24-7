import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-server";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { isPlatformStaff, hasTenantWideScope, tenantOwnerId, getTenantMemberIds } from "@/lib/security/ownership";
import { getMoneyAtRisk } from "@/lib/recon/exposure";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/money";

/**
 * GET /api/admin/exposure
 *
 * Consolidated money-at-risk snapshot: NEEDS_REVIEW payout + transaction exposure,
 * open outcome-anomaly exposure, and outstanding (ACTIVE) lien balances. Read-only.
 */

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireRole("MASTER_ADMIN", "ADMIN", "WHITELABEL_PARTNER");
    if (!isPlatformStaff(user) && !hasTenantWideScope(user))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (isPlatformStaff(user)) {
      const data = await getMoneyAtRisk();
      return NextResponse.json(data);
    }

    // Tenant staff: scope exposure to their own members only.
    const ownerId = tenantOwnerId(user);
    const memberIds = ownerId ? await getTenantMemberIds(ownerId) : [];
    const userFilter = memberIds.length ? { userId: { in: memberIds } } : { userId: "__none__" };

    const [payoutAgg, txnAgg, lienAgg] = await Promise.all([
      prisma.payoutRequest.aggregate({
        where: { status: "NEEDS_REVIEW", ...userFilter },
        _sum: { totalDebit: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { status: "NEEDS_REVIEW", isSettlement: false, ...userFilter },
        _sum: { amount: true, fee: true },
        _count: true,
      }),
      prisma.walletLien.aggregate({
        where: { status: "ACTIVE", ...userFilter },
        _sum: { amount: true, recoveredAmount: true },
        _count: true,
      }),
    ]);

    const payoutExposure = toNumber(payoutAgg._sum.totalDebit ?? 0);
    const txnExposure = toNumber(txnAgg._sum.amount ?? 0) + toNumber(txnAgg._sum.fee ?? 0);
    const lienOutstanding = Math.max(
      0,
      toNumber(lienAgg._sum.amount ?? 0) - toNumber(lienAgg._sum.recoveredAmount ?? 0)
    );

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      payoutReview: { count: payoutAgg._count, exposure: payoutExposure },
      txnReview: { count: txnAgg._count, exposure: txnExposure },
      txnAnomalies: { count: 0, exposure: 0 },
      outstandingLiens: { count: lienAgg._count, amount: lienOutstanding },
      totalAtRisk: payoutExposure + txnExposure + lienOutstanding,
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}
