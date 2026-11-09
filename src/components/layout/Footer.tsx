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
  ShieldCheck,
  WhatsappLogo,
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
  nodalOfficer,
  supportTeam
} from "@/lib/data";
import type { TenantBrand } from "@/lib/tenant/context";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  { title: "Services", links: footerLinks.services },
  { title: "Company", links: footerLinks.company },
  { title: "Resources", links: footerLinks.resources },
  { title: "Legal", links: footerLinks.legal }
];

const socials: { label: string; href: string; icon: PhosphorIcon }[] = [
  { label: "X (Twitter)", href: "#", icon: XLogo },
  { label: "LinkedIn", href: "#", icon: LinkedinLogo },
  { label: "Instagram", href: "https://www.instagram.com/bankingpoint24.anand?srtk=emVvYjlkazEzbDd4", icon: InstagramLogo },
  { label: "YouTube", href: "#", icon: YoutubeLogo },
  { label: "Facebook", href: "https://www.facebook.com/share/1Ab46MUxj4/", icon: FacebookLogo },
  { label: "WhatsApp Channel", href: "https://whatsapp.com/channel/0029Vb8avfkBKfi67LC1Py2Z", icon: WhatsappLogo },
];

/**
 * BankingPoint24 footer — four decks:
 *  1 · newsletter band (briefing signup)
 *  2 · brand + link columns
 *  3 · statutory offices (registered / grievance / nodal) + compliance chips
 *  4 · bottom bar (legal line + socials)
 * Opens with the signature gradient keyline instead of a CTA hero — the page
 * above always ends in its own closing CTA.
 *
 * When `brand` is provided, renders a streamlined white-label footer instead.
 */
export function Footer({ brand }: { brand?: TenantBrand | null }) {
  const year = new Date().getFullYear();

  if (brand) return <TenantFooter brand={brand} year={year} />;

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
                const isExternal = s.href !== "#";
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      aria-label={s.label}
                      {...(isExternal
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
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

        {/* 3 · Support desk — corporate info + 4 dedicated support contacts */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-white/10">
          <p className="border-b border-white/10 bg-white/[0.03] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            The support desk
          </p>

          {/* Corporate & registered office */}
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

          {/* 4 dedicated support contacts */}
          {supportTeam.map((contact) => (
            <OfficeRow key={contact.department} label={contact.department}>
              <p className="font-display text-sm font-semibold text-white">{contact.name}</p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <Phone size={14} weight="duotone" aria-hidden className="shrink-0 text-accent-400" />
                  {contact.phone}
                </a>
              </p>
              <p className="mt-1.5 text-white/45">{contact.scope}</p>
            </OfficeRow>
          ))}

          {/* Grievance & nodal — kept for IT Rules 2021 compliance */}
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

/** Streamlined footer for white-label partner portals. */
function TenantFooter({ brand, year }: { brand: TenantBrand; year: number }) {
  const tenantLinks = [
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms & Conditions", href: "/legal/terms" },
    { label: "Refunds", href: "/legal/refunds" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="relative isolate overflow-hidden text-white" style={{ background: brand.primaryColor }}>
      {/* Gradient overlay for depth */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 z-0 h-[380px] w-[380px] rounded-full bg-white/5 blur-3xl" />

      <Container className="relative z-10 pt-14">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-5">
            {brand.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logoUrl} alt={brand.brandName} className="h-10 w-auto object-contain brightness-0 invert" />
            ) : (
              <span className="font-display text-2xl font-bold tracking-tight text-white">{brand.brandName}</span>
            )}
            {brand.tagline && (
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{brand.tagline}</p>
            )}
            <div className="mt-6 space-y-2 text-sm text-white/60">
              {brand.supportPhone && (
                <a href={`tel:+91${brand.supportPhone}`} className="flex w-fit items-center gap-2 transition hover:text-white">
                  <Phone size={14} weight="duotone" className="text-white/80" aria-hidden />
                  +91 {brand.supportPhone}
                </a>
              )}
              {brand.supportEmail && (
                <a href={`mailto:${brand.supportEmail}`} className="flex w-fit items-center gap-2 transition hover:text-white">
                  <Envelope size={14} weight="duotone" className="text-white/80" aria-hidden />
                  {brand.supportEmail}
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Quick links</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {tenantLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="group inline-flex items-center gap-1 text-white/60 transition hover:text-white">
                    {l.label}
                    <ArrowUpRight size={11} weight="bold" aria-hidden className="-translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-70" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sign-in CTA */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Partner portal</p>
              <p className="mt-2 font-display text-lg font-semibold tracking-tight text-white">
                Sign in to your dashboard
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/55">
                Access all services, manage transactions, and grow your network from one place.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/admin" className="inline-flex rounded-2xl focus-energy">
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold transition hover:shadow-lg" style={{ color: brand.primaryColor }}>
                    Sign in <ArrowRight size={14} weight="bold" aria-hidden />
                  </span>
                </Link>
                <Link href="/register" className="inline-flex rounded-2xl focus-energy">
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                    Join network
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance line */}
        <p className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed text-white/40">
          <ShieldCheck size={14} weight="duotone" aria-hidden className="text-white/60" />
          <span className="font-semibold uppercase tracking-[0.14em] text-white/50">Powered by</span>
          BankingPoint24 · {footerCertifications.slice(0, 3).join(" · ")}
        </p>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 py-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/40">
            © {year} {brand.brandName}. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Powered by{" "}
            <a href="https://www.bankingpoint-24.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/60 hover:text-white">
              BankingPoint24
            </a>
            {" "}· RUTVA MULTISERVICES LLP
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
