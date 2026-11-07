import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";
import { toErrorResponse } from "@/lib/security/apiErrors";
import { priceSchemeSettlement } from "@/lib/settlement/engine";
import { resolveUpiSelection } from "@/lib/partners";
import { toNumber } from "@/lib/money";

/**
 * Real-time MDR quote for a potential top-up — shows the user what they will
 * actually receive (net) for a given gross amount on a given channel.
 *
 * POST /api/wallet/topup/quote  { amount, channel? }
 * => { gross, mdr, net, schemeId? }
 */
export const dynamic = "force-dynamic";

const Body = z.object({
  amount: z.number().positive().max(500_000),
  channel: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth();
    await enforceRateLimit(`wallet:topup:quote:${user.id}`, RATE_LIMITS.default);
  } catch (e) {
    return toErrorResponse(e);
  }

  const body = Body.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { amount, channel } = body.data;
  const sel = resolveUpiSelection(channel);
  const scopeKey = sel.provider.name;

  const price = await priceSchemeSettlement({
    userId: user.id,
    serviceKind: "PG",
    grossAmount: amount,
    paymentMode: "UPI",
    scopeKey,
    settlementType: "T0",
    anyPaymentMode: true,
  });

  if (!price) {
    return NextResponse.json({ gross: amount, mdr: 0, net: amount, schemeId: null });
  }

  return NextResponse.json({
    gross: amount,
    mdr: toNumber(price.mdrAmount),
    net: toNumber(price.netAmount),
    schemeId: price.schemeId ?? null,
  });
}
