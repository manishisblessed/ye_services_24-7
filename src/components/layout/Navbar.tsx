"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Airplane,
  ArrowRight,
  ArrowUpRight,
  CaretDown,
  Fingerprint,
  List,
  PaperPlaneTilt,
  Phone,
  QrCode,
  Receipt,
  SquaresFour,
  X,
  type Icon as PhosphorIcon
} from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { IconTile, type IconTone } from "@/components/ui/Icon";
import { company, mainNav, type NavLink } from "@/lib/data";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Routes whose first section is dark & full-bleed. Pages can also opt in by
 *  emitting `data-nav-theme="dark"` on their first section. The BankingPoint24
 *  home hero is light paper, so no route is dark by default. */
const DARK_ROUTES = new Set<string>([]);

/** Mega-menu metadata for the "Services" children (keyed by href). */
const serviceMeta: Record<
  string,
  { icon: PhosphorIcon; tone: IconTone; desc: string }
> = {
  "/services#aadhaar-pay": {
    icon: Fingerprint,
    tone: "brand",
    desc: "Your counter becomes the nearest ATM — a thumb is all it takes."
  },
  "/services#money-transfer": {
    icon: PaperPlaneTilt,
    tone: "accent",
    desc: "IMPS to any bank in the country, even on a Sunday night."
  },
  "/services#upi": {
    icon: QrCode,
    tone: "royal",
    desc: "One float wallet behind your QR, collect requests and payouts."
  },
  "/services#bills": {
    icon: Receipt,
    tone: "coral",
    desc: "1,600+ billers and every recharge, each with its own commission."
  },
  "/services#travel": {
    icon: Airplane,
    tone: "amber",
    desc: "Bus, air and hotel bookings at trade fares — margin stays with you."
  }
};

function useIsActive(pathname: string) {
  return React.useCallback(
    (href: string) =>
      pathname === href || (href !== "/" && !href.startsWith("/#") && pathname.startsWith(href)),
    [pathname]
  );
}

/**
 * BankingPoint24 public navigation — a single-deck header (no utility strip):
 *
 *  · Logo left, five tabs centre, support chip + sign-in + CTA right.
 *    Transparent over dark heroes, frosted white once scrolled. Active tab is
 *    marked by a gradient underline that glides between links.
 *  · "Service board" opens a full-width mega panel, not a floating card.
 *  · Mobile: right-hand slide-in drawer.
 */
