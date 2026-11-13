"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  DeviceMobile,
  Fingerprint,
  PaperPlaneTilt,
  Receipt,
  SealCheck,
  Storefront,
  TrendUp,
  type Icon
} from "@phosphor-icons/react";
import { trustBadges } from "@/lib/data";
import { ButtonLink } from "./_shared/ButtonLink";
import { CountUp } from "./_shared/CountUp";

const easeOut = [0.22, 1, 0.36, 1] as const;

/* Day-summary lines printed on the counter receipt. */
type ReceiptLine = {
  icon: Icon;
  label: string;
  count: string;
  commission: string;
};

const RECEIPT_LINES: ReceiptLine[] = [
  { icon: Fingerprint, label: "AePS cash withdrawals", count: "× 22", commission: "₹132.00" },
  { icon: PaperPlaneTilt, label: "Money transfers", count: "× 14", commission: "₹112.00" },
  { icon: Receipt, label: "Bill payments (BBPS)", count: "× 26", commission: "₹167.40" },
  { icon: DeviceMobile, label: "Recharges & data", count: "× 31", commission: "₹93.20" },
  { icon: CreditCard, label: "Card taps on POS", count: "× 12", commission: "₹58.10" }
];

/* Shop types that run a BankingPoint24 counter — scrolls under the hero. */
const SHOP_TYPES = [
  "Kirana stores",
  "Mobile & recharge shops",
  "Travel agencies",
  "Medical stores",
  "Stationery shops",
  "Cyber cafés",
  "Photo studios",
  "Electronics counters",
  "Tea stalls",
  "Garment shops",
  "Hardware stores",
  "Dairy booths"
];

export function HeroConsole() {
  const reduce = useReducedMotion();

  const enter = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, ease: easeOut, delay: 0.08 + i * 0.1 }
  });

  return (
    <section className="relative overflow-hidden bg-[#f6faf2] text-ink-900">
      {/* Backdrop — light paper, faint grid, green + navy washes */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="grid-bg mask-fade-y absolute inset-0 opacity-[0.5]" />
        <div className="absolute -left-40 top-[-160px] h-[480px] w-[480px] rounded-full bg-accent-200/50 blur-3xl" />
        <div className="absolute -right-32 top-24 h-[420px] w-[420px] rounded-full bg-royal-100/60 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="container-x relative z-10 pb-12 pt-28 md:pt-36">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
          {/* ── Copy ── */}
          <div className="lg:col-span-6">
            <motion.p
              {...enter(0)}
              className="inline-flex items-center gap-2.5 rounded-full border border-accent-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-700 shadow-sm"
            >
              <Storefront size={13} weight="fill" className="text-accent-500" aria-hidden />
              India&rsquo;s neighbourhood banking network
            </motion.p>

            <motion.h1
              {...enter(1)}
              className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.025em] text-brand-900 sm:text-5xl lg:text-[3.5rem]"
            >
              One counter.{" "}
              <span className="gradient-text [background-image:linear-gradient(110deg,#4a8a2b,#61a93a,#1f3b8b)]">
                Sixty ways to earn.
              </span>
            </motion.h1>

            <motion.p
              {...enter(2)}
              className="mt-6 max-w-xl text-base leading-relaxed text-ink-600 md:text-lg"
            >
              Cash withdrawals, money transfers, 1,600+ billers, recharges, travel and
              card payments — served from the counter you already own. Commission lands
              in your wallet the second a transaction clears.
            </motion.p>

            <motion.div {...enter(3)} className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/register" size="lg">
                Become a partner
                <ArrowRight size={16} weight="bold" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/services" size="lg" variant="outline">
                See services &amp; rates
              </ButtonLink>
            </motion.div>

            <motion.ul
              {...enter(4)}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-500"
            >
              {["e-KYC in 5 minutes", "Earn from day one"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle size={14} weight="fill" className="text-accent-500" aria-hidden />
                  {t}
                </li>
              ))}
            </motion.ul>

            {/* Trust badges */}
            <motion.ul {...enter(5)} className="mt-10 flex flex-wrap gap-2">
              {trustBadges.map((b) => (
                <li
                  key={b.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-500 shadow-sm"
                >
                  <SealCheck size={13} weight="duotone" className="text-accent-600" aria-hidden />
                  {b.label}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ── Counter receipt ── */}
          <div className="lg:col-span-6">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 40, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: 1.2 }}
              transition={{ duration: 0.8, ease: easeOut, delay: 0.25 }}
              className="relative mx-auto max-w-md"
            >
              <ReceiptCard reduce={Boolean(reduce)} />

              {/* Floating payout chip */}
              <motion.div
                initial={reduce ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: easeOut, delay: 1 }}
                className="absolute -right-6 top-10 hidden -rotate-2 rounded-2xl border border-accent-200 bg-white px-4 py-3 shadow-energy-sm sm:block"
              >
                <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                  <TrendUp size={12} weight="bold" className="text-accent-600" aria-hidden />
                  Payout received
                </p>
                <p className="mt-0.5 font-display text-lg font-semibold text-accent-700">
                  <CountUp value="₹9,420" />
                </p>
              </motion.div>

              {/* Floating network chip */}
              <motion.div
                initial={reduce ? false : { opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: easeOut, delay: 1.2 }}
                className="absolute -left-8 bottom-16 hidden rotate-1 items-center gap-2.5 rounded-2xl bg-brand-900 px-4 py-3 text-white shadow-energy sm:flex"
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">
                  <Storefront size={16} weight="duotone" className="text-accent-300" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold">New counter live</p>
                  <p className="text-[10px] text-white/50">Mogri, Anand · 2 min ago</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Who runs a counter — light marquee of shop types */}
      <div className="relative z-10 border-t border-ink-100/70 bg-white/60 py-4 backdrop-blur-sm">
        <div className="mask-fade-x overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 pr-8">
            {[...SHOP_TYPES, ...SHOP_TYPES].map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] text-ink-400"
              >
                <span className="h-1 w-1 rounded-full bg-accent-500" aria-hidden />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── The printed "day summary" receipt ───────────────────────────── */
