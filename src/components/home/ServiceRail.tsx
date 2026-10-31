"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { IconTile } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion";
import { services, type ServiceItem } from "@/lib/data";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./_shared/SectionHeading";
import { ButtonLink } from "./_shared/ButtonLink";
import { iconForService, serviceToneByCategory } from "./_shared/serviceIcons";

const CATEGORY_LABEL: Record<ServiceItem["category"], string> = {
  banking: "Cash & transfers",
  bills: "Bill desk",
  recharge: "Recharges",
  travel: "Travel desk",
  other: "More"
};

const CATEGORY_ORDER: ServiceItem["category"][] = ["banking", "bills", "recharge", "travel"];

/**
 * The service switchboard — a board of compact toggle tiles grouped by desk,
 * with a live detail panel that explains whichever service is selected.
 * Deliberately nothing like a card carousel: no horizontal scroll, no
 * uniform card grid.
 */
export function ServiceRail() {
  const [selectedSlug, setSelectedSlug] = useState(services[0]!.slug);

  const selected = useMemo(
    () => services.find((s) => s.slug === selectedSlug) ?? services[0]!,
    [selectedSlug]
  );
  const SelectedIcon = iconForService(selected.slug);

  const groups = useMemo(
    () =>
      CATEGORY_ORDER.map((cat) => ({
        cat,
        label: CATEGORY_LABEL[cat],
        items: services.filter((s) => s.category === cat)
      })).filter((g) => g.items.length > 0),
    []
  );

  return (
    <section className="section bg-white" id="services">
      <div className="container-x">
        <SectionHeading
          eyebrow="The switchboard"
          title={
            <>
              Every switch you flip
              <br className="hidden md:block" /> is a new income line.
            </>
          }
          sub="Tap any service on the board to see what it does for your counter. All of them run off one dashboard, one float, one login."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Detail panel — sticky on desktop */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.slug}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-4xl border border-accent-100 bg-[#f6faf2] p-8 md:p-10"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent-200/40 blur-3xl"
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-4">
                      <IconTile
                        icon={SelectedIcon}
                        tone={serviceToneByCategory[selected.category] ?? "brand"}
                        size="lg"
                      />
                      <span className="rounded-full border border-accent-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-accent-700">
                        {CATEGORY_LABEL[selected.category]}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-semibold tracking-[-0.015em] text-ink-950 md:text-3xl">
                      {selected.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-ink-600">
                      {selected.description}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <ButtonLink href="/services" size="md">
                        See the rate card
                        <ArrowRight size={15} weight="bold" aria-hidden />
                      </ButtonLink>
                      <Link
                        href="/register"
                        className="text-sm font-semibold text-royal-700 underline-offset-4 transition hover:underline focus-energy"
                      >
                        Activate on my counter
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* The board */}
          <div className="lg:col-span-7">
            {groups.map((g, gi) => (
              <Reveal key={g.cat} delay={gi * 0.06} className={cn(gi > 0 && "mt-8")}>
                <p className="flex items-baseline gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
                  <span className="text-accent-600">
                    {String(gi + 1).padStart(2, "0")}
                  </span>
                  {g.label}
                  <span aria-hidden className="h-px flex-1 bg-ink-100" />
                  <span className="font-semibold text-ink-300">{g.items.length} live</span>
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {g.items.map((s) => {
                    const active = s.slug === selectedSlug;
                    const SIcon = iconForService(s.slug);
                    return (
                      <li key={s.slug}>
                        <button
                          type="button"
                          onClick={() => setSelectedSlug(s.slug)}
                          aria-pressed={active}
                          className={cn(
                            "group inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-semibold transition focus-energy",
                            active
                              ? "border-transparent bg-energy-gradient text-white shadow-energy-sm"
                              : "border-ink-200 bg-white text-ink-700 hover:border-accent-300 hover:bg-accent-50/60 hover:text-ink-950"
                          )}
                        >
                          <SIcon
                            size={16}
                            weight="duotone"
                            aria-hidden
                            className={active ? "text-white" : "text-accent-600"}
                          />
                          {s.title}
                          {s.badge && !active && (
                            <span className="rounded-full bg-accent-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-700">
                              {s.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            ))}

            <Reveal delay={0.2} className="mt-10">
              <p className="text-sm text-ink-500">
                New switches are added every quarter —{" "}
                <Link
                  href="/services"
                  className="font-semibold text-royal-700 underline-offset-4 hover:underline focus-energy"
                >
                  browse the full board with commissions
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
