import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { prisma } from "@/lib/db";

/**
 * PG overview stats for the dashboard — today's volume, success count,
 * recent transactions, and 7-day trend. Pulls from both CHAGANS_PG
 * and VIABLE_PG partners.
 */
export const dynamic = "force-dynamic";

const PG_PARTNERS = ["CHAGANS_PG", "VIABLE_PG", "RAZORPAY"];

function startOfTodayIST(): Date {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  ist.setHours(0, 0, 0, 0);
  const offset = now.getTime() - ist.getTime();
  return new Date(now.getTime() - (now.getTime() - ist.getTime()) + offset - offset);
}

export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    return toErrorResponse(e);
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400_000);

  const [todayAgg, recentTxns, trendRaw] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        service: "WALLET_TOPUP",
        partner: { in: PG_PARTNERS },
        status: "SUCCESS",
        createdAt: { gte: todayStart },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        service: "WALLET_TOPUP",
        partner: { in: PG_PARTNERS },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        refId: true,
        amount: true,
        fee: true,
        status: true,
        partner: true,
        partnerTxnId: true,
        createdAt: true,
        errorMessage: true,
      },
    }),
    prisma.$queryRaw<{ day: string; volume: unknown; count: bigint }[]>`
      SELECT
        TO_CHAR("createdAt" AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS day,
        SUM(amount) AS volume,
        COUNT(*)::bigint AS count
      FROM "Transaction"
      WHERE "userId" = ${user.id}
        AND service = 'WALLET_TOPUP'
        AND partner = ANY(${PG_PARTNERS})
        AND status = 'SUCCESS'
        AND "createdAt" >= ${sevenDaysAgo}
      GROUP BY day
      ORDER BY day
    `,
  ]);

  const trend = trendRaw.map((r) => ({
    day: r.day,
    volume: Number(r.volume ?? 0),
    count: Number(r.count),
  }));

  return NextResponse.json({
    todayVolume: todayAgg._sum.amount ? Number(todayAgg._sum.amount) : 0,
    todayCount: todayAgg._count,
    trend,
    transactions: recentTxns.map((t) => ({
      id: t.id,
      refId: t.refId,
      amount: Number(t.amount),
      fee: t.fee ? Number(t.fee) : null,
      status: t.status,
      partner: t.partner,
      partnerTxnId: t.partnerTxnId,
      createdAt: t.createdAt.toISOString(),
      errorMessage: t.errorMessage,
    })),
  });
}
