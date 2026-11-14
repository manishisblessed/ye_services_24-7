import {
  LayoutDashboard,
  Wallet,
  Send,
  Fingerprint,
  Smartphone,
  Receipt,
  Plane,
  History,
  User,
  Settings,
  LifeBuoy,
  QrCode,
  Users,
  ShieldCheck,
  ServerCog,
  KeyRound,
  Megaphone,
  BarChart3,
  Building2,
  CircleDollarSign,
  ScrollText,
  PackagePlus,
  HandCoins,
  Globe,
  UserCog,
  CreditCard,
  Monitor,
  Activity,
  Landmark,
  ListChecks,
  Power,
  Layers,
  Images,
  ShieldAlert,
  FileSignature,
  BookOpenCheck,
  Timer,
  Undo2,
  RotateCcw,
  ReceiptText,
  LineChart,
  ScanSearch,
  SlidersHorizontal,
  Tag,
  TrendingUp,
  Inbox,
  AlertTriangle,
  Gift,
  Trophy,
  Gauge,
  type LucideIcon
} from "lucide-react";
import type { Role } from "@/lib/auth";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  /** When present, this item renders as a collapsible parent tab whose
   *  children are individual links. The parent's own href is only used as a
   *  fallback landing route; it is never treated as a leaf link. */
  children?: NavItem[];
};

export type NavGroup = {
  heading: string;
  items: NavItem[];
};

// BankingPoint24 nav labels — unique vocabulary for every role.
// Routes are unchanged so bookmarks and backend slugs stay stable.
const baseServices: NavItem[] = [
  { href: "/dashboard/wallet", label: "My Float", icon: Wallet },
  { href: "/dashboard/aadhaar-pay", label: "Cash Withdrawal", icon: Fingerprint },
  { href: "/dashboard/money-transfer", label: "Send Money", icon: Send },
  { href: "/dashboard/payout", label: "Quick Payout", icon: Landmark, badge: "New" },
  { href: "/dashboard/knteer-payout", label: "Bank Transfer", icon: Landmark },
  { href: "/dashboard/upi", label: "UPI Receive", icon: Send },
  { href: "/dashboard/qr", label: "Payment QR", icon: QrCode, badge: "New" },
  { href: "/dashboard/pg", label: "Online Collect", icon: CreditCard, badge: "New" },
  { href: "/dashboard/pos", label: "POS Machine", icon: Monitor, badge: "New" },
  { href: "/dashboard/recharge/mobile", label: "Recharge & Data", icon: Smartphone },
  { href: "/dashboard/travel/flight", label: "Bus · Flight · Hotel", icon: Plane },
  { href: "/dashboard/virtual-account", label: "Fixed Account", icon: Building2 }
];

const bbpsServices: NavItem[] = [
  { href: "/dashboard/bill-pay/credit-card", label: "Credit Card Pay", icon: CreditCard, badge: "New" },
  { href: "/dashboard/bill-pay/cc-pay", label: "Credit Card Bill · Rail 2", icon: CreditCard, badge: "New" },
  { href: "/dashboard/bill-pay/offline-cc-pay", label: "Offline CC Bill", icon: CreditCard, badge: "New" },
  { href: "/dashboard/bill-pay/bbps-1", label: "Electricity & Utilities", icon: Receipt, badge: "New" },
  { href: "/dashboard/bill-pay/bbps-2", label: "Unified Bill Platform", icon: Receipt, badge: "New" },
];

/** All BBPS / bill-payment services collapsed under a single "Bill Payments" tab. */
const bbpsGroup: NavItem = {
  href: "/dashboard/bill-pay/credit-card",
  label: "Bill Payments",
  icon: Receipt,
  children: bbpsServices,
};

/** RT gets all services including the collapsible Bill Payments tab */
const retailerServices: NavItem[] = [...baseServices, bbpsGroup];