function ReceiptCard({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-t-3xl bg-white shadow-energy ring-1 ring-ink-100">
      {/* Header */}
      <div className="border-b border-dashed border-ink-200 px-6 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-700">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden />
              BankingPoint24 · Day summary
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-ink-900">
              Shree Umiya General Store
            </p>
            <p className="text-[11px] text-ink-400">Anand, Gujarat · Counter BP-10482</p>
          </div>
          <span className="rounded-xl bg-accent-50 px-2.5 py-1.5 text-center ring-1 ring-inset ring-accent-200">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-accent-700">Today</span>
            <span className="block font-display text-sm font-semibold text-accent-800">105 txns</span>
          </span>
        </div>
      </div>

      {/* Lines */}
      <ul className="px-6 py-4" aria-label="Today's counter earnings (demo)">
        {RECEIPT_LINES.map((line, i) => {
          const LineIcon = line.icon;
          return (
            <motion.li
              key={line.label}
              initial={reduce ? false : { opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: easeOut, delay: 0.5 + i * 0.12 }}
              className="flex items-center gap-3 border-b border-ink-50 py-2.5 last:border-0"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-brand-700">
                <LineIcon size={16} weight="duotone" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-ink-800">{line.label}</span>
                <span className="block text-[11px] tabular-nums text-ink-400">{line.count}</span>
              </span>
              <span className="text-sm font-semibold tabular-nums text-accent-700">{line.commission}</span>
            </motion.li>
          );
        })}
      </ul>

      {/* Total */}
      <div className="border-t border-dashed border-ink-200 px-6 py-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
              Commission earned today
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-[-0.02em] text-brand-900">
              <CountUp value="₹562.70" />
            </p>
          </div>
          <p className="pb-1 text-right text-[11px] leading-snug text-ink-400">
            Float left: <span className="font-semibold tabular-nums text-ink-600">₹31,240</span>
            <br />
            Settles T+1, 9 AM
          </p>
        </div>

        {/* Barcode strip */}
        <div
          aria-hidden
          className="mt-4 h-8 w-full rounded-sm opacity-70 [background:repeating-linear-gradient(90deg,#0e1626_0px,#0e1626_2px,transparent_2px,transparent_5px,#0e1626_5px,#0e1626_6px,transparent_6px,transparent_10px)]"
        />
        <p className="mt-1.5 text-center text-[9px] font-medium uppercase tracking-[0.3em] text-ink-300">
          bankingpoint-24.com
        </p>
      </div>

      {/* Torn receipt bottom edge */}
      <div
        aria-hidden
        className="h-3 w-full bg-white [mask:radial-gradient(circle_at_6px_0,transparent_5px,#000_5.5px)] [mask-size:12px_100%] [mask-repeat:repeat-x]"
      />
    </div>
  );
}
