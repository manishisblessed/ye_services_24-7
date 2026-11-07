/**
 * Instant wallet top-up via the UPI/PG partner (Viable PG, Chagans PG,
 * Razorpay, or mock fallback — whatever resolveUpiSelection resolves).
 *
 * Lifecycle:
 *   initiateTopup  -> Transaction(WALLET_TOPUP, INITIATED) + provider collect
 *                     (referenceId = our Transaction.refId)
 *   settleTopup    -> verifies status WITH THE PROVIDER or accepts a trusted
 *                     webhook payload (VerifiedPayin), then atomically marks
 *                     SUCCESS and credits the wallet. For PG_MDR_PROVIDERS the
 *                     credit is net-of-MDR via handleTopupCapture.
 *                     Idempotent: the ledger credit carries idempotencyKey
 *                     `topup:<txnId>` so webhook + poll + admin retry can all
 *                     race safely.
 */
import { customAlphabet } from "nanoid";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { creditWallet, schedulePosRentalRetryIfNeeded } from "../ledger";
import {
  assertRealMoneyProvider,
  resolveUpiSelection,
  getUpiProviderByName,
  isWebhookOnlyPartner,
} from "../partners";
import { round, toNumber } from "../money";
import { emitWebhookEvent } from "../platform/webhooks";
import { sendOpsAlert } from "../monitoring/alerts";
import { logger } from "../logger";
import { isAmountMismatch } from "./guards";
import { assertPushWithinCap, WalletOpError } from "./operations";
import { handleTopupCapture } from "../settlement/pg";

const topupId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 12);

/**
 * Providers whose payins are credited net-of-MDR via the PG settlement
 * engine (handleTopupCapture). All other providers credit the FULL amount.
 */
const PG_MDR_PROVIDERS = new Set(["CHAGANS_PG"]);

function isPgMdrProvider(name?: string | null): boolean {
  return PG_MDR_PROVIDERS.has((name ?? "").toUpperCase());
}

export type TopupState = "INITIATED" | "PROCESSING" | "SUCCESS" | "FAILED" | "HOLD";

export class TopupError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode = 400, public code = "TOPUP_ERROR") {
    super(message);
    this.name = "TopupError";
    this.statusCode = statusCode;
  }
}

/**
 * Trusted verification from a provider webhook — bypasses the status-pull path
 * entirely. Fields mirror UpiStatusOutput but come from the webhook body.
 */
export type VerifiedPayin = {
  status: "PAID" | "FAILED" | "EXPIRED";
  amount?: number;
  reference?: string;
  providerRef?: string;
};