/** DT/MD/SD no longer have a Run Services section; this array is kept only for
 *  reference or future re-enablement. Wallet is excluded for network roles. */
const networkServices: NavItem[] = baseServices.filter((s) => s.href !== "/dashboard/wallet");

const account: NavItem[] = [
  { href: "/dashboard/transactions", label: "All Transactions", icon: History },
  { href: "/dashboard/ledger", label: "My Passbook", icon: BookOpenCheck, badge: "New" },
  { href: "/dashboard/performance", label: "Performance", icon: Activity },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/disputes", label: "Support", icon: LifeBuoy, badge: "New" }
];

/**
 * Permission slug for the master-admin "Today's Business Overview" dashboard
 * section. Not a sidebar route — it gates the additive Overview section only, and
 * is grantable to an admin through the standard Manage Admins tab-assignment UI.
 */
export const BUSINESS_OVERVIEW_TAB = "business-overview";

/** Canonical tab slugs (without role prefix) used for permission assignment */
export const ASSIGNABLE_ADMIN_TABS = [
  { href: BUSINESS_OVERVIEW_TAB, label: "Today's Business Overview" },
  { href: "invites", label: "Send Invites" },
  { href: "join-requests", label: "Entry Gate" },
  { href: "users", label: "Member Directory" },
  { href: "network", label: "Network Map" },
  { href: "sub-admins", label: "Team Access" },
  { href: "wallet-ops", label: "Float Control" },
  { href: "ledger", label: "Account Ledger" },
  { href: "pg", label: "PG Dashboard" },
  { href: "pos", label: "POS Fleet" },
  { href: "pos-rental", label: "POS Rentals" },
  { href: "pos-bookings", label: "POS Orders" },
  { href: "kyc", label: "ID Verification" },
  { href: "schemes", label: "Rate Schemes" },
  { href: "incentives", label: "Incentive Manager" },
  { href: "brands", label: "Rate Manager" },
  { href: "settlement-ops", label: "Settlements" },
  { href: "pos-settlement", label: "POS Settlements" },
  { href: "pos-slips", label: "POS Slips" },
  { href: "pos-reversals", label: "POS Reversals" },
  { href: "reversals", label: "Reversals" },
  { href: "needs-review", label: "Needs Review" },
  { href: "payout-review", label: "Held Payouts" },
  { href: "money-at-risk", label: "Risk Exposure" },
  { href: "aeps", label: "AePS Manager" },
  { href: "qr", label: "QR Manager" },
  { href: "disputes", label: "Helpdesk" },
  { href: "aml", label: "AML Watch" },
  { href: "commission-report", label: "Commission Report" },
  { href: "earnings", label: "Earnings Report" },
  { href: "analytics", label: "Analytics" },
  { href: "agreements", label: "Agreements" },
  { href: "verify", label: "Verification" },
  { href: "services", label: "Toggle Services" },
  { href: "controls", label: "Service Controls" },
  { href: "limits", label: "Txn Limits" },
  { href: "slider", label: "Banner Manager" },
  { href: "audit", label: "Activity Log" },
  { href: "system", label: "System Health" },
  { href: "whitelabel", label: "Partner Brands" },
] as const;

/** Tabs a master-admin creator can assign to another master-admin.
 *  Includes everything from ASSIGNABLE_ADMIN_TABS + the "admins" tab. */
export const ASSIGNABLE_MASTER_ADMIN_TABS = [
  { href: "admins", label: "Admin Roster" },
  // "Company Revenue" (Revenue Wallet) is owner-only — assignable to master
  // admins, but never to plain admins/sub-admins (not in ASSIGNABLE_ADMIN_TABS).
  { href: "revenue", label: "Company Revenue" },
  ...ASSIGNABLE_ADMIN_TABS,
] as const;

/** Tab slugs an admin (or master-admin) can grant to a sub-admin. Sub-admins
 *  can now be granted any admin tab; sensitive money-movement pages stay
 *  view-only for the SUPPORT role via the per-endpoint requireRole guards. */
