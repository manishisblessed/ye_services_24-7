import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-server";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { isPlatformStaff } from "@/lib/security/ownership";
import { getMoneyAtRisk } from "@/lib/recon/exposure";

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
    const user = await requireRole("MASTER_ADMIN", "ADMIN");
    if (!isPlatformStaff(user))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const data = await getMoneyAtRisk();
    return NextResponse.json(data);
  } catch (e) {
    return toErrorResponse(e);
  }
}