export function Navbar() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const isActive = useIsActive(pathname);

  const [scrolled, setScrolled] = React.useState(false);
  const [darkHero, setDarkHero] = React.useState(DARK_ROUTES.has(pathname));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);

  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = React.useRef<HTMLElement>(null);

  /* Scroll state */
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Detect whether the page under the (transparent) bar is dark. The page
     transition mounts the new page late, so probe a few times. */
  React.useEffect(() => {
    let cancelled = false;
    const probe = () => {
      if (cancelled) return;
      const el = document.querySelector('[data-nav-theme="dark"]');
      setDarkHero(Boolean(el) || DARK_ROUTES.has(pathname));
    };
    probe();
    const timers = [120, 450, 900].map((ms) => setTimeout(probe, ms));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [pathname]);

  /* Close everything on route change */
  React.useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setHovered(null);
  }, [pathname]);

  /* Escape closes overlays; lock body scroll while the drawer is open */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setMegaOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  /* Close the mega-menu when focus leaves the header */
  React.useEffect(() => {
    if (!megaOpen) return;
    const onFocus = (e: FocusEvent) => {
      if (
        headerRef.current &&
        e.target instanceof Node &&
        !headerRef.current.contains(e.target)
      ) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [megaOpen]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleCloseMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 140);
  };

  const solid = scrolled || megaOpen;
  const onDark = darkHero && !solid;
  const servicesItem = mainNav.find((i) => i.children);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50"
        onMouseLeave={() => {
          setHovered(null);
          scheduleCloseMega();
        }}
      >
        {/* ── Main bar (single deck — no utility strip) ── */}
        <motion.div
          initial={false}
          animate={{
            backgroundColor: solid ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0)",
            boxShadow: solid
              ? "0 1px 0 0 rgba(15,23,42,0.07), 0 12px 32px -20px rgba(15,23,42,0.25)"
              : "0 0 0 0 rgba(15,23,42,0)",
            backdropFilter: solid ? "saturate(180%) blur(16px)" : "blur(0px)"
          }}
          transition={{ duration: reduce ? 0 : 0.3, ease: easeOut }}
          style={{
            WebkitBackdropFilter: solid ? "saturate(180%) blur(16px)" : undefined
          }}
        >
          <div className="container-x flex h-[70px] items-center justify-between gap-6">
            <Logo size="md" variant={onDark ? "light" : "dark"} className="shrink-0" />

            {/* Centre tabs (lg+) */}
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {mainNav.map((item) => {
                  const active = isActive(item.href);
                  const marked = hovered ? hovered === item.label : active;
                  const hasChildren = Boolean(item.children);
                  return (
                    <li
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => {
                        setHovered(item.label);
                        if (hasChildren) openMega();
                        else scheduleCloseMega();
                      }}
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        aria-haspopup={hasChildren ? "menu" : undefined}
                        aria-expanded={hasChildren ? megaOpen : undefined}
                        aria-controls={hasChildren ? "services-mega-menu" : undefined}
                        onFocus={() => {
                          setHovered(item.label);
                          if (hasChildren) openMega();
                        }}
                        onKeyDown={(e) => {
                          if (hasChildren && e.key === "ArrowDown") {
                            e.preventDefault();
                            openMega();
                            requestAnimationFrame(() => {
                              document
                                .querySelector<HTMLAnchorElement>("#services-mega-menu a")
                                ?.focus();
                            });
                          }
                        }}
                        className={cn(
                          "relative inline-flex h-[70px] items-center gap-1 whitespace-nowrap px-3.5 text-sm font-semibold transition-colors focus-energy",
                          onDark
                            ? marked
                              ? "text-white"
                              : "text-white/70 hover:text-white"
                            : marked
                              ? "text-ink-950"
                              : "text-ink-600 hover:text-ink-950"
                        )}
                      >
                        {item.label}
                        {hasChildren && (
                          <CaretDown
                            size={11}
                            weight="bold"
                            aria-hidden
                            className={cn(
                              "transition-transform duration-300",
                              megaOpen && "rotate-180"
                            )}
                          />
                        )}
                        {marked && (
                          <motion.span
                            layoutId="nav-underline"
                            aria-hidden
                            className={cn(
                              "absolute inset-x-3 bottom-0 h-[3px] rounded-t-full",
                              onDark ? "bg-accent-400" : "bg-energy-gradient-x"
                            )}
                            transition={{ type: "spring", stiffness: 480, damping: 40 }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Right rail (lg+): support chip · divider · sign in · CTA */}
            <div className="hidden items-center gap-3 lg:flex">
              <a
                href={`tel:+91${company.phone}`}
                className={cn(
                  "hidden whitespace-nowrap items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-energy xl:inline-flex",
                  onDark
                    ? "border-white/15 text-white/75 hover:border-white/35 hover:text-white"
                    : "border-accent-200 bg-accent-50/60 text-ink-700 hover:border-accent-400 hover:text-ink-950"
                )}
              >
                <Phone size={13} weight="duotone" aria-hidden className={onDark ? "text-accent-300" : "text-accent-600"} />
                <span>
                  <span className={cn("mr-1.5 font-normal", onDark ? "text-white/45" : "text-ink-400")}>
                    Counter help
                  </span>
                  +91 {company.phone}
                </span>
              </a>
              <span
                aria-hidden
                className={cn("hidden h-5 w-px xl:block", onDark ? "bg-white/15" : "bg-ink-200")}
              />
              <Link href="/login" className="rounded-2xl focus-energy">
                <Button
                  variant="outline"
                  size="sm"
                  tabIndex={-1}
                  className={cn(
                    onDark && "border-white/25 bg-transparent text-white/90 hover:bg-white/10 hover:text-white"
                  )}
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/register" className="rounded-2xl focus-energy">
                <Button size="sm" tabIndex={-1} className="px-5">
                  Become a partner
                  <ArrowRight size={14} weight="bold" aria-hidden />
                </Button>
              </Link>
            </div>

            {/* Hamburger (mobile) */}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen(true)}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-2xl transition focus-energy active:scale-95 lg:hidden",
                onDark
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-ink-950 text-white hover:bg-ink-800"
              )}
            >
              <List size={20} weight="bold" aria-hidden />
            </button>
          </div>
        </motion.div>

        {/* ── Mega panel (full-width) ── */}
        <AnimatePresence>
          {megaOpen && servicesItem?.children && (
            <MegaPanel
              item={servicesItem}
              reduce={Boolean(reduce)}
              onEnter={openMega}
              onLeave={scheduleCloseMega}
            />
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileDrawer
            reduce={Boolean(reduce)}
            onClose={() => setMobileOpen(false)}
            isActive={isActive}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Full-width mega panel
   ────────────────────────────────────────────────────────────────────────── */
function MegaPanel({
  item,
  reduce,
  onEnter,
  onLeave
}: {
  item: NavLink;
  reduce: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.div
      id="services-mega-menu"
      role="menu"
      aria-label="Services"
      initial={{ opacity: 0, y: reduce ? 0 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -8 }}
      transition={{ duration: reduce ? 0 : 0.22, ease: easeOut }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="hidden border-b border-ink-100 bg-white/95 shadow-soft backdrop-blur-xl lg:block"
    >
      <div className="container-x grid gap-6 py-8 lg:grid-cols-[1fr_280px]">
        <div className="grid grid-cols-2 gap-1 xl:grid-cols-3">
          {item.children!.map((child) => {
            const meta = serviceMeta[child.href];
            return (
              <Link
                key={child.href}
                href={child.href}
                role="menuitem"
                className="group flex items-start gap-3.5 rounded-2xl p-4 transition hover:bg-ink-50 focus-energy"
              >
                <IconTile icon={meta?.icon ?? SquaresFour} tone={meta?.tone ?? "brand"} size="md" />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-display text-[15px] font-semibold tracking-[-0.01em] text-ink-950">
                    {child.label}
                    <ArrowUpRight
                      size={12}
                      weight="bold"
                      aria-hidden
                      className="-translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-60"
                    />
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
                    {meta?.desc ?? "Open this service."}
                  </span>
                </span>
              </Link>
            );
          })}
          <Link
            href={item.href}
            role="menuitem"
            className="group flex items-center gap-3.5 rounded-2xl border border-dashed border-ink-200 p-4 text-sm font-semibold text-ink-600 transition hover:border-royal-300 hover:text-royal-800 focus-energy"
          >
            Browse all 63 switches on the board
            <ArrowRight size={14} weight="bold" aria-hidden className="transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Dashboard CTA rail */}
        <Link
          href="/dashboard"
          role="menuitem"
          className="grain group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-ink-950 p-6 text-white transition hover:shadow-energy focus-energy"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-energy-gradient opacity-60 blur-2xl transition group-hover:opacity-90"
          />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              <span className="brand-dot" aria-hidden /> Partner already?
            </span>
            <p className="mt-3 font-display text-xl font-semibold leading-tight tracking-[-0.02em]">
              Jump to your counter
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/60">
              Float, rate card and every switch on one screen.
            </p>
          </div>
          <span className="relative z-10 mt-6 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-950 transition group-hover:bg-accent-400">
            <ArrowUpRight size={16} weight="bold" aria-hidden />
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Mobile right-hand drawer
   ────────────────────────────────────────────────────────────────────────── */
function MobileDrawer({
  reduce,
  onClose,
  isActive
}: {
  reduce: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" className="fixed inset-0 z-[60] lg:hidden">
      {/* Backdrop */}
      <motion.button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.2 }}
        className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={reduce ? false : { x: "100%" }}
        animate={{ x: 0 }}
        exit={reduce ? undefined : { x: "100%" }}
        transition={{ duration: reduce ? 0 : 0.35, ease: easeOut }}
        className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col overflow-y-auto rounded-l-[2rem] bg-white shadow-glow"
      >
        <div className="flex items-center justify-between px-6 pt-5">
          <Logo size="sm" />
          <button
            ref={closeRef}
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-100 text-ink-700 transition hover:bg-ink-200 focus-energy active:scale-95"
          >
            <X size={18} weight="bold" aria-hidden />
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 px-4 py-6">
          <ul className="space-y-0.5">
            {mainNav.map((item, i) => {
              const active = isActive(item.href);
              return (
                <motion.li
                  key={item.label}
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: reduce ? 0 : 0.35,
                    delay: reduce ? 0 : 0.08 + i * 0.05,
                    ease: easeOut
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-xl font-semibold tracking-[-0.01em] transition focus-energy",
                      active
                        ? "pill-active text-royal-900"
                        : "text-ink-800 hover:bg-ink-50"
                    )}
                  >
                    {item.label}
                    <ArrowRight size={16} weight="bold" aria-hidden className="text-ink-300" />
                  </Link>
                  {item.children && (
                    <ul className="mb-2 mt-1 flex flex-wrap gap-1.5 px-4">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            onClick={onClose}
                            className="inline-flex items-center rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:border-ink-300 hover:text-ink-950 focus-energy"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-ink-100 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
          <div className="grid gap-2">
            <Link href="/register" onClick={onClose} className="rounded-2xl focus-energy">
              <Button size="lg" tabIndex={-1} className="w-full">
                Become a partner
                <ArrowRight size={16} weight="bold" aria-hidden />
              </Button>
            </Link>
            <Link href="/login" onClick={onClose} className="rounded-2xl focus-energy">
              <Button variant="outline" size="lg" tabIndex={-1} className="w-full">
                Sign in
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-center text-[11px] text-ink-400">
            ₹0 to join · Live the same day · Counter help +91 {company.phone}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