export const ASSIGNABLE_SUB_ADMIN_TABS = ASSIGNABLE_ADMIN_TABS;

/* ────────────────────────────────────────────────────────────────────
 * BankingPoint24 staff navigation — seven purpose-built desks instead
 * of two catch-all menus. Routes are unchanged; only grouping, order
 * and labels are BankingPoint24-specific.
 * ──────────────────────────────────────────────────────────────────── */

/** Desk 1 — Command Deck: home, oversight, reporting, platform health. */
const adminCommandDeck: NavItem[] = [
  { href: "/dashboard", label: "Platform Home", icon: LayoutDashboard },
  { href: "/dashboard/admin/sub-admins", label: "Team Access", icon: UserCog },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/admin/audit", label: "Activity Log", icon: ScrollText },
  { href: "/dashboard/admin/system", label: "System Health", icon: ServerCog },
];

/** Command Deck for the platform OWNER — adds the Admin Roster. */
const masterAdminCommandDeck: NavItem[] = adminCommandDeck.flatMap((item) =>
  item.href === "/dashboard"
    ? [item, { href: "/dashboard/admin/admins", label: "Admin Roster", icon: ShieldCheck }]
    : [item]
);

/** Desk 2 — Partner Network: everyone who joins, sells or brands under us. */
const adminPartnerNetwork: NavItem[] = [
  { href: "/dashboard/admin/invites", label: "Send Invites", icon: PackagePlus },
  { href: "/dashboard/admin/join-requests", label: "Entry Gate", icon: Inbox },
  { href: "/dashboard/admin/users", label: "Member Directory", icon: Users },
  { href: "/dashboard/admin/network", label: "Network Map", icon: Users },
  { href: "/dashboard/admin/kyc", label: "ID Verification", icon: ShieldCheck },
  { href: "/dashboard/admin/identity-exceptions", label: "Exception Log", icon: Fingerprint },
  { href: "/dashboard/admin/disputes", label: "Helpdesk", icon: LifeBuoy },
  { href: "/dashboard/admin/whitelabel", label: "Partner Brands", icon: Globe, badge: "New" },
];

/** Desk 3 — Money Desk: float, ledgers, settlements and earnings. */
const adminMoneyDesk: NavItem[] = [
  { href: "/dashboard/admin/wallet-ops", label: "Float Control", icon: Wallet },
  { href: "/dashboard/admin/ledger", label: "Account Ledger", icon: BookOpenCheck },
  { href: "/dashboard/admin/settlement-ops", label: "Settlements", icon: Timer },
  // NOTE: "Company Revenue" (Revenue Wallet) is deliberately NOT here — it
  // is owner-only and injected into the master-admin menu below.
  { href: "/dashboard/payout-approvals", label: "Payout Approvals", icon: ListChecks },
  { href: "/dashboard/admin/commission-report", label: "Commission Report", icon: HandCoins },
  { href: "/dashboard/admin/earnings", label: "Earnings Report", icon: TrendingUp },
];

/** Money Desk for the platform OWNER — adds "Company Revenue" (Revenue
 *  Wallet). Company earnings are never shown to plain admins/sub-admins. */
const masterAdminMoneyDesk: NavItem[] = adminMoneyDesk.flatMap((item) =>
  item.href === "/dashboard/admin/settlement-ops"
    ? [item, { href: "/dashboard/admin/revenue", label: "Company Revenue", icon: CircleDollarSign }]
    : [item]
);

