import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import PDFDocument from "pdfkit";

/**
 * POST /api/receipt — generate a branded PDF receipt for any transaction.
 *
 * Accepts the same shape the client TransactionResult already holds, renders a
 * clean single-page PDF, and returns it with `Content-Disposition: attachment`.
 */
export const dynamic = "force-dynamic";

const Body = z.object({
  refId: z.string().min(4),
  service: z.string(),
  amount: z.number(),
  customer: z.string().optional(),
  meta: z.record(z.union([z.string(), z.number()])).optional(),
  status: z.enum(["SUCCESS", "PENDING", "FAILED"]).default("SUCCESS"),
  userCode: z.string().optional(),
});

// Layout constants
const W = 400;
const MARGIN = 36;
const CW = W - MARGIN * 2; // content width

const BRAND_GREEN = "#059669";
const AMBER = "#b45309";
const CORAL = "#be123c";
const INK = "#111827";
const MUTED = "#6b7280";
const LIGHT = "#e5e7eb";

function payByLine(userCode?: string): string {
  return userCode
    ? `Pay by BankingPoint24 by RT Code - ${userCode}`
    : "Pay by BankingPoint24";
}

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid receipt data" }, { status: 400 });
  }
  const r = parsed.data;
  const isFailed = r.status === "FAILED";
  const isPending = r.status === "PENDING";

  const headColor = isFailed ? CORAL : isPending ? AMBER : BRAND_GREEN;
  const headTitle = isFailed
    ? "Transaction Failed"
    : isPending
      ? "Transaction Pending"
      : "Transaction Successful";

  const date = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const doc = new PDFDocument({
    size: [W, 700],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    bufferPages: true,
    info: {
      Title: `Receipt — ${r.refId}`,
      Author: "BankingPoint24",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Uint8Array>((resolve) => {
    doc.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
  });

  // ── Header band ──────────────────────────────────────────────────────────
  const headerH = 140;
  doc.rect(0, 0, W, headerH).fill(headColor);

  doc.fillColor("#ffffff")
    .font("Helvetica-Bold").fontSize(15)
    .text(headTitle, MARGIN, 30, { width: CW, align: "center" });

  const amtStr = `\u20B9${r.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.font("Helvetica-Bold").fontSize(30)
    .text(amtStr, MARGIN, 60, { width: CW, align: "center" });

  doc.font("Helvetica").fontSize(10).fillColor("#ffffffcc")
    .text(r.service, MARGIN, 100, { width: CW, align: "center" });

  // ── Body rows ────────────────────────────────────────────────────────────
  let y = headerH + 24;
  const rowH = 32;
  const labelX = MARGIN;
  const valX = W - MARGIN;

  function row(label: string, value: string, mono = false) {
    doc.font("Helvetica").fontSize(10).fillColor(MUTED)
      .text(label, labelX, y + 8, { width: CW / 2 });
    doc.font(mono ? "Courier" : "Helvetica-Bold").fontSize(10).fillColor(INK)
      .text(value, labelX, y + 8, { width: CW, align: "right" });
    y += rowH;
    doc.strokeColor(LIGHT).lineWidth(0.5)
      .moveTo(MARGIN, y).lineTo(W - MARGIN, y).stroke();
  }

  row("Reference ID", r.refId, true);
  if (r.customer) row("Customer", r.customer);
  if (r.meta) {
    for (const [k, v] of Object.entries(r.meta)) {
      row(k, String(v));
    }
  }
  row("Date", date);

  // ── Footer ───────────────────────────────────────────────────────────────
  y += 20;
  doc.strokeColor(LIGHT).lineWidth(0.5).dash(3, { space: 3 })
    .moveTo(MARGIN, y).lineTo(W - MARGIN, y).stroke();
  doc.undash();

  y += 14;
  doc.font("Helvetica-Bold").fontSize(10).fillColor(BRAND_GREEN)
    .text(payByLine(r.userCode), MARGIN, y, { width: CW, align: "center" });
  y += 16;
  doc.font("Helvetica").fontSize(8).fillColor(MUTED)
    .text("BankingPoint24 \u2014 Powered by BBPS", MARGIN, y, { width: CW, align: "center" });

  doc.end();
  const pdfBytes = await done;

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Receipt-${r.refId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
