import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion";
import { pricingPlans } from "@/lib/data";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./_shared/SectionHeading";
import { ButtonLink } from "./_shared/ButtonLink";

/**
 * Partner tier board — five roles, no prices. Each card shows the role name,
 * tagline, description and feature list. The Master Distributor card is
 * visually highlighted as the regional-leader sweet spot.
 */
export function PlansBoard() {
  return (
    <section className="section bg-ink-50/60" id="pricing">
      <div className="container-x">
        <SectionHeading
          align="center"
          eyebrow="Partner tiers"
          title="Find your role. Grow at your pace."
          sub="Every tier earns on the same 30+ services. Pick the level that matches your ambition — upgrade anytime."
        />

        {/* First row: 3 cards */}
        <div className="mx-auto mt-14 max-w-6xl space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pricingPlans.slice(0, 3).map((plan, i) => (
              <PlanCard key={plan.name} plan={plan} index={i} />
            ))}
          </div>

          {/* Second row: 2 cards, centred */}
          <div className="grid gap-6 sm:grid-cols-2 lg:mx-auto lg:max-w-[calc(66.666%+0.75rem)]">
            {pricingPlans.slice(3).map((plan, i) => (
              <PlanCard key={plan.name} plan={plan} index={i + 3} />
            ))}
          </div>
        </div>

        <Reveal className="mt-10 text-center text-xs text-ink-400">
          All tiers include the same security, settlement speed and 24 × 7 support.
          Onboarding is invitation-based — our team calls you within one working day.
        </Reveal>
      </div>
    </section>
  );
}

function PlanCard({ plan, index }: { plan: (typeof pricingPlans)[number]; index: number }) {
  const dark = Boolean(plan.highlighted);
  return (
    <Reveal delay={index * 0.07}>
      <div
        className={cn(
          "flex h-full flex-col rounded-4xl p-8",
          dark
            ? "grain relative overflow-hidden bg-brand-950 text-white shadow-energy"
            : "border border-ink-100 bg-white shadow-sm transition hover:shadow-energy-sm"
        )}
      >
        {dark && (
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-energy-gradient opacity-50 blur-3xl"
          />
        )}

        {/* Name + badge */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <h3
              className={cn(
                "font-display text-lg font-semibold",
                dark ? "text-white" : "text-ink-950"
              )}
            >
              {plan.name}
            </h3>
            <p className={cn("mt-0.5 text-xs font-medium", dark ? "text-accent-300" : "text-brand-600")}>
              {plan.tagline}
            </p>
          </div>
          {dark && (
            <span className="shrink-0 rounded-full bg-accent-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-300">
              Popular
            </span>
          )}
        </div>

        {/* Description */}
        <p
          className={cn(
            "relative z-10 mt-4 text-sm leading-relaxed",
            dark ? "text-white/60" : "text-ink-500"
          )}
        >
          {plan.description}
        </p>

        {/* Feature list */}
        <ul className="relative z-10 mt-6 flex-1 space-y-3">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <span
                className={cn(
                  "mt-0.5 grid h-4.5 w-5 shrink-0 place-items-center rounded-full",
                  dark ? "text-accent-300" : "text-accent-600"
                )}
              >
                <Check size={14} weight="bold" aria-hidden />
              </span>
              <span className={dark ? "text-white/80" : "text-ink-700"}>{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <ButtonLink
          href={plan.ctaHref}
          size="lg"
          variant={dark ? "primary" : "outline"}
          linkClassName="relative z-10 mt-8 w-full"
          className="w-full"
        >
          {plan.cta}
          <ArrowRight size={15} weight="bold" aria-hidden />
        </ButtonLink>
      </div>
    </Reveal>
  );
}
