"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Buildings,
  CheckCircle,
  Crown,
  Globe,
  PaintBrush,
  Storefront
} from "@phosphor-icons/react";
import { IconTile, type IconTone } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion";
import { commissionSlabs } from "@/lib/data";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./_shared/SectionHeading";
import { ButtonLink } from "./_shared/ButtonLink";

const easeOut = [0.22, 1, 0.36, 1] as const;

type RoleKey = "retailer" | "distributor" | "master" | "super" | "whitelabel";

const ROLES: {
  key: RoleKey;
  label: string;
  icon: React.ComponentProps<typeof IconTile>["icon"];
  tone: IconTone;
  headline: string;
  body: string;
  points: string[];
  cta: string;
  slabCol: (s: (typeof commissionSlabs)[number]) => string;
}[] = [
  {
    key: "retailer",
    label: "Retailer",
    icon: Storefront,
    tone: "brand",
    headline: "The counter you already own, earning like a branch.",
    body: "Keep selling what you sell — and let the same counter hand out cash, move money, clear bills and book tickets. Each settled transaction drops its commission straight into your float.",
    points: [
      "Sixty-plus switches live on day one",
      "Commission itemised on every receipt",
      "Speaker announces each credit",
      "A human on WhatsApp when stuck"
    ],
    cta: "Open my counter",
    slabCol: (s) => s.retailer
  },
  {
    key: "distributor",
    label: "Distributor",
    icon: Buildings,
    tone: "royal",
    headline: "Sign up the shops around you. Earn while they earn.",
    body: "Bring the counters in your area onto the platform and collect an override on every transaction they push — your income compounds with every shop you add.",
    points: [
      "Onboard counters from your phone",
      "Override income on the whole zone",
      "Float top-ups for your retailers",
      "A relationship manager who answers"
    ],
    cta: "Build my zone",
    slabCol: (s) => s.distributor
  },
  {
    key: "master",
    label: "Master distributor",
    icon: Crown,
    tone: "accent",
    headline: "A region under your name — margins under your control.",
    body: "Appoint distributors across districts, tune margins inside your band, and if you want, run the whole thing under your own brand with our white-label portal and APIs.",
    points: [
      "Two layers of override income",
      "Your brand on portal & app",
      "Developer APIs & webhooks",
      "Early settlement window"
    ],
    cta: "Claim a region",
    slabCol: (s) => s.master
  },
  {
    key: "super",
    label: "Super distributor",
    icon: Globe,
    tone: "coral",
    headline: "The state is your tree. Every branch pays you.",
    body: "Seat Master Distributors across a state and take an override on everything that moves through your entire tree — the deepest earning layer in the network.",
    points: [
      "Appoint master distributors statewide",
      "Override across every tier below",
      "Exclusive territory arrangements",
      "Direct line to the founders' desk"
    ],
    cta: "Apply for the top tier",
    slabCol: (s) => s.superDistributor
  },
  {
    key: "whitelabel",
    label: "White-label partner",
    icon: PaintBrush,
    tone: "energy",
    headline: "Your brand. Our rails. Zero engineering on your side.",
    body: "Launch your own branded fintech app and portal powered entirely by BankingPoint24 infrastructure. Your logo, your domain, your colour scheme — we handle the compliance, banking integrations and settlement engine behind the curtain.",
    points: [
      "Fully branded portal & mobile app",
      "Your own domain and support desk",
      "Set your own commission margins",
      "Dedicated API keys & webhooks",
      "Compliance & licensing handled by us"
    ],
    cta: "Discuss white-label",
    slabCol: (s) => s.whiteLabel
  }
];

/**
 * The five-tier network explained as a switchable "ladder" — role tabs on
 * top, a split panel (pitch + live slab table) below.
 */
export function NetworkLadder() {
  const [role, setRole] = useState<RoleKey>("retailer");
  const reduce = useReducedMotion();
  const active = ROLES.find((r) => r.key === role)!;

  return (
    <section className="section bg-white" id="network">
      <div className="container-x">
        <SectionHeading
          align="center"
          eyebrow="Join BankingPoint24"
          title="Choose your level. Grow into the next."
          sub="Retailer, Distributor, Master Distributor, Super Distributor or White-Label Partner — same platform, five ways in. Start at any level; scale as your ambition grows."
        />

        {/* Role tabs */}
        <div
          role="tablist"
          aria-label="Partner roles"
          className="mx-auto mt-10 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-full border border-ink-150 border-ink-200 bg-ink-50 p-1.5"
        >
          {ROLES.map((r) => {
            const selected = role === r.key;
            return (
              <button
                key={r.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setRole(r.key)}
                className={cn(
                  "relative rounded-full px-5 py-2.5 text-sm font-semibold transition focus-energy",
                  selected ? "text-white" : "text-ink-600 hover:text-ink-900"
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="role-pill"
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-energy-gradient"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="mx-auto mt-10 max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="grid overflow-hidden rounded-4xl border border-ink-100 shadow-soft md:grid-cols-2"
            >
              {/* Pitch */}
              <div className="flex flex-col justify-between bg-white p-8 md:p-10">
                <div>
                  <IconTile icon={active.icon} tone={active.tone} size="xl" />
                  <h3 className="mt-6 font-display text-2xl font-semibold tracking-[-0.02em] text-ink-950 md:text-3xl">
                    {active.headline}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500 md:text-base">
                    {active.body}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {active.points.map((p) => (
                      <li key={p} className="flex items-center gap-2.5 text-sm text-ink-700">
                        <CheckCircle size={16} weight="fill" className="shrink-0 text-accent-500" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <ButtonLink href="/register" size="lg" linkClassName="mt-8 w-fit">
                  {active.cta}
                  <ArrowRight size={16} weight="bold" aria-hidden />
                </ButtonLink>
              </div>

              {/* Slab table */}
              <div className="grain bg-brand-950 p-8 text-white md:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Published {active.label.toLowerCase()} slabs
                </p>
                <ul className="mt-5 divide-y divide-white/[0.07]">
                  {commissionSlabs.slice(0, 6).map((s) => (
                    <li key={s.service} className="flex items-center justify-between gap-4 py-3">
                      <span className="text-sm text-white/70">{s.service}</span>
                      <span className="font-display text-sm font-semibold tabular-nums text-accent-300">
                        {active.slabCol(s)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-[11px] leading-relaxed text-white/40">
                  The complete rate card sits inside your dashboard and is
                  shown before any service goes live. Rate changes are
                  announced ahead of time — never applied silently.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