export async function initiateTopup(input: {
  userId: string;
  amount: number;
  vpa?: string;
  note?: string;
  customerName?: string;
  customerPhone: string;
  customerEmail?: string;
  /** PG gateway channel id (e.g. "chagans:comet"). */
  channel?: string;
  ip?: string;
}): Promise<{ refId: string; orderId: string; paymentUrl?: string; upiIntent?: string; provider: string }> {
  try {
    await assertPushWithinCap(input.userId, "PRIMARY", input.amount);
  } catch (e) {
    if (e instanceof WalletOpError) throw new TopupError(e.message, 400, e.code);
    throw e;
  }

  const sel = resolveUpiSelection(input.channel);
  const upi = sel.provider;

  assertRealMoneyProvider(
    upi,
    () =>
      new TopupError(
        "Wallet top-up is temporarily unavailable. Please try again later.",
        503,
        "PG_NOT_LIVE",
      ),
  );

  if (sel.maxAmount && input.amount > sel.maxAmount) {
    throw new TopupError(
      `Amount exceeds the maximum \u20b9${sel.maxAmount.toLocaleString("en-IN")} for this channel.`,
      400,
      "AMOUNT_EXCEEDS_MAX",
    );
  }

  const refId = `TOPUP${topupId()}`;
  const collectAmount = sel.prepareAmount(toNumber(round(input.amount)));

  const txn = await prisma.transaction.create({
    data: {
      refId,
      userId: input.userId,
      service: "WALLET_TOPUP",
      amount: new Prisma.Decimal(collectAmount),
      status: "INITIATED",
      customer: input.customerPhone,
      partner: upi.name,
      request: {
        amount: input.amount,
        collectAmount,
        vpa: input.vpa ?? null,
        note: input.note ?? null,
        channel: input.channel ?? null,
        gatewayId: sel.channel ?? null,
      } as Prisma.InputJsonValue,
      ipAddress: input.ip,
    },
  });

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/return?ref=${refId}`;

  const r = await upi.collect({
    userId: input.userId,
    idempotencyKey: refId,
    amount: collectAmount,
    vpa: input.vpa,
    note: input.note ?? "Wallet top-up",
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    channel: sel.channel,
    callbackUrl,
  });

  if (!r.ok) {
    await prisma.transaction.update({
      where: { id: txn.id },
      data: { status: "FAILED", errorCode: r.code, errorMessage: r.message },
    });
    throw new TopupError(r.message, 502, r.code);
  }

  await prisma.transaction.update({
    where: { id: txn.id },
    data: {
      status: "PROCESSING",
      partnerTxnId: r.data.orderId,
      response: {
        paymentUrl: r.data.paymentUrl ?? null,
        upiIntent: r.data.upiIntent ?? null,
      } as Prisma.InputJsonValue,
    },
  });

  return {
    refId,
    orderId: r.data.orderId,
    paymentUrl: r.data.paymentUrl,
    upiIntent: r.data.upiIntent,
    provider: upi.name,
  };
}

/**
 * Settle a top-up — either from a provider webhook (webhookVerified) or by
 * polling the provider's status API. Safe to call from the status endpoint,
 * the PG webhook, and recon — all paths converge on the same idempotent credit.
 */
export async function settleTopup(
  refId: string,
  webhookVerified?: VerifiedPayin,
): Promise<{ refId: string; status: TopupState }> {
  const txn = await prisma.transaction.findUnique({ where: { refId } });
  if (!txn || txn.service !== "WALLET_TOPUP") {
    throw new TopupError("Top-up not found", 404, "NOT_FOUND");
  }
  if (txn.status === "SUCCESS") return { refId, status: "SUCCESS" };
  if (txn.status === "FAILED") return { refId, status: "FAILED" };

  // ------- Determine paid / failed / pending ---------------------------
  let paid = false;
  let failed = false;
  let verifiedAmount: number | undefined;
  let utr: string | null = null;
  let providerRef: string | null = null;

  if (webhookVerified) {
    paid = webhookVerified.status === "PAID";
    failed = webhookVerified.status === "FAILED" || webhookVerified.status === "EXPIRED";
    verifiedAmount = webhookVerified.amount;
    utr = webhookVerified.reference ?? null;
    providerRef = webhookVerified.providerRef ?? null;
  } else if (isWebhookOnlyPartner(txn.partner)) {
    // Webhook-only providers (Chagans PG) have no status API — nothing to poll.
    return { refId, status: txn.status as TopupState };
  } else {
    const upi = getUpiProviderByName(txn.partner);
    assertRealMoneyProvider(
      upi,
      () =>
        new TopupError(
          "Wallet top-up settlement is unavailable. Please contact support.",
          503,
          "PG_NOT_LIVE",
        ),
    );

    const r = await upi.status(txn.partnerTxnId || refId);
    if (!r.ok) throw new TopupError(r.message, 502, r.code);

    paid = r.data.status === "PAID";
    failed = r.data.status === "FAILED" || r.data.status === "EXPIRED";
    verifiedAmount = r.data.amount;
    utr = r.data.reference ?? null;
  }

  // ------- PAID --------------------------------------------------------
  if (paid) {
    // MONEY-SAFETY: never credit unless the verified amount matches what we
    // initiated. A mismatch is anomalous, so we HOLD for manual ops review.
    if (isAmountMismatch(verifiedAmount, Number(txn.amount))) {
      const held = await prisma.transaction.updateMany({
        where: { id: txn.id, status: { in: ["INITIATED", "PROCESSING"] } },
        data: {
          status: "HOLD",
          errorCode: "AMOUNT_MISMATCH",
          errorMessage: `Verified \u20b9${verifiedAmount} \u2260 initiated \u20b9${txn.amount}`,
        },
      });
      if (held.count > 0) {
        await prisma.auditLog.create({
          data: {
            userId: txn.userId,
            action: "wallet.topup_amount_mismatch",
            entity: "Transaction",
            entityId: txn.id,
            meta: { refId, initiated: txn.amount.toString(), verified: verifiedAmount, utr },
          },
        });
        await sendOpsAlert({
          title: "Wallet top-up amount mismatch \u2014 HELD (not credited)",
          severity: "critical",
          details: { refId, initiated: txn.amount.toString(), verified: verifiedAmount, provider: txn.partner ?? "" },
          href: "/dashboard/admin/audit",
        });
      }
      return { refId, status: "HOLD" };
    }

    // ------ PG-MDR providers credit NET-of-MDR via the settlement engine ------
    if (isPgMdrProvider(txn.partner)) {
      const gross = toNumber(txn.amount);
      const scopeKey = txn.partner ?? "CHAGANS_PG";
      const result = await handleTopupCapture({
        transactionId: txn.id,
        grossAmount: gross,
        paymentMode: "UPI",
        providerRef: providerRef ?? utr ?? undefined,
        scopeKey,
      });
      if (result.status === "NO_SCHEME") {
        await sendOpsAlert({
          title: "Wallet top-up: no MDR scheme found \u2014 credit blocked",
          severity: "critical",
          details: { refId, gross, provider: txn.partner ?? "", txnId: txn.id },
          href: "/dashboard/admin/audit",
        });
      }
      logger.info({
        action: "wallet.topup_pg_mdr_settled",
        refId,
        topupId: txn.partnerTxnId,
        gross,
        net: result.netAmount,
        mdr: result.mdrAmount,
        provider: txn.partner,
        utr,
      });

      void schedulePosRentalRetryIfNeeded(txn.userId);

      void emitWebhookEvent(txn.userId, "topup.credited", {
        refId,
        amount: result.netAmount ?? gross,
        provider: txn.partner,
        utr,
      });

      return {
        refId,
        status: result.status === "SETTLED" || result.status === "DUPLICATE" ? "SUCCESS" : "FAILED",
      };
    }

    // ------ Non-MDR providers: FULL credit ------
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.transaction.updateMany({
        where: { id: txn.id, status: { in: ["INITIATED", "PROCESSING"] } },
        data: {
          status: "SUCCESS",
          response: { utr, verifiedAmount: verifiedAmount ?? null, settledAt: new Date().toISOString() } as Prisma.InputJsonValue,
        },
      });
      if (claimed.count === 0) return;
      await creditWallet(
        {
          userId: txn.userId,
          amount: txn.amount,
          reason: "TOPUP",
          refType: "Transaction",
          refId: txn.id,
          note: `Wallet top-up ${refId}`,
          idempotencyKey: `topup:${txn.id}`,
        },
        tx,
      );
      await tx.auditLog.create({
        data: {
          userId: txn.userId,
          action: "wallet.topup_credited",
          entity: "Transaction",
          entityId: txn.id,
          meta: { refId, amount: txn.amount.toString(), provider: txn.partner, utr },
        },
      });
    });

    logger.info({
      action: "wallet.topup_settled",
      refId,
      topupId: txn.partnerTxnId,
      amount: Number(txn.amount),
      utr,
      provider: txn.partner,
    });

    void schedulePosRentalRetryIfNeeded(txn.userId);

    void emitWebhookEvent(txn.userId, "topup.credited", {
      refId,
      amount: Number(txn.amount),
      provider: txn.partner,
      utr,
    });

    return { refId, status: "SUCCESS" };
  }

  // ------- FAILED / EXPIRED -------------------------------------------
  if (failed) {
    await prisma.transaction.updateMany({
      where: { id: txn.id, status: { in: ["INITIATED", "PROCESSING"] } },
      data: { status: "FAILED", errorCode: "PAYMENT_FAILED" },
    });
    return { refId, status: "FAILED" };
  }

  return { refId, status: "PROCESSING" };
}
