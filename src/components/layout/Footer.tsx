import Link from "next/link";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  ArrowRight,
  ArrowUpRight,
  Envelope,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Phone,
  SealCheck,
  XLogo,
  YoutubeLogo
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "./Logo";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import {
  footerLinks,
  footerCertifications,
  company,
  grievanceOfficer,
  nodalOfficer
} from "@/lib/data";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  { title: "Services", links: footerLinks.services },
  { title: "Company", links: footerLinks.company },
  { title: "Resources", links: footerLinks.resources },
  { title: "Legal", links: footerLinks.legal }
];

const socials: { label: string; href: string; icon: PhosphorIcon }[] = [
  { label: "X (Twitter)", href: "#", icon: XLogo },
  { label: "LinkedIn", href: "#", icon: LinkedinLogo },
  { label: "Instagram", href: "#", icon: InstagramLogo },
  { label: "YouTube", href: "#", icon: YoutubeLogo },
  { label: "Facebook", href: "#", icon: FacebookLogo }
];

/**
 * BankingPoint24 footer — four decks:
 *  1 · newsletter band (briefing signup)
 *  2 · brand + link columns
 *  3 · statutory offices (registered / grievance / nodal) + compliance chips
 *  4 · bottom bar (legal line + socials)
 * Opens with the signature gradient keyline instead of a CTA hero — the page
 * above always ends in its own closing CTA.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-ink-950 text-ink-300">
      {/* Signature keyline */}
      <div aria-hidden className="h-1 w-full bg-energy-gradient-x" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 z-0 h-[380px] w-[380px] rounded-full bg-accent-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-10 z-0 h-[380px] w-[380px] rounded-full bg-royal-600/15 blur-3xl"
      />

      {/* 1 · Newsletter band */}
      <div className="relative z-10 border-b border-white/10">
        <Container className="flex flex-col gap-5 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              <span className="brand-dot" aria-hidden /> The partner circular
            </p>
            <p className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] text-white md:text-2xl">
              Rate updates, new launches and growth playbooks — once a month, no noise.
            </p>
          </div>
          <div className="w-full md:max-w-md">
            <NewsletterForm />
            <p className="mt-2 text-[11px] text-white/35">
              Unsubscribe anytime.{" "}
              <Link
                href="/legal/privacy"
                className="underline-offset-2 hover:text-white/70 hover:underline"
              >
                Privacy
              </Link>
              .
            </p>
          </div>
        </Container>
      </div>

      {/* 2 · Brand + link columns */}
      <Container className="relative z-10 pt-14">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo variant="light" size="md" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              The neighbourhood counter, upgraded. BankingPoint24 puts cash,
              transfers, bills, recharges and travel behind a single login —
              so every walk-in becomes a line of income for your shop.
            </p>
            <div className="mt-6 space-y-2 text-sm text-white/60">
              <a
                href={`tel:+91${company.phone}`}
                className="flex w-fit items-center gap-2 transition hover:text-white"
              >
                <Phone size={14} weight="duotone" className="text-accent-400" aria-hidden />
                +91 {company.phone}
              </a>
              <a
                href={`mailto:${company.email}`}
                className="flex w-fit items-center gap-2 transition hover:text-white"
              >
                <Envelope size={14} weight="duotone" className="text-accent-400" aria-hidden />
                {company.email}
              </a>
            </div>
            <ul className="mt-6 flex items-center gap-2" aria-label="Social">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      aria-label={s.label}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:border-white/30 hover:bg-white/10 hover:text-white focus-energy"
                    >
                      <Icon size={16} weight="duotone" aria-hidden />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8 lg:pl-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={`${col.title}-${l.label}`}>
                      <Link
                        href={l.href}
                        className="group inline-flex items-center gap-1 text-white/60 transition hover:text-white"
                      >
                        {l.label}
                        <ArrowUpRight
                          size={11}
                          weight="bold"
                          aria-hidden
                          className="-translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-70"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 3 · Statutory desk — stacked ledger rows, not a card grid */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-white/10">
          <p className="border-b border-white/10 bg-white/[0.03] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            The statutory desk
          </p>

          <OfficeRow label="Corporate & registered office">
            <p className="font-display text-sm font-semibold text-white">{company.legalName}</p>
            <p className="mt-1.5 flex items-start gap-2">
              <MapPin size={14} weight="duotone" aria-hidden className="mt-0.5 shrink-0 text-accent-400" />
              <span>{company.address}</span>
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
              <a href={`tel:+91${company.phone}`} className="inline-flex items-center gap-2 hover:text-white">
                <Phone size={14} weight="duotone" aria-hidden className="shrink-0 text-accent-400" />
                +91 {company.phone}
              </a>
              <a href={`mailto:${company.email}`} className="inline-flex items-center gap-2 break-all hover:text-white">
                <Envelope size={14} weight="duotone" aria-hidden className="shrink-0 text-accent-400" />
                {company.email}
              </a>
            </p>
          </OfficeRow>

          <OfficeRow label="Grievance desk · IT Rules, 2021">
            <p className="font-display text-sm font-semibold text-white">
              {grievanceOfficer.name}
              <span className="ml-2 text-xs font-normal text-white/50">{grievanceOfficer.designation}</span>
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
              <a href={`mailto:${grievanceOfficer.email}`} className="inline-flex items-center gap-2 break-all hover:text-white">
                <Envelope size={14} weight="duotone" aria-hidden className="shrink-0 text-accent-400" />
                {grievanceOfficer.email}
              </a>
              <span className="inline-flex items-center gap-2">
                <Phone size={14} weight="duotone" aria-hidden className="shrink-0 text-accent-400" />
                {grievanceOfficer.phone}
              </span>
            </p>
            <p className="mt-1.5 text-white/45">
              {grievanceOfficer.hours} · {grievanceOfficer.responseSla}
            </p>
            <Link
              href="/legal/grievance"
              className="mt-1.5 inline-flex items-center gap-1 font-semibold text-accent-300 hover:text-accent-200"
            >
              How a complaint is handled <ArrowRight size={12} weight="bold" aria-hidden />
            </Link>
          </OfficeRow>

          <OfficeRow label="Nodal officer · escalations">
            <p className="font-display text-sm font-semibold text-white">
              {nodalOfficer.name}
              <span className="ml-2 text-xs font-normal text-white/50">{nodalOfficer.designation}</span>
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
              <a href={`mailto:${nodalOfficer.email}`} className="inline-flex items-center gap-2 break-all hover:text-white">
                <Envelope size={14} weight="duotone" aria-hidden className="shrink-0 text-accent-400" />
                {nodalOfficer.email}
              </a>
              <span className="inline-flex items-center gap-2">
                <Phone size={14} weight="duotone" aria-hidden className="shrink-0 text-accent-400" />
                {nodalOfficer.phone}
              </span>
            </p>
            <p className="mt-1.5 text-white/45">
              Step in when a grievance crosses 15 working days without resolution.
            </p>
          </OfficeRow>
        </div>

        {/* Compliance line — a sentence, not a badge wall */}
        <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed text-white/45">
          <SealCheck size={14} weight="duotone" aria-hidden className="text-accent-400" />
          <span className="font-semibold uppercase tracking-[0.14em] text-white/55">Runs on:</span>
          {footerCertifications.join(" · ")}
        </p>

        {/* 4 · Bottom bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 py-8 md:flex-row md:items-center md:justify-between">
          <div className="text-xs leading-relaxed text-white/40">
            <p>
              © {year} {company.legalName}. All rights reserved.
            </p>
            <p className="mt-1">
              CIN {company.cin} · GSTIN {company.gstin} · Incorporated{" "}
              {company.incorporated}, {company.jurisdiction}.
            </p>
          </div>
          <p className="text-xs text-white/40">
            Crafted in Anand, Gujarat · Serving counters across Bharat
          </p>
        </div>
      </Container>
    </footer>
  );
}

function OfficeRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-white/10 px-6 py-5 last:border-b-0 md:grid-cols-[220px_1fr] md:gap-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40 md:pt-0.5">
        {label}
      </p>
      <div className="text-xs leading-relaxed text-white/65">{children}</div>
    </div>
  );
}
