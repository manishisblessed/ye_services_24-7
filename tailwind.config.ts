import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem"
      },
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        // Brand = BankingPoint24 deep navy (matches the "trans" wordmark)
        brand: {
          50: "#eef2fb",
          100: "#d6def4",
          200: "#adbce9",
          300: "#7f94d8",
          400: "#526fc5",
          500: "#2f4daa",
          600: "#1f3b8b",
          700: "#172b6b",
          800: "#112052",
          900: "#0b1740",
          950: "#060e2a"
        },
        // Accent = BankingPoint24 leaf green (matches the "Point" wordmark and
        // the growth-arrow swoosh in the logo).
        accent: {
          50: "#f3faee",
          100: "#e3f3d7",
          200: "#c8e7af",
          300: "#a5d67f",
          400: "#82c155",
          500: "#61a93a",
          600: "#4a8a2b",
          700: "#3a6b24",
          800: "#315620",
          900: "#2a481e",
          950: "#14270c"
        },
        // Royal = a lifted navy/sky lane used for secondary highlights, pills,
        // nav links, filter chips. Kept as a separate scale so existing
        // `text-royal-700` / `bg-royal-50` className references stay valid —
        // just rendered in-brand on the navy/teal palette.
        royal: {
          50: "#eef4fe",
          100: "#dae7fd",
          200: "#b9d1fb",
          300: "#8bb3f6",
          400: "#5e8ff0",
          500: "#3b6fe3",
          600: "#2855cc",
          700: "#1f3b8b",
          800: "#1a2f6e",
          900: "#172b6b",
          950: "#0b1740"
        },
        // Coral = warm harvest amber. Attention chips, numeric badges and
        // hover highlights get a warm counterpoint to the navy + green brand.
        coral: {
          50: "#fff8eb",
          100: "#feecc7",
          200: "#fdd68a",
          300: "#fcbb4d",
          400: "#fa9f24",
          500: "#f4830b",
          600: "#d86206",
          700: "#b34509",
          800: "#92360e",
          900: "#782d0f",
          950: "#451503"
        },
        ink: {
          50: "#f5f7fa",
          100: "#eaeef4",
          200: "#cfd7e3",
          300: "#a4b3c8",
          400: "#7388a6",
          500: "#516a8c",
          600: "#3f5473",
          700: "#34445d",
          800: "#2e3a4f",
          900: "#0e1626",
          950: "#070b14"
        }
      },
      fontFamily: {
        // Satoshi is the BankingPoint24 body/UI face.
        sans: [
          '"Satoshi"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ],
        // Clash Display is the BankingPoint24 headline face — editorial, confident, bold.
        display: [
          '"Clash Display"',
          '"Satoshi"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      },
      // Extended radius scale — BankingPoint24 leans on larger, squircle-style corners.
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      backgroundImage: {
        // BankingPoint24 premium mesh: navy → royal → leaf green (growth, bank-grade)
        "hero-radial":
          "radial-gradient(42% 55% at 18% 12%, rgba(23,43,107,0.22) 0%, rgba(23,43,107,0) 60%), radial-gradient(40% 50% at 82% 20%, rgba(31,59,139,0.18) 0%, rgba(31,59,139,0) 60%), radial-gradient(45% 55% at 25% 100%, rgba(97,169,58,0.16) 0%, rgba(97,169,58,0) 60%), radial-gradient(40% 50% at 90% 95%, rgba(130,193,85,0.14) 0%, rgba(130,193,85,0) 60%)",
        "grid-pattern":
          "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
        // Primary premium gradient: navy → royal → leaf green
        "brand-gradient":
          "linear-gradient(120deg, #172b6b 0%, #1f3b8b 45%, #4a8a2b 100%)",
        // Signature BankingPoint24 "energy" gradient — navy → royal → leaf green,
        // used on primary CTAs, active states and focus rings. The single thing
        // that makes a page feel immediately "bankingpoint24".
        "energy-gradient":
          "linear-gradient(135deg, #172b6b 0%, #1f3b8b 45%, #4a8a2b 100%)",
        "energy-gradient-x":
          "linear-gradient(90deg, #172b6b 0%, #1f3b8b 50%, #4a8a2b 100%)",
        "aurora-gradient":
          "conic-gradient(from 140deg at 50% 50%, #172b6b 0deg, #1f3b8b 95deg, #61a93a 205deg, #a5d67f 300deg, #172b6b 360deg)",
        // Fine SVG noise for premium grain overlays
        "grain":
          "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/></svg>\")"
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15,23,42,0.18)",
        glow: "0 20px 50px -12px rgba(23,43,107,0.45)",
        "glow-brand": "0 20px 50px -12px rgba(31,59,139,0.45)",
        "glow-coral": "0 20px 50px -12px rgba(244,131,11,0.40)",
        // Signature BankingPoint24 colored shadow — navy→green spread, used on hover
        // of primary surfaces (cards, CTAs).
        "energy": "0 24px 60px -18px rgba(23,43,107,0.45), 0 10px 24px -12px rgba(97,169,58,0.28)",
        "energy-sm": "0 12px 28px -14px rgba(23,43,107,0.40), 0 4px 12px -6px rgba(97,169,58,0.22)",
        "inner-ring": "inset 0 0 0 1px rgba(255,255,255,0.6)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        "float-slow": {
          "0%, 100%": { transform: "translate(0,0) rotate(0deg)" },
          "50%": { transform: "translate(20px,-30px) rotate(8deg)" }
        },
        spin3d: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" }
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2.2)", opacity: "0" }
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        "scroll-y": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" }
        },
        // Signature BankingPoint24 gradient sweep used on logo + headlines.
        "gradient-sweep": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        // Soft brand-dot pulse used on Logo + online indicators.
        "ping-soft": {
          "0%": { transform: "scale(1)", opacity: "0.75" },
          "80%, 100%": { transform: "scale(2.4)", opacity: "0" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        marquee: "marquee 30s linear infinite",
        shimmer: "shimmer 2.4s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 12s ease-in-out infinite",
        spin3d: "spin3d 20s linear infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        "scroll-y": "scroll-y 40s linear infinite",
        "gradient-sweep": "gradient-sweep 6s ease-in-out infinite",
        "ping-soft": "ping-soft 2.4s cubic-bezier(0,0,0.2,1) infinite"
      }
    }
  },
  plugins: []
};

export default config;
