"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  Copy,
  Check,
  IndianRupee,
  ArrowLeftRight,
  Percent,
  Banknote,
  RefreshCw,
} from "lucide-react";
import { LinkSimple, Lightning, ShieldCheck } from "@phosphor-icons/react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/Icon";
import { ServiceLayout, ServiceCard } from "@/components/dashboard/services/ServiceLayout";
import { SummaryPanel, AsideTips } from "@/components/dashboard/services/SummaryPanel";
import { AmountChips } from "@/components/dashboard/services/AmountChips";
import { FloatField } from "@/components/dashboard/services/FloatField";
import { formatINR, generateRefId, cn } from "@/lib/utils";

type PgTxn = {
  id: string;
  refId: string;
  amount: number;
  fee: number | null;
  status: string;
  partner: string | null;
  partnerTxnId: string | null;
  createdAt: string;
  errorMessage: string | null;
};

type TrendPoint = { day: string; volume: number; count: number };

type PgOverview = {
  todayVolume: number;
  todayCount: number;
  trend: TrendPoint[];
  transactions: PgTxn[];
};

export default function PgPage() {
  const [data, setData] = useState<PgOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pg/overview");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  function createLink() {
    if (!amount) return;
    const ref = generateRefId("PAY");
    setLink(`https://pay.bankingpoint-24.com/l/${ref.toLowerCase()}?am=${amount}`);
    setCopied(false);
  }

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const successCount = data?.transactions.filter((t) => t.status === "SUCCESS").length ?? 0;
  const totalCount = data?.transactions.length ?? 0;
  const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : "—";

  const cols: Column<PgTxn>[] = [
    {
      key: "refId",
      header: "Ref ID",
      render: (r) => <span className="font-mono text-xs">{r.refId}</span>,
    },
    {
      key: "partner",
      header: "Gateway",
      render: (r) => <span className="text-xs text-ink-600">{r.partner ?? "—"}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (r) => <span className="font-semibold tabular-nums">{formatINR(r.amount)}</span>,
    },
    {
      key: "fee",
      header: "Fee",
      align: "right",
      render: (r) =>
        r.fee ? (
          <span className="tabular-nums text-amber-700">{formatINR(r.fee)}</span>
        ) : (
          <span className="text-ink-300">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge
          variant={
            r.status === "SUCCESS"
              ? "success"
              : r.status === "PROCESSING" || r.status === "INITIATED"
                ? "warning"
                : r.status === "HOLD"
                  ? "brand"
                  : "danger"
          }
        >
          {r.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (r) => (
        <span className="text-xs text-ink-500">
          {new Date(r.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payment Gateway"
        title="PG Collections"
        description="Accept UPI, cards, net banking and wallets. Track every order with real-time status and automated settlement."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Collections"
          value={formatINR(data?.todayVolume ?? 0)}
          icon={IndianRupee}
          tone="brand"
          loading={loading && !data}
        />
        <StatCard
          label="Success Rate"
          value={typeof successRate === "string" ? successRate : `${successRate}%`}
          icon={Percent}
          tone="accent"
          loading={loading && !data}
        />
        <StatCard
          label="Transactions Today"
          value={String(data?.todayCount ?? 0)}
          icon={ArrowLeftRight}
          accent="emerald"
          loading={loading && !data}
        />
        <StatCard
          label="7-Day Volume"
          value={formatINR(data?.trend.reduce((s, t) => s + t.volume, 0) ?? 0)}
          icon={Banknote}
          accent="violet"
          loading={loading && !data}
        />
      </div>

      <ServiceLayout
        aside={
          <>
            <SummaryPanel
              title="Payment link"
              status={
                link
                  ? { label: "Link ready", variant: "accent", dot: true }
                  : { label: "Not generated", variant: "default" }
              }
              rows={[
                { label: "Purpose", value: purpose || "Payment request", muted: !purpose },
                { label: "Accepts", value: "UPI \u00b7 Cards \u00b7 Net banking" },
                { label: "Settlement", value: "T+1 \u00b7 automated", tone: "brand" },
              ]}
              total={amount ? formatINR(Number(amount) || 0) : undefined}
              totalLabel="Customer pays"
              footer={
                link ? (
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-ink-100">
                    <span className="truncate font-mono text-xs font-semibold text-ink-900">{link}</span>
                    <button
                      type="button"
                      onClick={copy}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-ink-100 transition hover:ring-brand-300 focus-energy"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <div className="grid h-20 place-items-center rounded-2xl border border-dashed border-ink-200 bg-white/60 text-xs text-ink-500">
                    Enter an amount and generate a link to see it here.
                  </div>
                )
              }
            />
            <AsideTips
              items={[
                { icon: <Lightning weight="duotone" />, text: "You're notified the moment the customer pays." },
                { icon: <ShieldCheck weight="duotone" />, text: "Every order is tracked with real-time status." },
              ]}
            />
          </>
        }
      >
        <ServiceCard
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            createLink();
          }}
          icon={<IconTile icon={LinkSimple} tone="energy" size="lg" />}
          eyebrow="Collect remotely"
          title="Create payment link"
          description="Set an amount and a purpose \u2014 share the link on WhatsApp or SMS."
        >
          <div className="grid gap-5">
            <div>
              <FloatField
                id="pg-amount"
                label="Amount (\u20b9)"
                type="number"
                display
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <AmountChips
                className="mt-3"
                amounts={[500, 1000, 2000, 5000, 10000]}
                value={amount}
                onPick={(v) => setAmount(String(v))}
              />
            </div>
            <FloatField
              id="pg-purpose"
              label="Purpose (optional)"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              hint="e.g. Invoice #4427"
            />
            <Button type="submit" size="xl" className="w-full">
              <CreditCard className="h-4 w-4" /> Generate link
            </Button>
          </div>
        </ServiceCard>
      </ServiceLayout>

      <DataTable<PgTxn>
        title="Recent PG transactions"
        description="All orders collected through your payment gateway."
        columns={cols}
        data={data?.transactions ?? []}
        loading={loading && !data}
        emptyIcon={CreditCard}
        empty="No PG transactions yet."
        action={
          <Button type="button" variant="outline" size="sm" onClick={fetchOverview} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        }
      />
    </div>
  );
}
