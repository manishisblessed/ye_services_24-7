import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseChagansWebhook } from "@/lib/partners/chagans-pg";
import { settleTopup, type VerifiedPayin } from "@/lib/wallet/topup";
import { logger } from "@/lib/logger";
import { sendOpsAlert } from "@/lib/monitoring/alerts";

/**
 * Chagans PG webhook receiver.
 *
 * Chagans pushes a POST with the collect outcome — this is the ONLY crediting
 * path for Chagans (there is no status-pull API). The webhook is authenticated
 * by source-IP allow-list.
 *
 * Allowed IPs (Chagans infra):
 *   103.160.106.129
 *   103.160.160.129
 *   34.126.212.125
 *
 * Our server IP whitelisted with Chagans:
 *   13.55.164.240
 */
export const dynamic = "force-dynamic";

const ALLOWED_IPS = new Set([
  "103.160.106.129",
  "103.160.160.129",
  "34.126.212.125",
]);

function extractIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  const ip = extractIp(req);

  if (!ALLOWED_IPS.has(ip)) {
    logger.warn({ action: "chagans_webhook_blocked", ip, reason: "ip_not_allowed" });
    return NextResponse.json({ status: "BLOCKED" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "BAD_REQUEST" }, { status: 400 });
  }

  const parsed = parseChagansWebhook(body);

  logger.info({
    action: "chagans_webhook_received",
    ip,
    orderId: parsed.orderId,
    txnId: parsed.txnId,
    transactionId: parsed.transactionId,
    status: parsed.status,
    amount: parsed.amount,
    reference: parsed.reference,
    paymentMode: parsed.paymentMode,
    rawStatus: parsed.rawStatus,
  });

  // Look up our transaction by the Chagans orderId (stored in partnerTxnId).
  const orderKey = parsed.orderId ?? parsed.txnId;
  if (!orderKey) {
    logger.warn({ action: "chagans_webhook_no_key", body });
    return NextResponse.json({ status: "NO_KEY" }, { status: 400 });
  }

  const txn = await prisma.transaction.findFirst({
    where: {
      OR: [
        { partnerTxnId: orderKey },
        { refId: orderKey },
      ],
      service: "WALLET_TOPUP",
    },
  });

  if (!txn) {
    logger.warn({ action: "chagans_webhook_txn_not_found", orderKey });
    return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });
  }

  if (txn.status === "SUCCESS") {
    return NextResponse.json({ status: "ALREADY_SETTLED" });
  }

  // Build the trusted VerifiedPayin from the parsed webhook.
  const verified: VerifiedPayin = {
    status: parsed.status === "PAID" ? "PAID" : parsed.status === "EXPIRED" ? "EXPIRED" : "FAILED",
    amount: parsed.amount,
    reference: parsed.reference,
    providerRef: parsed.transactionId ?? parsed.orderId,
    paymentMode: parsed.paymentMode,
  };

  try {
    const result = await settleTopup(txn.refId, verified);
    logger.info({
      action: "chagans_webhook_settled",
      refId: txn.refId,
      result: result.status,
      verifiedAmount: parsed.amount,
      utr: parsed.reference,
    });
    return NextResponse.json({ status: result.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error({ action: "chagans_webhook_settle_error", refId: txn.refId, error: msg });
    await sendOpsAlert({
      title: "Chagans webhook settlement error",
      severity: "critical",
      details: { refId: txn.refId, error: msg, orderKey },
      href: "/dashboard/admin/audit",
    });
    return NextResponse.json({ status: "ERROR", message: msg }, { status: 500 });
  }
}
