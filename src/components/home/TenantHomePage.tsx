"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  CaretDown,
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
  Star,
  TrendUp,
  Users,
  Wallet,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import type { TenantBrand } from "@/lib/tenant/context";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Reusable animation wrapper ──────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 40));
    const id = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [inView, value]);
  return (
    <span ref={ref}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ── Section heading helper ──────────────────────────────────────────────── */
function SectionTag({ label, color }: { label: string; color: string }) {
  return (
    <div className="mb-4 flex justify-center">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em]"
        style={{ background: `${color}12`, color }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
    </div>
  );
}

/* ── Data ─────────────────────────────────────────────────────────────────── */
type ServiceTile = { icon: PhosphorIcon; title: string; desc: string };

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

const RECEIPT_LINES = [
  { icon: Fingerprint, label: "AePS withdrawals", count: "× 22", amount: "₹2,500", commission: "₹132.00" },
  { icon: PaperPlaneTilt, label: "Money transfers", count: "× 14", amount: "₹10,000", commission: "₹112.00" },
  { icon: QrCode, label: "UPI collect", count: "× 31", amount: "₹1,250", commission: "₹93.20" },
  { icon: Receipt, label: "Bill payments", count: "× 26", amount: "₹1,840", commission: "₹167.40" },
  { icon: CreditCard, label: "Card taps on POS", count: "× 12", amount: "₹3,200", commission: "₹58.10" },
];

const BENEFITS = [
  { icon: Lightning, title: "Instant commission", desc: "Every transaction credits your wallet the second it settles. No waiting, no monthly payouts." },
  { icon: ShieldCheck, title: "Bank-grade security", desc: "Two-factor auth, MPIN on sensitive actions, PCI-DSS certified infrastructure." },
  { icon: Users, title: "Grow your network", desc: "Onboard retailers and distributors under your brand. Earn overrides on their volume." },
  { icon: TrendUp, title: "Real-time dashboard", desc: "Track transactions, commissions, and network performance — live, on any device." },
  { icon: Globe, title: "Pan-India coverage", desc: "Serve customers across every state with our nationwide banking and biller network." },
  { icon: Headset, title: "Dedicated support", desc: "Counter-level help when you need it — phone, WhatsApp and email." },
];

const TIERS = [
  { title: "Retailer", desc: "Run a counter. Serve customers. Earn per-transaction commissions.", icon: Storefront },
  { title: "Distributor", desc: "Onboard retailers. Set their rates. Earn overrides on every transaction.", icon: Users },
  { title: "Master Distributor", desc: "Manage distributors across a region. Scale your earning network.", icon: TrendUp },
];

const TRUST_BADGES = [
  { label: "RBI-licensed bank partners", icon: SealCheck },
  { label: "NPCI member rails", icon: ShieldCheck },
  { label: "PCI-DSS compliant", icon: ShieldCheck },
  { label: "UIDAI AUA / KUA", icon: SealCheck },
];

const TESTIMONIALS = [
  { name: "Rajesh Patel", role: "Kirana Store · Ahmedabad", quote: "Within two months, I was earning ₹18,000/month extra just from AePS and recharges. Best decision I made for my shop." },
  { name: "Priya Sharma", role: "Mobile Shop · Delhi", quote: "My customers love the bill payment facility. It brings them to my shop even when they don't need a recharge." },
  { name: "Mohammed Irfan", role: "Travel Agent · Bangalore", quote: "Money transfer is my top earner. The instant settlement means I never run out of float." },
  { name: "Sunita Devi", role: "Medical Store · Patna", quote: "I was skeptical at first, but the ₹0 joining fee convinced me. Now I earn more from services than medicine margins." },
];

const FAQ = [
  { q: "How much does it cost to join?", a: "Absolutely free. There is no joining fee, no monthly subscription. You only need a float balance to start transactions." },
  { q: "How fast do I receive my commission?", a: "Instantly. Every successful transaction credits your wallet in real-time — no waiting for monthly payouts." },
  { q: "What documents do I need?", a: "PAN card, Aadhaar, a bank account, and a selfie. The entire e-KYC takes under 5 minutes." },
  { q: "Can I run this from my existing shop?", a: "Yes — any shop with a smartphone and internet can become a service counter. No separate infrastructure needed." },
  { q: "Is there a minimum transaction volume?", a: "No minimums. Earn from your very first transaction, whether it's one or a hundred per day." },
];

const SHOP_TYPES = [
  "Kirana stores", "Mobile shops", "Travel agencies", "Medical stores",
  "Stationery shops", "Cyber cafés", "Photo studios", "Electronics shops",
  "Tea stalls", "Garment shops", "Hardware stores", "Dairy booths",
];

/* ══════════════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                         */
/* ══════════════════════════════════════════════════════════════════════════ */
export function TenantHomePage({ brand }: { brand: TenantBrand }) {
  const p = brand.primaryColor;
  const a = brand.accentColor;

  return (
    <>
      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <HeroSection brand={brand} />

      {/* ── 2. SCROLLING SHOP TYPES ──────────────────────────────────────── */}
      <ShopMarquee color={p} />

      {/* ── 3. STATS STRIP ───────────────────────────────────────────────── */}
      <StatsStrip color={p} />

      {/* ── 4. SERVICES ──────────────────────────────────────────────────── */}
      <ServicesSection brand={brand} />

      {/* ── 5. INCOME PROOF ──────────────────────────────────────────────── */}
      <IncomeProof brand={brand} />

      {/* ── 6. BENEFITS ──────────────────────────────────────────────────── */}
      <BenefitsSection brand={brand} />

      {/* ── 7. NETWORK TIERS ─────────────────────────────────────────────── */}
      <NetworkSection brand={brand} />

      {/* ── 8. HOW IT WORKS ──────────────────────────────────────────────── */}
      <HowItWorks brand={brand} />

      {/* ── 9. TRUST BADGES ──────────────────────────────────────────────── */}
      <TrustSection color={p} />

      {/* ── 10. TESTIMONIALS ─────────────────────────────────────────────── */}
      <TestimonialsSection brand={brand} />

      {/* ── 11. FAQ ──────────────────────────────────────────────────────── */}
      <FaqSection color={p} brandName={brand.brandName} />

      {/* ── 12. CLOSING CTA ──────────────────────────────────────────────── */}
      <ClosingCta brand={brand} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  S E C T I O N S                                                         */
/* ══════════════════════════════════════════════════════════════════════════ */

/* ── 1. HERO ─────────────────────────────────────────────────────────────── */
function HeroSection({ brand }: { brand: TenantBrand }) {
  const reduce = useReducedMotion();
  const p = brand.primaryColor;
  const a = brand.accentColor;
  const enter = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.1 * i, ease },
  });

  return (
    <section
      className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24"
      style={{ background: `linear-gradient(160deg, ${p} 0%, ${p}dd 40%, ${a}99 100%)` }}
    >
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-10" style={{ background: a }} />
      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full opacity-10" style={{ background: a }} />

      <div className="container-x relative grid gap-10 lg:grid-cols-2 lg:items-center">
        {/* Left — copy */}
        <div className="text-white">
          <motion.div {...enter(0)}>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] backdrop-blur">
              <Storefront size={14} weight="fill" /> {brand.brandName} Partner Network
            </span>
          </motion.div>

          <motion.h1
            {...enter(1)}
            className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] md:text-5xl lg:text-6xl"
          >
            Your counter.{" "}
            <span style={{ color: a }} className="drop-shadow-sm">
              Sixty+ ways
            </span>{" "}
            to earn.
          </motion.h1>

          <motion.p {...enter(2)} className="mt-5 max-w-lg text-lg text-white/85 leading-relaxed">
            {brand.tagline || "Cash withdrawals, money transfers, 1,600+ billers, recharges, travel and card payments — served from the counter you already own."}
          </motion.p>

          <motion.div {...enter(3)} className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-xl transition hover:shadow-2xl"
              style={{ background: "white", color: p }}
            >
              Join our network <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </motion.div>

          <motion.div {...enter(4)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {["₹0 joining fee", "e-KYC in 5 minutes", "Earn from day one"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={15} weight="fill" className="text-emerald-300" /> {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right — floating receipt card */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.4, ease }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="rounded-3xl bg-white/95 p-6 shadow-2xl shadow-black/20 backdrop-blur ring-1 ring-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-400">Counter Wallet</p>
                <p className="text-2xl font-bold text-ink-900">₹24,860</p>
              </div>
              <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: `${p}15`, color: p }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: p }} /> Live
              </span>
            </div>
            <div className="space-y-1">
              {RECEIPT_LINES.map((r) => (
                <div key={r.label} className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-ink-50">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${p}12` }}>
                    <r.icon size={16} style={{ color: p }} weight="duotone" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink-800 truncate">{r.label}</p>
                    <p className="text-[10px] text-ink-400">{r.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-ink-900">{r.amount}</p>
                    <p className="text-[10px] font-semibold" style={{ color: p }}>+{r.commission}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl p-3 text-center" style={{ background: `${a}12` }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Today&apos;s Earning</p>
              <p className="text-xl font-bold" style={{ color: a }}>₹562.70</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── SHOP MARQUEE ────────────────────────────────────────────────────────── */
function ShopMarquee({ color }: { color: string }) {
  return (
    <div className="overflow-hidden border-b border-ink-100 bg-white py-3">
      <div className="animate-marquee flex w-max gap-8 text-sm text-ink-400">
        {[...SHOP_TYPES, ...SHOP_TYPES].map((s, i) => (
          <span key={i} className="flex items-center gap-2 whitespace-nowrap">
            <span className="h-1 w-1 rounded-full" style={{ background: color }} />
            {s}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  );
}

/* ── 3. STATS ────────────────────────────────────────────────────────────── */
function StatsStrip({ color }: { color: string }) {
  const stats = [
    { value: 60, suffix: "+", label: "Services Live" },
    { value: 1600, suffix: "+", label: "Billers on BBPS" },
    { value: 0, suffix: "", label: "Joining Fee", display: "₹0" },
    { value: 24, suffix: "/7", label: "Platform Uptime" },
  ];
  return (
    <section className="border-b border-ink-100 bg-white">
      <div className="container-x">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="relative px-2 py-8 text-center md:py-10">
              {i > 0 && (
                <span
                  aria-hidden
                  className="absolute inset-y-6 left-0 hidden w-px bg-gradient-to-b from-transparent via-ink-200 to-transparent lg:block"
                />
              )}
              <p className="font-display text-3xl font-semibold tracking-[-0.02em] md:text-4xl" style={{ color }}>
                {s.display ?? <><CountUp value={s.value} suffix={s.suffix} /></>}
              </p>
              <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.12em] text-ink-500">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 4. SERVICES ─────────────────────────────────────────────────────────── */
function ServicesSection({ brand }: { brand: TenantBrand }) {
  return (
    <section className="section bg-white">
      <div className="container-x">
        <SectionTag label="The Switchboard" color={brand.primaryColor} />
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-center font-display text-3xl font-semibold tracking-tight text-ink-950 md:text-4xl">
            Every service your customers need
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-600">
            {brand.brandName} partners get access to 60+ financial services — all from a single login.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="group rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-ink-200 hover:shadow-lg">
                <div
                  className="mb-4 grid h-12 w-12 place-items-center rounded-2xl transition group-hover:scale-110"
                  style={{ background: `${brand.primaryColor}10` }}
                >
                  <s.icon size={24} style={{ color: brand.primaryColor }} weight="duotone" />
                </div>
                <h3 className="text-sm font-bold text-ink-900">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 5. INCOME PROOF ─────────────────────────────────────────────────────── */
function IncomeProof({ brand }: { brand: TenantBrand }) {
  const p = brand.primaryColor;
  const a = brand.accentColor;
  const txns = [
    { service: "AePS (50 txns/day)", daily: 300, monthly: 9000 },
    { service: "Money Transfer (30 txns)", daily: 240, monthly: 7200 },
    { service: "Recharges & Bills (40 txns)", daily: 200, monthly: 6000 },
    { service: "POS / QR (20 txns)", daily: 100, monthly: 3000 },
  ];
  const totalDaily = txns.reduce((s, t) => s + t.daily, 0);
  const totalMonthly = txns.reduce((s, t) => s + t.monthly, 0);

  return (
    <section className="section bg-ink-50/60">
      <div className="container-x">
        <SectionTag label="Income Calculator" color={a} />
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-center font-display text-3xl font-semibold tracking-tight text-ink-950 md:text-4xl">
            How much can you earn?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-600">
            Real earnings from an active {brand.brandName} counter with moderate daily traffic.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-ink-100">
            <div className="grid grid-cols-3 gap-px bg-ink-100 text-xs font-bold uppercase tracking-wider text-ink-500">
              <div className="bg-white px-5 py-3">Service</div>
              <div className="bg-white px-5 py-3 text-right">Daily</div>
              <div className="bg-white px-5 py-3 text-right">Monthly</div>
            </div>
            {txns.map((t) => (
              <div key={t.service} className="grid grid-cols-3 border-t border-ink-100 text-sm">
                <div className="px-5 py-3.5 font-medium text-ink-800">{t.service}</div>
                <div className="px-5 py-3.5 text-right font-semibold text-ink-700">₹{t.daily}</div>
                <div className="px-5 py-3.5 text-right font-semibold text-ink-700">₹{t.monthly.toLocaleString("en-IN")}</div>
              </div>
            ))}
            <div className="grid grid-cols-3 border-t-2 text-sm font-bold" style={{ borderColor: p }}>
              <div className="px-5 py-4 text-ink-900">Total earnings</div>
              <div className="px-5 py-4 text-right" style={{ color: p }}>₹{totalDaily}/day</div>
              <div className="px-5 py-4 text-right" style={{ color: p }}>
                <CountUp value={totalMonthly} suffix="/mo" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 6. BENEFITS ─────────────────────────────────────────────────────────── */
function BenefitsSection({ brand }: { brand: TenantBrand }) {
  return (
    <section className="section bg-white">
      <div className="container-x">
        <SectionTag label={`Why ${brand.brandName}`} color={brand.accentColor} />
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-center font-display text-3xl font-semibold tracking-tight text-ink-950 md:text-4xl">
            Built to grow your business
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-600">
            Everything you need to run a successful financial services counter.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => {
            const colors = [brand.primaryColor, brand.accentColor];
            const c = colors[i % 2];
            return (
              <Reveal key={b.title} delay={i * 0.07}>
                <div className="rounded-2xl border border-ink-100 bg-white p-6 transition hover:shadow-lg">
                  <div
                    className="mb-4 grid h-11 w-11 place-items-center rounded-xl"
                    style={{ background: `${c}12` }}
                  >
                    <b.icon size={22} style={{ color: c }} weight="duotone" />
                  </div>
                  <h3 className="text-base font-bold text-ink-900">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{b.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 7. NETWORK TIERS ────────────────────────────────────────────────────── */
function NetworkSection({ brand }: { brand: TenantBrand }) {
  return (
    <section className="section" style={{ background: `${brand.primaryColor}08` }}>
      <div className="container-x">
        <SectionTag label="Growth Ladder" color={brand.primaryColor} />
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-center font-display text-3xl font-semibold tracking-tight text-ink-950 md:text-4xl">
            Start as a retailer. Scale to a distributor.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-600">
            Build your own network and earn overrides on every transaction your team processes.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.1}>
              <div className="relative rounded-2xl border border-ink-100 bg-white p-8 text-center transition hover:shadow-lg">
                <div
                  className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.accentColor})` }}
                >
                  <t.icon size={28} weight="fill" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: brand.primaryColor }}>
                  Tier {i + 1}
                </span>
                <h3 className="mt-1 text-lg font-bold text-ink-900">{t.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{t.desc}</p>
                {i < TIERS.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                    <ArrowRight size={20} className="text-ink-300" />
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 8. HOW IT WORKS ─────────────────────────────────────────────────────── */
function HowItWorks({ brand }: { brand: TenantBrand }) {
  const steps = [
    { num: "01", title: "Register online", desc: "Fill a short form with your PAN and Aadhaar — no paperwork, no visit." },
    { num: "02", title: "Complete e-KYC", desc: "A five-minute video verification from your phone. Instant approval." },
    { num: "03", title: "Top up & go live", desc: "Load your float wallet and process your first paid transaction — same day." },
  ];
  return (
    <section className="section bg-white">
      <div className="container-x">
        <SectionTag label="Get Started" color={brand.primaryColor} />
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-center font-display text-3xl font-semibold tracking-tight text-ink-950 md:text-4xl">
            Live in three steps
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-600">
            From registration to your first paid transaction — the same day.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.12}>
              <div className="text-center">
                <div
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full text-lg font-bold text-white shadow-lg"
                  style={{ background: brand.primaryColor }}
                >
                  {s.num}
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-500 max-w-xs mx-auto">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 9. TRUST ────────────────────────────────────────────────────────────── */
function TrustSection({ color }: { color: string }) {
  return (
    <section className="section bg-ink-950">
      <div className="container-x">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Bank-grade infrastructure you can trust
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-400">
            Your money moves through RBI-regulated channels with enterprise-level encryption.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_BADGES.map((b, i) => (
            <Reveal key={b.label} delay={i * 0.08}>
              <div className="flex items-center gap-3 rounded-2xl border border-ink-800 bg-ink-900/50 p-5 backdrop-blur">
                <b.icon size={28} weight="fill" style={{ color }} />
                <span className="text-sm font-semibold text-white">{b.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 10. TESTIMONIALS ────────────────────────────────────────────────────── */
function TestimonialsSection({ brand }: { brand: TenantBrand }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, [reduce, paused]);

  const t = TESTIMONIALS[index];

  return (
    <section
      className="section"
      style={{ background: `${brand.primaryColor}06` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-x">
        <SectionTag label="Partner Stories" color={brand.primaryColor} />
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-center font-display text-3xl font-semibold tracking-tight text-ink-950 md:text-4xl">
            Hear from our partners
          </h2>
        </Reveal>
        <div className="mx-auto mt-10 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={reduce ? false : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease }}
              className="text-center"
            >
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} weight="fill" style={{ color: brand.accentColor }} />
                ))}
              </div>
              <blockquote className="text-xl font-medium leading-relaxed text-ink-800 md:text-2xl">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-6">
                <div
                  className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full text-sm font-bold text-white"
                  style={{ background: brand.primaryColor }}
                >
                  {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <p className="font-semibold text-ink-900">{t.name}</p>
                <p className="text-sm text-ink-500">{t.role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button onClick={() => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="rounded-full border border-ink-200 p-2 text-ink-500 hover:bg-ink-50">
              <CaretLeft size={16} />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={cn("h-2 rounded-full transition-all", i === index ? "w-6" : "w-2 bg-ink-200")}
                  style={i === index ? { background: brand.primaryColor } : {}}
                />
              ))}
            </div>
            <button onClick={() => setIndex((i) => (i + 1) % TESTIMONIALS.length)} className="rounded-full border border-ink-200 p-2 text-ink-500 hover:bg-ink-50">
              <CaretRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 11. FAQ ──────────────────────────────────────────────────────────────── */
function FaqSection({ color, brandName }: { color: string; brandName: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="section bg-white">
      <div className="container-x">
        <SectionTag label="FAQ" color={color} />
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-center font-display text-3xl font-semibold tracking-tight text-ink-950 md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-600">
            Everything you need to know about joining the {brandName} network.
          </p>
        </Reveal>
        <div className="mx-auto mt-10 max-w-2xl divide-y divide-ink-100">
          {FAQ.map((f, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <button
                className="flex w-full items-start justify-between gap-4 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-ink-900">{f.q}</span>
                <CaretDown
                  size={18}
                  className={cn("mt-0.5 shrink-0 text-ink-400 transition-transform", open === i && "rotate-180")}
                  style={open === i ? { color } : {}}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm leading-relaxed text-ink-600">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 12. CLOSING CTA ─────────────────────────────────────────────────────── */
function ClosingCta({ brand }: { brand: TenantBrand }) {
  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: `linear-gradient(160deg, ${brand.primaryColor}, ${brand.accentColor})` }}
    >
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
      <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-10 bg-white" />
      <div className="container-x relative text-center text-white">
        <Reveal>
          <SectionTag label="Start Today" color="rgba(255,255,255,0.85)" />
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold tracking-tight md:text-5xl">
            Every customer in your queue is a commission waiting to land.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
            Register now — {brand.brandName} partners process their first paid transaction the same day. Free to start, no installation required.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold shadow-xl transition hover:shadow-2xl"
              style={{ color: brand.primaryColor }}
            >
              Create free account <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              Sign in to dashboard
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.25}>
          <p className="mt-10 text-sm text-white/50">
            Powered by <span className="font-semibold text-white/70">BankingPoint24</span> · 60+ services · Pan-India reach
          </p>
        </Reveal>
      </div>
    </section>
  );
}
