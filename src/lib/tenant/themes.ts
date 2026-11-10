/**
 * Curated premium color themes for white-label partners.
 *
 * Instead of raw hex pickers (which lead to clashing, unprofessional combos),
 * partners choose from 6 tested themes. Each theme is designed to render
 * well across all 12 landing-page sections, dashboards, buttons, and emails.
 */

export type PremiumTheme = {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
};

export const PREMIUM_THEMES: PremiumTheme[] = [
  {
    id: "royal-blue",
    name: "Royal Blue",
    description: "Trust & reliability — classic banking",
    primaryColor: "#185DF5",
    accentColor: "#F97606",
  },
  {
    id: "deep-purple",
    name: "Deep Purple",
    description: "Premium & modern fintech",
    primaryColor: "#7C3AED",
    accentColor: "#F59E0B",
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Growth & financial prosperity",
    primaryColor: "#059669",
    accentColor: "#D97706",
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    description: "Fresh & tech-forward",
    primaryColor: "#0891B2",
    accentColor: "#E11D48",
  },
  {
    id: "slate-pro",
    name: "Slate Pro",
    description: "Professional & corporate",
    primaryColor: "#1E293B",
    accentColor: "#3B82F6",
  },
  {
    id: "crimson",
    name: "Crimson",
    description: "Bold & energetic",
    primaryColor: "#DC2626",
    accentColor: "#7C3AED",
  },
];