/** Desk 4 — Acquiring & Devices: PG, QR, AePS and the POS fleet lifecycle. */
const adminAcquiringDesk: NavItem[] = [
  { href: "/dashboard/admin/pg", label: "PG Dashboard", icon: CreditCard },
  { href: "/dashboard/admin/qr", label: "QR Manager", icon: QrCode },
  { href: "/dashboard/admin/aeps", label: "AePS Manager", icon: Fingerprint },
  { href: "/dashboard/admin/pos", label: "POS Fleet", icon: Monitor },
  { href: "/dashboard/admin/pos-bookings", label: "POS Orders", icon: PackagePlus },
  { href: "/dashboard/admin/pos-rental", label: "POS Rentals", icon: ReceiptText },
  { href: "/dashboard/admin/pos-settlement", label: "POS Settlements", icon: CreditCard },
  { href: "/dashboard/admin/pos-slips", label: "POS Slips", icon: ListChecks },
  { href: "/dashboard/admin/pos-reversals", label: "POS Reversals", icon: RotateCcw },
];

/** Desk 5 — Growth Studio: pricing, incentives and promotion. */
const adminGrowthStudio: NavItem[] = [
  { href: "/dashboard/admin/schemes", label: "Rate Schemes", icon: Layers },
  { href: "/dashboard/admin/brands", label: "Rate Manager", icon: Tag },
  { href: "/dashboard/admin/incentives", label: "Incentive Manager", icon: Gift },
  { href: "/dashboard/admin/slider", label: "Banner Manager", icon: Images },
];

/** Desk 6 — Risk & Compliance: everything that can hurt the platform. */
const adminRiskDesk: NavItem[] = [
  { href: "/dashboard/admin/needs-review", label: "Needs Review", icon: AlertTriangle },
  { href: "/dashboard/admin/payout-review", label: "Held Payouts", icon: Landmark },
  { href: "/dashboard/admin/reversals", label: "Reversals", icon: Undo2 },
  { href: "/dashboard/admin/money-at-risk", label: "Risk Exposure", icon: ShieldAlert },
  { href: "/dashboard/admin/aml", label: "AML Watch", icon: ShieldAlert },
  { href: "/dashboard/admin/agreements", label: "Agreements", icon: FileSignature },
  { href: "/dashboard/admin/verify", label: "Verification", icon: ScanSearch },
];

/** Desk 7 — Service Switchboard: rails on/off, routing controls, limits. */
const adminSwitchboard: NavItem[] = [
  { href: "/dashboard/admin/services", label: "Toggle Services", icon: Power },
  { href: "/dashboard/admin/controls", label: "Service Controls", icon: SlidersHorizontal },
  { href: "/dashboard/admin/limits", label: "Txn Limits", icon: Gauge },
];

/** The staff desks shared by admin and sub-admin. Sub-admins are scoped down
 *  through their allowedTabs; empty desks disappear from the rail entirely. */
const adminDesks: NavGroup[] = [
  { heading: "Command Deck", items: adminCommandDeck },
  { heading: "Partner Network", items: adminPartnerNetwork },
  { heading: "Money Desk", items: adminMoneyDesk },
  { heading: "Acquiring & Devices", items: adminAcquiringDesk },
  { heading: "Growth Studio", items: adminGrowthStudio },
  { heading: "Risk & Compliance", items: adminRiskDesk },
  { heading: "Service Switchboard", items: adminSwitchboard },
];

/** Partner Hub — self-serve growth tools for distribution partners.
 *  White-label + API access is enforced server-side for MD/SD accounts. */
const partnerHub: NavItem[] = [
  { href: "/dashboard/whitelabel", label: "My Brand Portal", icon: Globe, badge: "New" },
  { href: "/dashboard/api", label: "API & Webhooks", icon: KeyRound, badge: "New" },
  { href: "/dashboard/marketing", label: "Marketing Studio", icon: Megaphone, badge: "New" },
];

