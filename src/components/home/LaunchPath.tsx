"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./_shared/SectionHeading";
import { ButtonLink } from "./_shared/ButtonLink";

const STEPS: { duration: string; title: string; body: string }[] = [
  {
    duration: "~5 min",
    title: "Create your partner ID",
    body: "Sign up with your mobile number, PAN and Aadhaar — entirely from your phone, with no agent visit."
  },
  {
    duration: "Same hour",
    title: "Finish video e-KYC",
    body: "A short selfie video plus an OTP completes verification. Approval usually lands before you have closed the app."
  },
  {
    duration: "~2 min",
    title: "Pick your opening line-up",
    body: "Choose which services go live on day one. The full rate card is visible before you confirm anything."
  },
  {
    duration: "Day one",
    title: "Ring up your first sale",
    body: "Your QR, receipts and float wallet are live. Commission credits the moment your first transaction settles."
  }
];

/**
 * Opening-day ledger — four open columns on a shared gradient baseline,
 * numbered like ledger entries. No cards, no zigzag timeline.
 */
export function LaunchPath() {
  return (
    <section className="section bg-white">
      <div className="container-x">
        <SectionHeading
          align="center"
          eyebrow="Opening day"
          title="Morning signup. Evening earnings."
          sub="No territory rules, no waiting on anyone. Four short steps stand between you and your first commission."
        />

        <div className="relative mx-auto mt-16 max-w-6xl">
          {/* Shared baseline the steps sit on */}
          <div aria-hidden className="absolute inset-x-0 top-0 hidden h-px bg-ink-100 md:block" />
          <div
            aria-hidden
            className="absolute left-0 top-0 hidden h-[3px] w-1/4 -translate-y-[1px] bg-energy-gradient-x md:block"
          />

          <ol className="grid gap-10 md:grid-cols-4 md:gap-8">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className={cn("relative md:pt-10", "border-l-2 border-ink-100 pl-6 md:border-l-0 md:pl-0")}
              >
                {/* Node on the baseline (desktop) */}
                <span
                  aria-hidden
                  className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-energy-gradient md:left-0 md:top-[-4.5px] md:h-[9px] md:w-[9px]"
                />
                <Reveal delay={i * 0.08}>
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-5xl font-semibold tracking-[-0.03em] text-accent-200 md:text-6xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-700">
                      {s.duration}
                    </span>
                  </p>
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.01em] text-ink-950">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="mt-14 text-center">
          <ButtonLink href="/register" size="lg">
            Get your counter live
            <ArrowRight size={16} weight="bold" aria-hidden />
          </ButtonLink>
          <p className="mt-3 text-xs text-ink-400">
            Stuck anywhere? WhatsApp us and a human walks you through it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
