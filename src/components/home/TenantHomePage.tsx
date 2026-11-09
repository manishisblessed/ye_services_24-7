"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  DeviceMobile,
  Fingerprint,
  Globe,
  Headset,
  Lightning,
  Money,
  PaperPlaneTilt,
  QrCode,
  Receipt,
  Rocket,
  SealCheck,
  ShieldCheck,
  Storefront,
  TrendUp,
  Users,
  Wallet,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import type { TenantBrand } from "@/lib/tenant/context";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

/* ── Service tiles shown on the partner landing page ─────────────────────── */
type ServiceTile = {
  icon: PhosphorIcon;
  title: string;
  desc: string;
};

const SERVICES: ServiceTile[] = [
  { icon: Fingerprint, title: "AePS Cash Point", desc: "Cash withdrawals with just a thumb impression — be the bank on your street." },
  { icon: PaperPlaneTilt, title: "Money Transfer", desc: "IMPS to any bank, any hour — even Sundays and holidays." },
  { icon: QrCode, title: "QR Payments", desc: "Speaker-announced UPI collections at your counter." },
  { icon: CreditCard, title: "Payment Gateway", desc: "Accept online payments via UPI, cards and net banking." },
  { icon: Receipt, title: "Bill Payments", desc: "1,600+ billers through BBPS — electricity, water, gas, DTH and more." },
  { icon: DeviceMobile, title: "Recharges", desc: "Prepaid, DTH and broadband top-ups — instant confirmation." },
  { icon: Money, title: "Card Machine (POS)", desc: "Tap, swipe and scan — pocket-size Android terminal at your counter." },
  { icon: Wallet, title: "Float Wallet", desc: "One float runs every service all day. Top up once, earn all day." },
];

/* ── Stats bar ───────────────────────────────────────────────────────────── */
const STATS = [
  { value: "60+", label: "Services live" },
  { value: "1,600+", label: "Billers on BBPS" },
  { value: "₹0", label: "Joining fee" },
  { value: "24/7", label: "Platform uptime" },
];

/* ── Benefits ────────────────────────────────────────────────────────────── */
type Benefit = { icon: PhosphorIcon; title: string; desc: string };
const BENEFITS: Benefit[] = [
  { icon: Lightning, title: "Instant commission", desc: "Every transaction credits your wallet the second it settles. No waiting, no monthly payouts." },
  { icon: ShieldCheck, title: "Bank-grade security", desc: "Two-factor auth, MPIN on sensitive actions, PCI-DSS certified infrastructure." },
  { icon: Users, title: "Grow your network", desc: "Onboard retailers and distributors under your brand. Earn overrides on their volume." },
  { icon: TrendUp, title: "Real-time dashboard", desc: "Track transactions, commissions, and network performance — live, on any device." },
  { icon: Globe, title: "Pan-India coverage", desc: "Serve customers across every state with our nationwide banking and biller network." },
  { icon: Headset, title: "Dedicated support", desc: "Counter-level help when you need it — phone, WhatsApp and email." },
];

/* ── Compliance chips ────────────────────────────────────────────────────── */
const COMPLIANCE = ["NPCI Certified", "PCI-DSS v4.0", "ISO 27001:2022", "Authorised partner banks"];

/* ── How it works steps ──────────────────────────────────────────────────── */
const STEPS = [
  { n: "01", title: "Register online", desc: "Fill a short form with your PAN and Aadhaar — no paperwork, no visit." },
  { n: "02", title: "Complete e-KYC", desc: "A five-minute video verification from your phone. Instant approval." },
  { n: "03", title: "Top up & go live", desc: "Load your float wallet and process your first paid transaction — same day." },
];

/**
 * TenantHomePage — a creative, fully-branded landing page for white-label partners.
 *
 * Sections:
 *  1. Hero — gradient-washed, brand-coloured, bold headline + CTAs
 *  2. Stats bar — quick proof numbers
 *  3. Services grid — 8 key services with icons
 *  4. Benefits — why join this network
 *  5. How it works — 3-step path
 *  6. Closing CTA — conversion slab
 */