export const navByRole: Record<Role, NavGroup[]> = {
  "master-admin": [
    { heading: "Command Deck", items: masterAdminCommandDeck },
    { heading: "Partner Network", items: adminPartnerNetwork },
    { heading: "Money Desk", items: masterAdminMoneyDesk },
    { heading: "Acquiring & Devices", items: adminAcquiringDesk },
    { heading: "Growth Studio", items: adminGrowthStudio },
    { heading: "Risk & Compliance", items: adminRiskDesk },
    { heading: "Service Switchboard", items: adminSwitchboard },
    { heading: "My Profile", items: account }
  ],

  retailer: [
    {
      heading: "My Kiosk",
      items: [
        { href: "/dashboard", label: "Home", icon: LayoutDashboard },
        { href: "/dashboard/earnings", label: "Commission Board", icon: CircleDollarSign, badge: "New" },
        { href: "/dashboard/funds-request", label: "Add Float", icon: HandCoins },
        { href: "/dashboard/my-scheme", label: "My Rate Card", icon: Layers, badge: "New" },
        { href: "/dashboard/rewards", label: "Star Points", icon: Gift, badge: "New" },
        { href: "/dashboard/pos-booking", label: "Request POS", icon: PackagePlus, badge: "New" },
        { href: "/dashboard/pos-rental", label: "Terminal Dues", icon: ReceiptText, badge: "New" },
        { href: "/dashboard/reports", label: "My Reports", icon: BarChart3 }
      ]
    },
    { heading: "Counter Services", items: retailerServices },
    { heading: "My Profile", items: account }
  ],

  distributor: [
    {
      heading: "My Retailers",
      items: [
        { href: "/dashboard", label: "Home", icon: LayoutDashboard },
        { href: "/dashboard/earnings", label: "My Commission", icon: CircleDollarSign, badge: "New" },
        { href: "/dashboard/network", label: "Retailer List", icon: Users },
        { href: "/dashboard/network/command-center", label: "Zone Dashboard", icon: Gauge, badge: "Live" },
        { href: "/dashboard/network/onboard", label: "Add Retailer", icon: PackagePlus },
        { href: "/dashboard/network/schemes", label: "Rate Assignment", icon: Layers, badge: "New" },
        { href: "/dashboard/approvals", label: "Action Pending", icon: FileSignature },
        { href: "/dashboard/my-scheme", label: "My Rates", icon: Layers, badge: "New" },
        { href: "/dashboard/reports", label: "Reports", icon: BarChart3 }
      ]
    },
    {
      heading: "Partner Hub",
      // Distributors get the Marketing Studio; brand portal & API unlock at MD/SD.
      items: partnerHub.filter((i) => i.href === "/dashboard/marketing")
    },
    { heading: "My Profile", items: account }
  ],

  "super-distributor": [
    {
      heading: "My Zone",
      items: [
        { href: "/dashboard", label: "Home", icon: LayoutDashboard },
        { href: "/dashboard/earnings", label: "My Commission", icon: CircleDollarSign, badge: "New" },
        { href: "/dashboard/network", label: "Master Dist. List", icon: Users },
        { href: "/dashboard/network/command-center", label: "Regional Dashboard", icon: Gauge, badge: "Live" },
        { href: "/dashboard/network/onboard", label: "Recruit MD", icon: PackagePlus },
        { href: "/dashboard/network/schemes", label: "Rate Assignment", icon: Layers, badge: "New" },
        { href: "/dashboard/approvals", label: "Action Pending", icon: FileSignature },
        { href: "/dashboard/my-scheme", label: "My Rates", icon: Layers, badge: "New" },
        { href: "/dashboard/reports", label: "Reports", icon: BarChart3 }
      ]
    },
    { heading: "Partner Hub", items: partnerHub },
    { heading: "My Profile", items: account }
  ],

  "master-distributor": [
    {
      heading: "My Distributors",
      items: [
        { href: "/dashboard", label: "Home", icon: LayoutDashboard },
        { href: "/dashboard/earnings", label: "My Commission", icon: CircleDollarSign, badge: "New" },
        { href: "/dashboard/network", label: "Distributor List", icon: Users },
        { href: "/dashboard/network/command-center", label: "Zone Dashboard", icon: Gauge, badge: "Live" },
        { href: "/dashboard/network/onboard", label: "Add Distributor", icon: PackagePlus },
        { href: "/dashboard/network/schemes", label: "Rate Assignment", icon: Layers, badge: "New" },
        { href: "/dashboard/approvals", label: "Action Pending", icon: FileSignature },
        { href: "/dashboard/my-scheme", label: "My Rates", icon: Layers, badge: "New" },
        { href: "/dashboard/reports", label: "Reports", icon: BarChart3 }
      ]
    },
    { heading: "Partner Hub", items: partnerHub },
    { heading: "My Profile", items: account }
  ],

  "whitelabel-partner": [
    {
      heading: "My Platform",
      items: [
        { href: "/dashboard", label: "Home", icon: LayoutDashboard },
        { href: "/dashboard/earnings", label: "My Commission", icon: CircleDollarSign, badge: "New" },
        { href: "/dashboard/network", label: "Network", icon: Users },
        { href: "/dashboard/network/command-center", label: "Platform Dashboard", icon: Gauge, badge: "Live" },
        { href: "/dashboard/network/onboard", label: "Add Super Distributor", icon: PackagePlus },
        { href: "/dashboard/network/schemes", label: "Rate Assignment", icon: Layers, badge: "New" },
        { href: "/dashboard/approvals", label: "Action Pending", icon: FileSignature },
        { href: "/dashboard/my-scheme", label: "My Rates", icon: Layers, badge: "New" },
        { href: "/dashboard/reports", label: "Reports", icon: BarChart3 }
      ]
    },
    {
      // Tenant-scoped slice of the admin desk. Every page here is confined to
      // the partner's own company by the middleware allowlist + API tenant scope.
      heading: "Company Team",
      items: [
        { href: "/dashboard/admin/users", label: "Member Directory", icon: Users },
        { href: "/dashboard/admin/network", label: "Network Map", icon: Users },
        { href: "/dashboard/admin/admins", label: "Admin Roster", icon: ShieldCheck },
        { href: "/dashboard/admin/sub-admins", label: "Team Access", icon: UserCog },
      ]
    },
    {
      // Pricing Studio — the partner (and their admins) manage their OWN rate
      // schemes. Every scheme & slab is isolated to this tenant by the API.
      heading: "Pricing Studio",
      items: [
        { href: "/dashboard/admin/schemes", label: "Rate Schemes", icon: Layers },
      ]
    },
    { heading: "Partner Hub", items: partnerHub },
    { heading: "My Profile", items: account }
  ],

  admin: [...adminDesks, { heading: "My Profile", items: account }],

  finance: [
    {
      heading: "Financial Desk",
      items: [
        { href: "/dashboard", label: "Platform Home", icon: LayoutDashboard },
        { href: "/dashboard/admin/wallet-ops", label: "Float Control", icon: Wallet },
        { href: "/dashboard/admin/ledger", label: "Account Ledger", icon: BookOpenCheck },
        // Read-only for finance: the queue is viewable but Approve/Reject is
        // gated to master-admin/admin in both the UI and the API.
        { href: "/dashboard/admin/pos-slips", label: "POS Slips", icon: ListChecks },
        // "Company Revenue" (Revenue Wallet) is owner-only; finance uses the
        // Commission Report + Earnings Report instead.
        { href: "/dashboard/admin/commission-report", label: "Commission Report", icon: HandCoins },
        { href: "/dashboard/admin/earnings", label: "Earnings Report", icon: TrendingUp },
        { href: "/dashboard/admin/analytics", label: "Analytics", icon: LineChart },
        { href: "/dashboard/reports", label: "Reports", icon: BarChart3 }
      ]
    },
    { heading: "My Profile", items: account }
  ],

  "sub-admin": [...adminDesks, { heading: "My Profile", items: account }]
};
