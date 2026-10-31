import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * BankingPoint24 brand mark — the official logo icon, served from
 * /logo-mark.png. Used only for icon-only contexts (e.g. collapsed sidebar);
 * everywhere else we render the full official wordmark via <Logo />.
 */
export function LogoMark({
  className,
  size = 32
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/logo-mark.png"
      alt="BankingPoint24"
      // Intrinsic size of the source art (512×488); rendered height is driven by
      // `size` with width:auto so the near-square mark never distorts.
      width={512}
      height={488}
      priority
      unoptimized
      style={{ height: size, width: "auto" }}
      className={cn(
        "shrink-0 object-contain transition-transform group-hover:scale-105",
        className
      )}
    />
  );
}

/** Brand tagline shown beside the logo. Change here to update it everywhere. */
export const LOGO_TAGLINE = "Banking Made Simple.";

const sizeMap = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12"
} as const;

/**
 * Full BankingPoint24 logo lockup — renders the official wordmark from
 * /logo.png.
 *
 * - On light surfaces (navbar, auth, sidebar) the full-colour logo is used.
 * - On dark surfaces pass `variant="light"`: a `brightness-0 invert` filter
 *   turns the same artwork into a crisp white monochrome version.
 * - Pass `iconOnly` to render just the brand mark (collapsed sidebar).
 * - Pass `tagline` to show the theme-gradient tagline beside the mark.
 * - Use `size` to scale the lockup ("sm" | "md" | "lg").
 */
export function Logo({
  className,
  variant = "dark",
  iconOnly = false,
  tagline = false,
  size = "md"
}: {
  className?: string;
  variant?: "dark" | "light";
  iconOnly?: boolean;
  tagline?: boolean;
  size?: keyof typeof sizeMap;
}) {
  if (iconOnly) {
    return (
      <Link
        href="/"
        className={cn("group relative inline-flex items-center", className)}
        aria-label="BankingPoint24 home"
      >
        <LogoMark size={34} />
        {/* Live brand-dot — subtle pulse that signals "the BankingPoint24 platform is on". */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5"
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-70 animate-ping-soft" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-brand-700 to-accent-500 ring-2 ring-white" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={cn("group relative inline-flex items-center gap-3", className)}
      aria-label="BankingPoint24 home"
    >
      <span className="relative inline-flex">
        <Image
          src="/logo.png"
          alt="BankingPoint24"
          // Intrinsic size of the source art; height is set by the
          // `sizeMap` class with w-auto so the lockup keeps its aspect ratio.
          width={500}
          height={500}
          priority
          unoptimized
          className={cn(
            "w-auto transition-transform duration-300 group-hover:scale-[1.03]",
            sizeMap[size],
            // The wordmark is navy+teal; on dark surfaces flatten it to pure white.
            variant === "light" && "brightness-0 invert"
          )}
        />
        {/* Live brand-dot — tucked at the top-right of the wordmark. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-1 -top-0.5 flex h-2.5 w-2.5"
        >
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping-soft",
              variant === "light" ? "bg-white" : "bg-accent-400"
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-brand-700 to-accent-500",
              variant === "light" ? "ring-2 ring-white/70" : "ring-2 ring-white"
            )}
          />
        </span>
      </span>

      {tagline && (
        <span
          className={cn(
            "hidden items-center self-stretch border-l pl-3 sm:inline-flex",
            variant === "light" ? "border-white/25" : "border-ink-200"
          )}
        >
          {/* The tagline carries the signature BankingPoint24 gradient-sweep
              (animated navy→royal→teal) via `globals.css .gradient-text`. */}
          <span className="gradient-text whitespace-nowrap text-[11px] font-bold uppercase leading-tight tracking-[0.14em]">
            {LOGO_TAGLINE}
          </span>
        </span>
      )}
    </Link>
  );
}