export function TenantHomePage({ brand }: { brand: TenantBrand }) {
  const reduce = useReducedMotion();

  const enter = (i: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 26 } as const),
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.65, ease: easeOut, delay: 0.08 + i * 0.1 },
  });

  return (
    <>
      {/* ═══════════════════════ 1. HERO ═══════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 md:pt-36" style={{ background: brand.primaryColor }}>
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-32 top-20 h-[400px] w-[400px] rounded-full blur-3xl" style={{ background: brand.accentColor, opacity: 0.15 }} />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="grain container-x relative z-10 pb-20 md:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
            {/* ── Copy column ── */}
            <div className="lg:col-span-7">
              <motion.div {...enter(0)}>
                <span className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
                  <Storefront size={13} weight="fill" aria-hidden className="text-white/70" />
                  {brand.brandName} Partner Network
                </span>
              </motion.div>

              <motion.h1
                {...enter(1)}
                className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.025em] text-white sm:text-5xl lg:text-[3.5rem]"
              >
                Your counter.{" "}
                <span className="text-white/80">
                  Sixty+ ways to earn.
                </span>
              </motion.h1>

              <motion.p
                {...enter(2)}
                className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg"
              >
                {brand.tagline ??
                  `Join the ${brand.brandName} network and offer cash withdrawals, money transfers, bill payments, recharges, travel bookings and more — all from one counter.`}
              </motion.p>

              <motion.div {...enter(3)} className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/register" className="inline-flex rounded-2xl focus-energy">
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 font-display text-sm font-semibold shadow-lg transition hover:shadow-xl" style={{ color: brand.primaryColor }}>
                    Join our network
                    <ArrowRight size={16} weight="bold" aria-hidden />
                  </span>
                </Link>
                <Link href="/admin" className="inline-flex rounded-2xl focus-energy">
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                    Sign in
                  </span>
                </Link>
              </motion.div>

              <motion.ul
                {...enter(4)}
                className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/65"
              >
                {["₹0 joining fee", "e-KYC in 5 minutes", "Earn from day one"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle size={14} weight="fill" className="text-white/80" aria-hidden />
                    {t}
                  </li>
                ))}
              </motion.ul>
            </div>

            {/* ── Visual column — floating dashboard preview ── */}
            <div className="hidden lg:col-span-5 lg:block">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 40, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: 1.5 }}
                transition={{ duration: 0.8, ease: easeOut, delay: 0.3 }}
                className="relative mx-auto max-w-sm"
              >
                {/* Frosted console card */}
                <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Counter wallet</p>
                      <p className="mt-0.5 font-display text-2xl font-semibold tracking-[-0.02em] text-white">₹24,860</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" aria-hidden />
                      Live
                    </span>
                  </div>
                  <ul className="space-y-1 px-3 py-3">
                    {[
                      { icon: Fingerprint, label: "AePS withdrawal", amount: "₹2,500", fee: "+₹6.00" },
                      { icon: PaperPlaneTilt, label: "Money transfer", amount: "₹10,000", fee: "+₹8.00" },
                      { icon: QrCode, label: "UPI collect", amount: "₹1,250", fee: "+₹2.50" },
                      { icon: Receipt, label: "Electricity bill", amount: "₹1,840", fee: "+₹14.70" },
                    ].map((r) => {
                      const RIcon = r.icon;
                      return (
                        <li key={r.label} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.05] px-3 py-2.5">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.08] text-white/60">
                            <RIcon size={15} weight="duotone" aria-hidden />
                          </span>
                          <span className="flex-1 truncate text-xs font-semibold text-white/90">{r.label}</span>
                          <span className="text-right">
                            <span className="block text-xs font-semibold tabular-nums text-white/80">{r.amount}</span>
                            <span className="block text-[10px] font-semibold tabular-nums text-green-300">{r.fee}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Floating payout chip */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: easeOut, delay: 1 }}
                  className="absolute -left-6 bottom-8 -rotate-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl"
                >
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    <TrendUp size={12} weight="bold" className="text-green-300" aria-hidden />
                    Today&rsquo;s earning
                  </p>
                  <p className="mt-0.5 font-display text-lg font-semibold text-white">₹562.40</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom wave separator */}
        <div className="relative z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full" preserveAspectRatio="none">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════ 2. STATS BAR ══════════════════════════════ */}
      <section className="relative border-b border-ink-100 bg-white">
        <div className="container-x">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08} className="relative px-2 py-8 text-center md:py-10">
                {i > 0 && (
                  <span aria-hidden className="absolute inset-y-6 left-0 hidden w-px bg-gradient-to-b from-transparent via-ink-200 to-transparent lg:block" />
                )}
                <p className="font-display text-3xl font-semibold tracking-[-0.02em] md:text-4xl" style={{ color: brand.primaryColor }}>
                  {s.value}
                </p>
                <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.12em] text-ink-500">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 3. SERVICES GRID ══════════════════════════ */}
      <section className="section bg-white" id="services">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-200/80 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">
                <span className="h-2 w-2 rounded-full" style={{ background: brand.primaryColor }} aria-hidden />
                The switchboard
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-950 md:text-4xl lg:text-5xl">
                Every service your customers need
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-600 md:text-lg">
                {brand.brandName} partners get access to 60+ financial services — all from a single login.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s, i) => {
              const SIcon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 0.06}>
                  <div className="group relative overflow-hidden rounded-3xl border border-ink-100 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition group-hover:opacity-100"
                      style={{ background: brand.primaryColor }}
                    />
                    <span
                      className="relative z-10 grid h-12 w-12 place-items-center rounded-2xl text-white"
                      style={{ background: brand.primaryColor }}
                    >
                      <SIcon size={22} weight="duotone" aria-hidden />
                    </span>
                    <h3 className="relative z-10 mt-4 font-display text-base font-semibold tracking-tight text-ink-950">
                      {s.title}
                    </h3>
                    <p className="relative z-10 mt-2 text-sm leading-relaxed text-ink-500">{s.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 4. BENEFITS ═══════════════════════════════ */}
      <section className="section bg-ink-50/50">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-200/80 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">
                <span className="h-2 w-2 rounded-full" style={{ background: brand.accentColor }} aria-hidden />
                Why {brand.brandName}
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-950 md:text-4xl lg:text-5xl">
                Built to grow your business
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-600 md:text-lg">
                Everything you need to run a successful financial services counter.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b, i) => {
              const BIcon = b.icon;
              return (
                <Reveal key={b.title} delay={i * 0.06}>
                  <div className="flex gap-4 rounded-3xl border border-ink-100 bg-white p-6">
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white"
                      style={{ background: i % 2 === 0 ? brand.primaryColor : brand.accentColor }}
                    >
                      <BIcon size={20} weight="duotone" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold tracking-tight text-ink-950">{b.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{b.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Compliance chips */}
          <Reveal>
            <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-2">
              {COMPLIANCE.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-500 shadow-sm"
                >
                  <SealCheck size={13} weight="duotone" aria-hidden style={{ color: brand.primaryColor }} />
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════ 5. HOW IT WORKS ═══════════════════════════ */}
      <section className="section bg-white">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-200/80 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">
                <span className="h-2 w-2 rounded-full" style={{ background: brand.primaryColor }} aria-hidden />
                Get started
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-950 md:text-4xl lg:text-5xl">
                Live in three steps
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-600 md:text-lg">
                From registration to your first paid transaction — the same day.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.12}>
                <div className="relative text-center">
                  {i < STEPS.length - 1 && (
                    <div aria-hidden className="absolute right-0 top-8 hidden h-px w-[calc(100%-3rem)] translate-x-1/2 bg-ink-200 md:block" />
                  )}
                  <span
                    className="relative z-10 mx-auto grid h-16 w-16 place-items-center rounded-full font-display text-xl font-bold text-white shadow-lg"
                    style={{ background: brand.primaryColor }}
                  >
                    {s.n}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink-950">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-500">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 6. CLOSING CTA ════════════════════════════ */}
      <section className="section bg-white">
        <div className="container-x">
          <Reveal>
            <div
              className="grain relative overflow-hidden rounded-5xl px-6 py-16 text-center text-white md:px-16 md:py-20"
              style={{ background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.accentColor} 100%)` }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(60%_80%_at_50%_0%,rgba(255,255,255,0.5),transparent_70%)]"
              />

              <p className="relative z-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
                <Rocket size={14} weight="duotone" aria-hidden />
                Start today
              </p>

              <h2 className="relative z-10 mx-auto mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.04] tracking-[-0.025em] md:text-6xl">
                Every customer in your queue is a commission waiting to land.
              </h2>
              <p className="relative z-10 mx-auto mt-5 max-w-xl text-sm text-white/75 md:text-base">
                Register now — {brand.brandName} partners process their first paid transaction the same day. Free to start, no installation required.
              </p>

              <div className="relative z-10 mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register" className="inline-flex rounded-2xl focus-energy">
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold shadow-lg transition hover:shadow-xl" style={{ color: brand.primaryColor }}>
                    Create free account
                    <ArrowRight size={16} weight="bold" aria-hidden />
                  </span>
                </Link>
                <Link href="/admin" className="inline-flex rounded-2xl focus-energy">
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                    Sign in to dashboard
                  </span>
                </Link>
              </div>

              {/* Powered by attribution */}
              <p className="relative z-10 mt-8 text-xs text-white/50">
                Powered by{" "}
                <a href="https://www.bankingpoint-24.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/70 hover:text-white">
                  BankingPoint24
                </a>
                {" "}· 60+ services · Pan-India reach
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
