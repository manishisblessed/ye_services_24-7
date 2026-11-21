import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { listHeldPayouts } from "@/lib/payout/service";
import { toNumber } from "@/lib/money";
import { isPlatformStaff, hasTenantWideScope, tenantOwnerId, getTenantMemberIds } from "@/lib/security/ownership";

/**
 * Admin "Held payouts" queue.
 *
 * Lists payouts parked in NEEDS_REVIEW — an INDETERMINATE send outcome (lost
 * transfer response / timeout / 5xx) where the bank MAY have disbursed. The hold
 * is NOT released; the recon sweep tries reference recovery + poll automatically,
 * and an operator resolves each against the rail via POST /api/admin/payouts/resolve.
 */

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireRole("MASTER_ADMIN", "ADMIN", "WHITELABEL_PARTNER");
    if (!isPlatformStaff(admin) && !hasTenantWideScope(admin))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const ownerId = tenantOwnerId(admin);
    const memberIds = ownerId ? await getTenantMemberIds(ownerId) : null;

    const items = await listHeldPayouts(200, memberIds);

    const exposureAgg = await prisma.payoutRequest.aggregate({
      where: { status: "NEEDS_REVIEW", ...(memberIds ? { userId: { in: memberIds } } : {}) },
      _sum: { totalDebit: true },
    });
    const exposure = toNumber(exposureAgg._sum.totalDebit ?? 0);

    return NextResponse.json({ items, total: items.length, exposure });
  } catch (e) {
    return toErrorResponse(e);
  }
}
