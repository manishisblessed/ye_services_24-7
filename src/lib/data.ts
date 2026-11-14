import {
  Banknote,
  Smartphone,
  Wifi,
  Tv,
  Lightbulb,
  Droplets,
  Flame,
  CreditCard,
  Bus,
  Hotel,
  Plane,
  Wallet,
  QrCode,
  Building2,
  Receipt,
  GraduationCap,
  Send,
  Fingerprint,
  ShieldCheck,
  Monitor,
  type LucideIcon
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// BankingPoint24 — central brand & regulatory details.
// TODO: Replace `cin`, `gstin`, `incorporated` with the actual registered
// values before going live.
// ─────────────────────────────────────────────────────────────────────────────
export const company = {
  legalName: "RUTVA MULTISERVICES LLP",
  brand: "BankingPoint24",
  tradeName: "bankingpoint-24",
  domain: "bankingpoint-24.com",
  email: "support@bankingpoint-24.com",
  supportEmail: "support@bankingpoint-24.com",
  legalEmail: "legal@bankingpoint-24.com",
  grievanceEmail: "grievance@bankingpoint-24.com",
  nodalEmail: "nodal@bankingpoint-24.com",
  phone: "7069300077",
  cin: "TBD",
  gstin: "TBD",
  incorporated: "2026",
  jurisdiction: "Anand, Gujarat",
  address:
    "203, H M Patel Trade Center, Mota Bazaar, V V Nagar, Anand, Gujarat - 388120, IN",
  shortAddress: "V V Nagar, Anand, Gujarat"
};

// Mandatory under IT Rules 2021 (Intermediary Guidelines) & applicable Master Direction
// on Customer Service in Banks, 2024.
export const grievanceOfficer = {
  name: "Grievance Officer",
  designation: "Grievance Redressal Officer",
  email: "grievance@bankingpoint-24.com",
  phone: "+91 7069300077",
  hours: "Monday to Saturday, 10:00 AM – 6:00 PM IST",
  address:
    "203, H M Patel Trade Center, Mota Bazaar, V V Nagar, Anand, Gujarat - 388120, IN",
  responseSla: "Acknowledgement within 24 hours · Resolution within 15 working days"
};

export const nodalOfficer = {
  name: "Nodal Officer",
  designation: "Principal Nodal Officer",
  email: "nodal@bankingpoint-24.com",
  phone: "+91 7069300077"
};

/** Dedicated support team — shown in the footer Support Desk section. */
export type SupportContact = {
  department: string;
  name: string;
  phone: string;
  scope: string;
};

export const supportTeam: SupportContact[] = [
  {
    department: "Company Operations & General Information",
    name: "Barot Jayesh",
    phone: "+91 8758068295",
    scope: "For all company operations, portal-related information and general operational queries."
  },
  {
    department: "Marketing & POS Support",
    name: "Raj Patel",
    phone: "+91 7201946436",
    scope: "For marketing-related queries, POS machine information and assistance."
  },
  {
    department: "QR Support",
    name: "Harshad Meniya",
    phone: "+91 9924989021",
    scope: "For all QR-related information, transactions and technical assistance."
  },
  {
    department: "New ID Creation & ID-Related Support",
    name: "Jayveer Parmar",
    phone: "+91 9265653141",
    scope: "For new ID creation, ID-related information and assistance."
  }
];

export type ServiceItem = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: "banking" | "recharge" | "bills" | "travel" | "other";
  badge?: string;
};

export const services: ServiceItem[] = [
  {
    slug: "payment-gateway",
    title: "Online Payment Gateway",
    description:
      "Send a payment link on WhatsApp or plug a checkout into your site. One flow covers UPI, cards and net banking, with next-morning settlement.",
    icon: CreditCard,
    href: "/dashboard/pg",
    category: "banking",
    badge: "Popular"
  },
  {
    slug: "pos",
    title: "Card Machine (POS)",
    description:
      "A pocket-size Android machine that takes taps, swipes and scans at your counter. Small monthly rental — return or upgrade whenever you like.",
    icon: Monitor,
    href: "/dashboard/pos",
    category: "banking"
  },
  {
    slug: "qr-payments",
    title: "Shop QR (Scan & Pay)",
    description:
      "A QR standee carrying your shop's name sits by the cash box. The speaker announces every credit, so you never look up from the customer.",
    icon: QrCode,
    href: "/dashboard/qr",
    category: "banking",
    badge: "Top pick"
  },
  {
    slug: "aadhaar-pay",
    title: "AePS Cash Point",
    description:
      "Customers withdraw cash from any bank account with just a thumb impression. You earn on every withdrawal and become the bank for your street.",
    icon: Fingerprint,
    href: "/dashboard/aadhaar-pay",
    category: "banking"
  },
  {
    slug: "money-transfer",
    title: "Money Transfer (DMT)",
    description: "Send money home for migrant workers and locals alike — IMPS to any bank, any hour, bank holidays included.",
    icon: Send,
    href: "/dashboard/money-transfer",
    category: "banking"
  },
  {
    slug: "upi",
    title: "UPI Collect",
    description: "Raise a collect request straight to the customer's UPI app. Nothing to print, nothing to install — a mobile number is enough.",
    icon: QrCode,
    href: "/dashboard/upi",
    category: "banking"
  },
  {
    slug: "wallet",
    title: "Float Wallet",
    description: "Top up a single float in the morning and run every service off it all day. One ledger, one reconciliation, zero juggling.",
    icon: Wallet,
    href: "/dashboard/wallet",
    category: "banking"
  },
  {
    slug: "virtual-account",
    title: "Virtual Account",
    description: "An account number dedicated to your counter. Anything customers or distributors transfer into it credits your float automatically.",
    icon: Building2,
    href: "/dashboard/virtual-account",
    category: "banking",
    badge: "New"
  },
  {
    slug: "credit-card",
    title: "Card Bill Settlement",
    description: "Accept credit card bill payments across every issuing bank. The customer pays cash at your counter; the card clears on the spot.",
    icon: CreditCard,
    href: "/dashboard/bill-pay/credit-card",
    category: "bills"
  },
  {
    slug: "mobile-recharge",
    title: "Mobile Recharge",
    description: "Prepaid top-ups for every operator with live plan browsing — the confirmation beep comes before the customer pockets the phone.",
    icon: Smartphone,
    href: "/dashboard/recharge/mobile",
    category: "recharge"
  },
  {
    slug: "dth",
    title: "DTH Recharge",
    description: "Tata Play, Dish, d2h, Sun — every DTH pack from one screen, activated while the customer waits.",
    icon: Tv,
    href: "/dashboard/recharge/dth",
    category: "recharge"
  },
  {
    slug: "broadband",
    title: "Broadband / OTT",
    description: "Renew Wi-Fi, landline and OTT plans in a few taps. Subscriptions repeat monthly, so this income shows up like clockwork.",
    icon: Wifi,
    href: "/dashboard/recharge/broadband",
    category: "recharge"
  },
  {
    slug: "electricity",
    title: "Electricity Bills",
    description: "Every state discom on BBPS. Pull the bill by consumer number, collect cash, hand over a stamped receipt.",
    icon: Lightbulb,
    href: "/dashboard/bill-pay/electricity",
    category: "bills"
  },
  {
    slug: "water",
    title: "Water Bills",
    description: "Clear municipal and board water bills while the customer stands at the counter — confirmation on screen and by SMS.",
    icon: Droplets,
    href: "/dashboard/bill-pay/water",
    category: "bills"
  },
  {
    slug: "gas",
    title: "Gas (Piped & LPG)",
    description: "Book LPG refills and settle piped-gas bills from the same screen. Confirmation lands before the kettle boils.",
    icon: Flame,
    href: "/dashboard/bill-pay/gas",
    category: "bills"
  },
  {
    slug: "flight",
    title: "Air Tickets",
    description: "Book domestic flights at B2B fares your customers can't see online — and keep the difference as your margin.",
    icon: Plane,
    href: "/dashboard/travel/flight",
    category: "travel"
  },
  {
    slug: "hotel",
    title: "Hotel Stays",
    description: "Reserve rooms across thousands of properties at trade rates. A natural add-on for wedding seasons and pilgrimage routes.",
    icon: Hotel,
    href: "/dashboard/travel/hotel",
    category: "travel"
  },
  {
    slug: "bus",
    title: "Bus Tickets",
    description: "Seats on AC, sleeper and seater coaches across intercity routes, with a healthy cut on every ticket you print.",
    icon: Bus,
    href: "/dashboard/travel/bus",
    category: "travel"
  },
  {
    slug: "education",
    title: "School & College Fees",
    description: "Take tuition, exam and admission fee payments for institutes nearby. Every academic term brings the same families back.",
    icon: GraduationCap,
    href: "/dashboard/bill-pay/education",
    category: "bills"
  },
  {
    slug: "insurance",
    title: "Insurance Renewals",
    description: "Renew life, health and vehicle policies across leading insurers. The premium receipt prints at your counter instantly.",
    icon: ShieldCheck,
    href: "/dashboard/bill-pay/insurance",
    category: "bills"
  },
  {
    slug: "broadband-bill",
    title: "Internet & Landline Bills",
    description: "Postpaid internet and landline dues cleared over BBPS rails with a real-time acknowledgment number.",
    icon: Wifi,
    href: "/dashboard/bill-pay/broadband",
    category: "bills"
  }
];

export type FaqItem = { q: string; a: string };

export const faqs: FaqItem[] = [
  {
    q: "What does a BankingPoint24 counter actually offer?",
    a: "Think of it as a bank branch, a bill desk and a travel agency compressed into the shop you already run. One login handles cash withdrawals, money transfers, 1,600+ billers, recharges and ticket bookings — and every completed transaction leaves a commission in your wallet."
  },
  {
    q: "Is the money moving through my counter safe?",
    a: "Yes. Funds travel only through RBI-licensed sponsor banks over NPCI rails. Your login carries two-factor authentication, sensitive actions need a separate MPIN, and fingerprints are matched on certified scanners without ever being stored by us."
  },
  {
    q: "Which bills can my customers pay here?",
    a: "Electricity, water, piped gas and LPG, broadband and landline, DTH, postpaid mobile, credit card dues, school and college fees, insurance premiums, FASTag and municipal taxes — more than 1,600 billers through BBPS plus direct tie-ups."
  },
  {
    q: "What documents do I need to open a counter?",
    a: "Just your PAN, your Aadhaar and a few shop details. Verification is a short video e-KYC done from your phone — no courier, no agent visit. Most partners bill their first customer the same day they sign up."
  },
  {
    q: "When do I actually see my commission?",
    a: "Instantly. The wallet credit appears the second a transaction settles, with your commission itemised on its own line. Move money to your bank over IMPS whenever you like — nights, Sundays and festival days included."
  },
  {
    q: "Any hidden charges I should worry about?",
    a: "None. Before you confirm any transaction, the screen shows the customer's charge and your earning side by side. The full rate card lives inside your dashboard, and any revision is announced before it takes effect."
  },
  {
    q: "How much can a counter realistically make?",
    a: "Counters serving 40–60 customers a day commonly clear ₹9,000–₹12,000 a month on cash services alone. Add bills, recharges and card acceptance, and ₹20,000 becomes a realistic ceiling. Put your own footfall into the calculator above."
  },
  {
    q: "What if a transaction fails midway?",
    a: "Amounts that are debited but not delivered reverse automatically inside the regulatory window, and anything that crosses it accrues a daily penalty paid to the customer. You can track every case from the disputes screen while our operations team follows up with the bank."
  }
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  rating: number;
};

// `role` is "<shop name>, <city>" — ProofLoop splits on the last comma.
export const testimonials: Testimonial[] = [
  {
    name: "Mahesh Chaudhari",
    role: "Chaudhari Kirana & More, Nashik",
    quote:
      "My counter does sixty-plus thumb withdrawals a day now. People who used to travel four kilometres to the bank simply walk in here instead.",
    rating: 5
  },
  {
    name: "Rukhsana Shaikh",
    role: "Shaikh Mobile Gallery, Bharuch",
    quote:
      "Transfers in the morning, recharges all day, bills in the evening. Last month the wallet closed at ₹16,800 in commission.",
    rating: 5
  },
  {
    name: "Gurpreet Singh",
    role: "Singh Communication Centre, Bathinda",
    quote:
      "During harvest season the cash withdrawals triple. Settlement is always there next morning — never once a day late.",
    rating: 5
  },
  {
    name: "Lakshmi Devi",
    role: "Sri Lakshmi Enterprises, Vijayawada",
    quote:
      "I started with only bill payments. Six months in, I run fifteen services and the colony knows my shop as the 'bank shop'.",
    rating: 5
  },
  {
    name: "Nilesh Rathod",
    role: "Rathod Tours & Travels, Vadodara",
    quote:
      "Bus bookings bring whole families in, and they clear their electricity bill while they wait. One customer, three commissions.",
    rating: 5
  }
];

export type Stat = { value: string; label: string };

export const heroStats: Stat[] = [
  { value: "52K+", label: "Partner counters" },
  { value: "1,600+", label: "Billers live" },
  { value: "63", label: "Income streams" },
  { value: "₹175 Cr+", label: "Moved every month" }
];

export type PricingPlan = {
  name: string;
  tagline: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  ctaHref: string;
};

export const pricingPlans: PricingPlan[] = [
  {
    name: "Retailer",
    tagline: "Run a single counter",
    description: "Open your shop counter today and start earning on 30+ everyday services.",
    features: [
      "AePS cash withdrawals",
      "Money transfer & UPI collect",
      "Bill payments & recharges",
      "Real-time wallet settlement",
      "Daily earnings dashboard",
      "Help centre & email support"
    ],
    cta: "Open a counter",
    ctaHref: "/register"
  },
  {
    name: "Distributor",
    tagline: "Manage a retailer network",
    description: "Recruit retailers under you and earn a commission override on every transaction they process.",
    features: [
      "Everything in Retailer",
      "Onboard & manage retailers",
      "Network override income",
      "Zone performance dashboard",
      "Rate scheme assignment",
      "Dedicated relationship manager"
    ],
    cta: "Become a Distributor",
    ctaHref: "/register"
  },
  {
    name: "Master Distributor",
    tagline: "Lead a regional network",
    description: "Build a network of distributors across a region with white-label branding and API access.",
    features: [
      "Everything in Distributor",
      "Manage distributor network",
      "White-label branding",
      "Developer API access",
      "Override commissions",
      "Regional analytics"
    ],
    highlighted: true,
    cta: "Become a Master Dist.",
    ctaHref: "/register"
  },
  {
    name: "Super Distributor",
    tagline: "Multi-state network head",
    description: "Oversee master distributors across multiple states with advanced controls and premium support.",
    features: [
      "Everything in Master Dist.",
      "Manage master distributors",
      "Multi-state network coverage",
      "Custom scheme design",
      "Platform-level analytics",
      "Premium onboarding support"
    ],
    cta: "Become a Super Dist.",
    ctaHref: "/register"
  },
  {
    name: "Whitelabel Partner",
    tagline: "Launch your own brand",
    description: "Launch a fully branded fintech platform under your own domain, logo, and mobile app.",
    features: [
      "Everything in Super Dist.",
      "Custom domain & logo",
      "Branded mobile app",
      "Full API & webhook access",
      "Revenue sharing model",
      "Dedicated tech support"
    ],
    cta: "Talk to partnerships",
    ctaHref: "/contact"
  }
];

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "ramesh-crossed-15k-first-month",
    title: "How Ramesh crossed ₹15,000 in commission during his first month",
    excerpt:
      "A Nagpur electronics shop added AePS and money transfer to his existing counter. Here is the setup, daily rhythm and customer flow that made it work.",
    date: "Sep 28, 2026",
    readTime: "6 min read",
    category: "Partner story"
  },
  {
    slug: "five-minute-opening-checklist",
    title: "The 5-minute opening checklist top-earning BankingPoint24 partners swear by",
    excerpt:
      "Verify float, clear overnight settlements, share today's QR on WhatsApp status, message your regulars. Five minutes that compound all day.",
    date: "Sep 14, 2026",
    readTime: "4 min read",
    category: "Playbook"
  },
  {
    slug: "commission-breakdown-aeps-dmt-pos",
    title: "AePS vs DMT vs POS — a 90-day commission breakdown from 3,000 counters",
    excerpt:
      "We analysed commission data from 3,000 active counters across 22 states. Per footfall, per rupee of float, one service outperforms the rest decisively.",
    date: "Aug 30, 2026",
    readTime: "8 min read",
    category: "Insights"
  }
];

export type NavLink = {
  label: string;
  href: string;
  children?: NavLink[];
};

// Public nav — BankingPoint24 top-level tabs. Services leads (it is the product),
// the logo is the home link, and Team lives in the footer only.
export const mainNav: NavLink[] = [
  {
    label: "Service board",
    href: "/services",
    children: [
      { label: "AePS Cash Point", href: "/services#aadhaar-pay" },
      { label: "Money Transfer", href: "/services#money-transfer" },
      { label: "UPI & Float Wallet", href: "/services#upi" },
      { label: "Bills & Recharges", href: "/services#bills" },
      { label: "Travel Desk", href: "/services#travel" }
    ]
  },
  { label: "Products", href: "/products" },
  { label: "Plans & rates", href: "/#pricing" },
  { label: "About", href: "/about" },
  { label: "Help desk", href: "/contact" }
];

export const footerLinks = {
  legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms & Conditions", href: "/legal/terms" },
    { label: "Refunds & Cancellation", href: "/legal/refunds" },
    { label: "Charges & Fees", href: "/legal/charges" },
    { label: "Grievance Redressal", href: "/legal/grievance" }
  ],
  services: [
    { label: "AePS", href: "/services#aadhaar-pay" },
    { label: "Money Transfer", href: "/services#money-transfer" },
    { label: "Bill Payments (BBPS)", href: "/services#bills" },
    { label: "Recharges", href: "/services#bills" },
    { label: "Travel Bookings", href: "/services#travel" }
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Products", href: "/products" },
    { label: "Career", href: "/career" },
    { label: "Team", href: "/team" },
    { label: "Contact", href: "/contact" }
  ],
  resources: [
    { label: "Pricing", href: "/#pricing" },
    { label: "Become an Agent", href: "/register" },
    { label: "Developer APIs", href: "/dashboard/api" },
    { label: "FAQs", href: "/#faq" },
    { label: "Press & Media", href: "/contact" }
  ]
};

// Compact certification chips shown in the footer compliance strip.
export const footerCertifications = [
  "RBI-licensed bank partners",
  "NPCI member rails",
  "UIDAI AUA / KUA",
  "PCI-DSS 4.0",
  "ISO/IEC 27001",
  "DPDP ready",
  "CERT-In audited",
  "Built in India"
];

export const trustBadges = [
  { label: "RBI-licensed rails", icon: ShieldCheck },
  { label: "NPCI member network", icon: ShieldCheck },
  { label: "PCI-DSS 4.0 secure", icon: ShieldCheck },
  { label: "ISO 27001 certified", icon: ShieldCheck }
];

// India-first missions powering Digital India.
export type IndiaMission = {
  code: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
};

export const indiaMissions: IndiaMission[] = [
  {
    code: "01",
    title: "Digital India",
    body:
      "Where the nearest branch is a bus ride away, your counter becomes the bank. BankingPoint24 powers that last mile.",
    stat: "1,100+",
    statLabel: "Gram Panchayats served by a BankingPoint24 outlet"
  },
  {
    code: "02",
    title: "Jan Dhan · Aadhaar · Mobile",
    body:
      "A thumb and an Aadhaar number are enough. No card, no passbook, no smartphone required from the customer.",
    stat: "₹0",
    statLabel: "Customer cost for an AePS withdrawal"
  },
  {
    code: "03",
    title: "UPI · BBPS · AePS",
    body:
      "BankingPoint24 runs on the same certified NPCI rails used by the largest banks — identical speed, identical security, your margin.",
    stat: "60+",
    statLabel: "Services live on your counter today"
  },
  {
    code: "04",
    title: "Self-Reliant India",
    body:
      "Engineered in Anand, Gujarat, hosted on Indian data centres, supported in 9 regional languages. Built in India, for India.",
    stat: "100%",
    statLabel: "Made in India"
  }
];

// Regulatory & security certifications proudly displayed on the home page.
export type Certification = {
  code: string;
  name: string;
  authority: string;
  status: string;
  description: string;
};

export const certifications: Certification[] = [
  {
    code: "REG",
    name: "Authorised Partner Banks",
    authority: "Reserve Bank of India",
    status: "Live",
    description:
      "All money-movement is settled through licensed sponsor banks holding a valid PA / PPI / BBPOU licence."
  },
  {
    code: "NPCI",
    name: "NPCI Certified",
    authority: "National Payments Corporation of India",
    status: "Certified",
    description:
      "Direct certified member rails for UPI 2.0, AePS, IMPS, NACH, RuPay, BBPS, NETC FASTag and APBS."
  },
  {
    code: "UIDAI",
    name: "UIDAI · AUA / KUA",
    authority: "Unique Identification Authority of India",
    status: "Sub-AUA",
    description:
      "Aadhaar authentication performed under a licensed AUA/KUA with mandatory STQC-certified biometric devices."
  },
  {
    code: "DPDP",
    name: "DPDP Act 2023 Ready",
    authority: "Ministry of Electronics & IT",
    status: "Compliant",
    description:
      "Data minimisation, purpose-limited consent, principal rights & breach notification — all baked in."
  },
  {
    code: "PCI",
    name: "PCI-DSS v4.0 Level 1",
    authority: "PCI Security Standards Council",
    status: "Certified",
    description:
      "Card data tokenised at issuer per card-on-file tokenisation (CoFT) guidelines. Quarterly ASV scans & annual on-site audit."
  },
  {
    code: "ISO",
    name: "ISO/IEC 27001:2022",
    authority: "International Standards Organisation",
    status: "Certified",
    description:
      "Information Security Management System audited and certified by an accredited Indian certification body."
  },
  {
    code: "CERT",
    name: "CERT-In Empanelled",
    authority: "Indian Computer Emergency Response Team",
    status: "Audited",
    description:
      "Annual VAPT by a CERT-In empanelled auditor. 6-hour incident reporting protocol as per CERT-In 2022 directions."
  },
  {
    code: "PMLA",
    name: "PMLA / KYC / AML",
    authority: "Financial Intelligence Unit – India",
    status: "Reporting",
    description:
      "Full KYC, transaction-monitoring, sanctions screening and STR/CTR reporting per PMLA Rules 2005."
  }
];

// Pan-India coverage data — fuels Coverage.tsx
export type CoverageRegion = {
  zone: string;
  states: number;
  retailers: string;
  topCities: string[];
};

export const coverageZones: CoverageRegion[] = [
  {
    zone: "North",
    states: 7,
    retailers: "19.2K",
    topCities: ["Delhi", "Lucknow", "Kanpur", "Jaipur", "Ludhiana"]
  },
  {
    zone: "West",
    states: 6,
    retailers: "21.4K",
    topCities: ["Mumbai", "Pune", "Ahmedabad", "Surat", "Aurangabad"]
  },
  {
    zone: "South",
    states: 5,
    retailers: "16.8K",
    topCities: ["Bengaluru", "Hyderabad", "Vijayawada", "Kochi", "Coimbatore"]
  },
  {
    zone: "East",
    states: 6,
    retailers: "11.3K",
    topCities: ["Kolkata", "Patna", "Ranchi", "Bhubaneswar", "Siliguri"]
  },
  {
    zone: "North-East",
    states: 4,
    retailers: "3.6K",
    topCities: ["Guwahati", "Shillong", "Aizawl", "Imphal", "Itanagar"]
  }
];

export const languagesSupported = [
  "English",
  "Hindi",
  "Gujarati",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Bengali",
  "Malayalam"
];

// Real, India-compliant legal page content rendered by /legal/[slug].
export type LegalSection = {
  id: string;
  heading: string;
  body: Array<string | { list: string[] } | { table: { headers: string[]; rows: string[][] } }>;
};

export type LegalDocument = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  lastUpdated: string;
  governedBy: string[];
  sections: LegalSection[];
};

export const legalDocuments: Record<string, LegalDocument> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    eyebrow: "Legal · Privacy",
    description:
      "How BankingPoint24 collects, uses, stores and protects your personal data — drafted as per the Digital Personal Data Protection Act, 2023, the Information Technology Act, 2000 and the SPDI Rules, 2011.",
    lastUpdated: "01 April 2026",
    governedBy: [
      "Digital Personal Data Protection Act, 2023",
      "Information Technology Act, 2000",
      "SPDI Rules, 2011",
      "applicable Master Direction on Digital Payment Security Controls, 2021"
    ],
    sections: [
      {
        id: "introduction",
        heading: "1. Introduction",
        body: [
          "This Privacy Policy (\"Policy\") governs the processing of personal data by RUTVA MULTISERVICES LLP, a company incorporated under the Companies Act, 2013 and having its registered office at 27 The Sun Residency, Nr. MatruBhakti Nani Bhagol, Mogri, Vidyanagar Police Station, Anand, Gujarat – 388345, IN (\"RUTVA MULTISERVICES LLP\", \"Company\", \"We\", \"Us\"), through its website bankingpoint-24.com, mobile applications and APIs (collectively, the \"Platform\").",
          "By accessing or using the Platform, you (the \"Data Principal\") consent to the practices described in this Policy. If you do not agree, please do not use the Platform."
        ]
      },
      {
        id: "data-we-collect",
        heading: "2. Categories of Personal Data we collect",
        body: [
          "We collect only such personal data as is reasonably necessary to deliver the financial services that you, or the merchant you are transacting with, have requested.",
          {
            list: [
              "Identity data — full name, date of birth, gender, photograph, signature.",
              "Government IDs — Aadhaar number (only for OTP/biometric e-KYC under UIDAI regulations), PAN, Voter ID, Driving Licence, Passport.",
              "Contact data — postal address, mobile number, email address.",
              "Financial data — bank account number, IFSC, UPI VPA, card BIN, transaction history, wallet balances.",
              "Biometric data — fingerprint / iris template captured solely on STQC-certified devices for AePS authentication. Templates are never stored on our servers.",
              "Device & log data — IP address, device ID, OS version, app version, browser, geo-location at the time of transaction, error logs.",
              "KYC documents — proof of address, proof of business, GST certificate, shop & establishment licence (for agents)."
            ]
          }
        ]
      },
      {
        id: "purpose",
        heading: "3. Purpose & lawful basis of processing",
        body: [
          "Your data is processed only for the specific, lawful purposes notified to you at the time of collection, in accordance with Section 7 of the DPDP Act, 2023:",
          {
            list: [
              "Customer onboarding, KYC and re-KYC as required by applicable Master Direction on KYC, 2016 and PMLA, 2002.",
              "Processing payment, AePS, DMT, BBPS, recharge, travel & PAN service requests initiated by you.",
              "Detection and prevention of fraud, money-laundering and terror-financing.",
              "Compliance with statutory and regulatory obligations including responding to lawful requests from NPCI, UIDAI, FIU-IND, Income-Tax Department, GSTN and law-enforcement agencies.",
              "Customer support, grievance redressal and dispute resolution.",
              "Improving the Platform, security testing and product analytics (only on de-identified data)."
            ]
          },
          "We do not use your personal data for any purpose other than those listed above without your fresh, free, specific, informed and unambiguous consent."
        ]
      },
      {
        id: "sharing",
        heading: "4. Sharing & disclosure",
        body: [
          "We do not sell your personal data. We share it only with the parties listed below and strictly to the extent necessary:",
          {
            list: [
              "Sponsor banks, payment system providers, card networks (Visa, Mastercard, RuPay), NPCI, BBPCU, UIDAI and acquirer banks to execute your transactions.",
              "Statutory authorities — FIU-IND, Income-Tax Department, GSTN, courts, tribunals and law-enforcement agencies when legally compelled.",
              "Audit, KYC and risk-assessment vendors empanelled by statutory regulators, under written confidentiality and DPDP-aligned data processing agreements.",
              "Cloud infrastructure providers operating data centres located within the territory of India."
            ]
          }
        ]
      },
      {
        id: "storage",
        heading: "5. Data localisation, retention & deletion",
        body: [
          "All payment system data is stored only in India in compliance with the regulatory circular dated 06 April 2018 on Storage of Payment System Data. End-of-day backups are encrypted at rest using AES-256.",
          "We retain personal data for the period mandated by applicable law — typically ten (10) years from the date of completion of the transaction (per Section 12, PMLA, 2002) — after which it is securely deleted or anonymised."
        ]
      },
      {
        id: "rights",
        heading: "6. Your rights as a Data Principal",
        body: [
          "Under the DPDP Act, 2023 you have the right to:",
          {
            list: [
              "Access a summary of the personal data we process about you.",
              "Correct, complete or update inaccurate or misleading data.",
              "Erase personal data that is no longer required for the original purpose.",
              "Withdraw your consent at any time (without affecting the lawfulness of prior processing).",
              "Nominate another individual to exercise your rights in the event of your death or incapacity.",
              "Lodge a complaint with the Data Protection Board of India."
            ]
          },
          "To exercise any of the above rights, please write to our Grievance Officer at grievance@bankingpoint-24.com. We will respond within fifteen (15) working days."
        ]
      },
      {
        id: "security",
        heading: "7. Security safeguards",
        body: [
          "We implement reasonable security practices as defined in Rule 8 of the SPDI Rules, 2011 and the applicable Master Direction on Digital Payment Security Controls, 2021, including: ISO/IEC 27001:2022 certified ISMS, PCI-DSS v4.0 Level-1 controls, mTLS-only APIs, HSM-backed key management, role-based access, 24×7 SOC monitoring and annual VAPT by a CERT-In empanelled auditor."
        ]
      },
      {
        id: "breach",
        heading: "8. Data-breach notification",
        body: [
          "Any personal-data breach will be reported to the Data Protection Board of India and to affected Data Principals within seventy-two (72) hours of detection, as required by the DPDP Act, 2023, together with the nature, scope and mitigation measures taken. Cyber-security incidents are reported to CERT-In within six (6) hours as per the directions dated 28 April 2022."
        ]
      },
      {
        id: "children",
        heading: "9. Children's data",
        body: [
          "The Platform is not intended for use by individuals below 18 years of age. We will not knowingly process personal data of a child without the verifiable consent of a parent or lawful guardian."
        ]
      },
      {
        id: "changes",
        heading: "10. Changes to this Policy",
        body: [
          "We may amend this Policy from time to time. Material changes will be notified through the Platform and / or by email at least seven (7) days before they take effect."
        ]
      },
      {
        id: "contact",
        heading: "11. Grievance Officer",
        body: [
          "In accordance with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 and the IT (Intermediary Guidelines & Digital Media Ethics Code) Rules, 2021, the contact details of our Grievance Officer are published on this website and on the Grievance Redressal page below."
        ]
      }
    ]
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    eyebrow: "Legal · Terms of Use",
    description:
      "The contract between you and BankingPoint24 for use of the BankingPoint24 Platform, drawn up under the Indian Contract Act, 1872 and the Information Technology Act, 2000.",
    lastUpdated: "01 April 2026",
    governedBy: [
      "Indian Contract Act, 1872",
      "Information Technology Act, 2000",
      "Consumer Protection Act, 2019",
      "Payment & Settlement Systems Act, 2007"
    ],
    sections: [
      {
        id: "acceptance",
        heading: "1. Acceptance of Terms",
        body: [
          "These Terms & Conditions (\"Terms\") form a binding electronic record under Section 10A of the Information Technology Act, 2000 between you (\"User\", \"Retailer\", \"Distributor\", \"Customer\") and RUTVA MULTISERVICES LLP (\"BankingPoint24\", \"Company\"). By registering, accessing or using the Platform you accept these Terms in full."
        ]
      },
      {
        id: "eligibility",
        heading: "2. Eligibility",
        body: [
          "You are eligible to use the Platform only if you are: (a) at least 18 years of age; (b) competent to contract under Section 11 of the Indian Contract Act, 1872; and (c) not barred from receiving services under any Indian law, including applicable sanctions lists."
        ]
      },
      {
        id: "services",
        heading: "3. Description of services",
        body: [
          "BankingPoint24 is a technology aggregator that facilitates digital financial services including, but not limited to, AePS, DMT, BBPS, UPI, recharges, travel bookings and PAN application. The underlying banking / settlement services are provided by licensed sponsor banks and NPCI rails. BankingPoint24 does not itself accept deposits or extend credit."
        ]
      },
      {
        id: "account",
        heading: "4. Account, KYC & responsibilities",
        body: [
          {
            list: [
              "You shall complete KYC as required under the applicable Master Direction on KYC, 2016 prior to availing transactional services.",
              "You are responsible for maintaining confidentiality of your login credentials, MPIN, biometric authentication and OTPs. BankingPoint24 will never ask for these over phone, SMS or e-mail.",
              "Any transaction performed using your credentials shall be deemed to be performed by you.",
              "You shall not share, sublicense or commercially exploit your access in violation of these Terms."
            ]
          }
        ]
      },
      {
        id: "prohibited",
        heading: "5. Prohibited activities",
        body: [
          "You shall not use the Platform for any purpose that is unlawful under Indian law, including:",
          {
            list: [
              "Money-laundering, terror-financing or any activity prohibited under PMLA, 2002 and UAPA, 1967.",
              "Hosting, transmitting or facilitating content prohibited under Rule 3(1)(b) of the IT Intermediary Rules, 2021.",
              "Impersonation, identity theft or unauthorised use of Aadhaar / PAN / KYC data.",
              "Reverse-engineering, scraping, or circumventing the security controls of the Platform.",
              "Use for gambling, crypto-currency trading, adult content, or any activity restricted by Indian financial regulators."
            ]
          }
        ]
      },
      {
        id: "fees",
        heading: "6. Fees, commissions & taxes",
        body: [
          "Service charges, commission slabs and convenience fees are published on the Charges page and within your dashboard, and may be revised on seven (7) days' prior notice. All amounts are exclusive of applicable taxes (GST), which will be charged at the rates prevailing on the date of invoice."
        ]
      },
      {
        id: "intellectual",
        heading: "7. Intellectual property",
        body: [
          "All trademarks, logos, software, designs, content and brand elements on the Platform are the exclusive property of BankingPoint24 or its licensors, and are protected under the Copyright Act, 1957 and the Trade Marks Act, 1999. No part of the Platform may be reproduced without prior written consent."
        ]
      },
      {
        id: "liability",
        heading: "8. Limitation of liability",
        body: [
          "To the maximum extent permitted by law, the aggregate liability of BankingPoint24 arising out of or relating to the use of the Platform shall not exceed the aggregate commission earned by, or fees paid by, the User in the three (3) months preceding the event giving rise to the claim. BankingPoint24 shall not be liable for indirect, incidental, consequential, punitive or special damages."
        ]
      },
      {
        id: "force",
        heading: "9. Force majeure",
        body: [
          "BankingPoint24 shall not be liable for any failure or delay arising out of events beyond its reasonable control, including acts of God, war, pandemics, regulatory action, internet outages, sponsor-bank downtime or NPCI / UIDAI service disruptions."
        ]
      },
      {
        id: "termination",
        heading: "10. Suspension & termination",
        body: [
          "BankingPoint24 reserves the right to suspend or terminate your account, with or without notice, where it has reasonable grounds to believe that you are in breach of these Terms, applicable law, or any regulatory or network direction."
        ]
      },
      {
        id: "law",
        heading: "11. Governing law & dispute resolution",
        body: [
          "These Terms shall be governed by and construed in accordance with the laws of India. Any dispute, controversy or claim arising out of or in connection with these Terms shall first be attempted to be resolved through good-faith negotiation, failing which through arbitration by a sole arbitrator appointed under the Arbitration & Conciliation Act, 1996. The seat and venue of arbitration shall be Anand, Gujarat. The courts at Anand, Gujarat shall have exclusive jurisdiction subject to the arbitration clause."
        ]
      },
      {
        id: "amend",
        heading: "12. Amendments",
        body: [
          "We reserve the right to amend these Terms. Continued use of the Platform after an amendment shall constitute acceptance of the revised Terms."
        ]
      }
    ]
  },
  refunds: {
    slug: "refunds",
    title: "Refund & Cancellation Policy",
    eyebrow: "Legal · Refunds",
    description:
      "Timelines and process for chargebacks, failed transactions and cancellations, drafted in accordance with the Harmonisation of TAT circular dated 20 September 2019 and the Consumer Protection Act, 2019.",
    lastUpdated: "01 April 2026",
    governedBy: [
      "Circular on Harmonisation of TAT, 20 Sept 2019",
      "Consumer Protection Act, 2019",
      "Payment & Settlement Systems Act, 2007"
    ],
    sections: [
      {
        id: "scope",
        heading: "1. Scope",
        body: [
          "This Refund Policy applies to all transactions initiated through the BankingPoint24 Platform — AePS, DMT, BBPS, UPI, recharges, travel bookings and any value-added services. Refunds for products / services delivered by third-party billers (electricity boards, telecom operators, airlines, IRCTC, hotel chains) are governed by the policies of the respective billers, but BankingPoint24 will assist you with end-to-end follow-up."
        ]
      },
      {
        id: "failed",
        heading: "2. Failed-transaction auto-reversal — mandated TAT",
        body: [
          "In line with the regulator's circular on Harmonisation of Turn-Around-Time and Customer Compensation for Failed Transactions, the timelines below apply for auto-reversal. Where the auto-reversal fails to happen within the prescribed TAT, you are entitled to compensation of ₹100 per day of delay credited automatically to the same account.",
          {
            table: {
              headers: ["Channel", "Failure scenario", "Auto-reversal TAT"],
              rows: [
                ["UPI", "Customer debited but beneficiary not credited", "T+1 day"],
                ["IMPS / NEFT", "Account debited but beneficiary not credited", "T+1 day"],
                ["AePS / Aadhaar Pay", "Customer debited but cash not paid at agent", "T+5 days"],
                ["Card transactions", "Customer debited but merchant not credited", "T+5 days"],
                ["BBPS bill payment", "Amount debited but biller not updated", "T+1 day"],
                ["Wallet / PPI", "Wallet debited but transaction failed", "T+1 day"]
              ]
            }
          }
        ]
      },
      {
        id: "how",
        heading: "3. How to raise a refund / dispute",
        body: [
          {
            list: [
              "Log in to your BankingPoint24 dashboard → Transactions → Raise Dispute.",
              "Or e-mail support@bankingpoint-24.com with the transaction reference number (RRN), date, amount and a short description.",
              "For UPI disputes you may also raise a request directly with the issuer bank, the NPCI UDIR portal or the Digital Ombudsman."
            ]
          }
        ]
      },
      {
        id: "non-refund",
        heading: "4. Non-refundable items",
        body: [
          {
            list: [
              "Successfully delivered services where the obligation has already been performed (e.g. recharge accepted by operator).",
              "Convenience fees / platform fees once a transaction is completed successfully.",
              "Annual membership / subscription fees of distributor or retailer plans, except where cancellation is exercised within 7 days of activation and no service has been used."
            ]
          }
        ]
      },
      {
        id: "mode",
        heading: "5. Refund mode & timeline",
        body: [
          "Refunds are credited back to the original source of payment. Typical credit timelines: UPI / wallet — within 24 hours; IMPS / NEFT — within 2 working days; credit / debit card — 5 to 7 working days, subject to issuer bank."
        ]
      },
      {
        id: "escalation",
        heading: "6. Escalation matrix",
        body: [
          "If you are not satisfied with the resolution provided at L1 support within 7 days, escalate to:",
          {
            list: [
              "L2 — Grievance Officer, grievance@bankingpoint-24.com (response within 15 working days)",
              "L3 — Principal Nodal Officer, nodal@bankingpoint-24.com",
              "L4 — Integrated Ombudsman Scheme, 2021 or the NPCI Digital Ombudsman"
            ]
          }
        ]
      }
    ]
  },
  charges: {
    slug: "charges",
    title: "Charges & Fees",
    eyebrow: "Legal · Pricing transparency",
    description:
      "All convenience fees, commissions and GST that may apply to transactions on the BankingPoint24 Platform — published in line with regulatory directions on display of charges.",
    lastUpdated: "01 April 2026",
    governedBy: [
      "applicable Master Direction on Issuance & Operation of PPIs, 2021",
      "Consumer Protection (E-Commerce) Rules, 2020",
      "Central Goods & Services Tax Act, 2017"
    ],
    sections: [
      {
        id: "transparency",
        heading: "1. Transparency commitment",
        body: [
          "We publish every applicable charge upfront. No hidden fees, no surprise mark-ups. All amounts are inclusive / exclusive of GST as expressly mentioned in the table below."
        ]
      },
      {
        id: "schedule",
        heading: "2. Schedule of charges",
        body: [
          {
            table: {
              headers: ["Service", "Customer charge", "Retailer commission", "GST"],
              rows: [
                ["AePS — cash withdrawal", "₹0 (free for customer)", "Up to ₹6 per txn", "18% on commission"],
                ["AePS — balance enquiry / mini-statement", "₹0", "₹0.50 per txn", "18%"],
                ["Domestic Money Transfer (DMT)", "1% of amount, min ₹10", "0.40% to retailer", "18%"],
                ["UPI Collect (P2M)", "₹0 up to ₹2,000 · 0.30% above", "0.10% to retailer", "18%"],
                ["BBPS bill payment", "Convenience fee ₹0 – ₹20 by biller", "₹2 – ₹15 per bill", "18%"],
                ["Mobile / DTH recharge", "₹0", "0.5% – 3% by operator", "18%"],
                ["PAN application (NSDL)", "₹107", "₹15 per application", "18%"],
                ["Travel — flight / bus / hotel", "Convenience fee as per OTA", "0.50% – 4% by route", "18%"],
                ["FASTag recharge", "₹0", "1.5% on tag activation", "18%"]
              ]
            }
          },
          "Charges are indicative and may be revised on seven (7) days' prior notice in your dashboard and via e-mail."
        ]
      },
      {
        id: "subscriptions",
        heading: "3. Membership plans",
        body: [
          "Optional annual plans for retailers and distributors are listed on the Pricing section of the home page. Membership fees are non-refundable once activated, except as set out in the Refund Policy."
        ]
      },
      {
        id: "tax",
        heading: "4. Goods & Services Tax (GST)",
        body: [
          "All commissions and platform charges attract GST at 18% in accordance with the CGST Act, 2017. Tax invoices are auto-generated and available for download from your dashboard."
        ]
      }
    ]
  },
  grievance: {
    slug: "grievance",
    title: "Grievance Redressal Policy",
    eyebrow: "Legal · Customer Service",
    description:
      "Our customer-grievance redressal framework drafted as per the applicable Master Direction on Customer Service, the IT Rules 2021 and the Consumer Protection Act, 2019.",
    lastUpdated: "01 April 2026",
    governedBy: [
      "applicable Master Direction on Customer Service in Banks",
      "IT (Intermediary Guidelines) Rules, 2021",
      "Consumer Protection Act, 2019",
      "Integrated Ombudsman Scheme, 2021"
    ],
    sections: [
      {
        id: "principles",
        heading: "1. Principles",
        body: [
          "Every complaint shall be treated with fairness, transparency and empathy. We commit to acknowledging every complaint within 24 hours and providing a final response within 15 working days."
        ]
      },
      {
        id: "channels",
        heading: "2. How to reach us",
        body: [
          {
            list: [
              "In-app — Help → Raise a Ticket",
              "E-mail — support@bankingpoint-24.com",
              "WhatsApp / Phone — +91 7069300077 (10 AM – 6 PM IST, Mon–Sat)",
              "Letter — Customer Care, BankingPoint24, 27 The Sun Residency, Nr. MatruBhakti Nani Bhagol, Mogri, Vidyanagar Police Station, Anand, Gujarat – 388345, IN"
            ]
          }
        ]
      },
      {
        id: "matrix",
        heading: "3. Escalation matrix",
        body: [
          {
            table: {
              headers: ["Level", "Officer", "Channel", "TAT"],
              rows: [
                ["Level 1", "Customer Care Executive", "support@bankingpoint-24.com", "7 working days"],
                ["Level 2", "Grievance Officer", "grievance@bankingpoint-24.com · +91 7069300077", "15 working days"],
                ["Level 3", "Principal Nodal Officer", "nodal@bankingpoint-24.com · +91 7069300077", "30 days"],
                ["Level 4", "Integrated Ombudsman", "14448 (toll-free)", "As per scheme"]
              ]
            }
          }
        ]
      },
      {
        id: "consumer",
        heading: "4. Consumer Protection Act, 2019",
        body: [
          "Nothing in this policy shall limit any right available to a consumer under the Consumer Protection Act, 2019, including the right to approach the appropriate District / State / National Commission."
        ]
      }
    ]
  }
};

export type Transaction = {
  id: string;
  service: string;
  amount: number;
  status: "Success" | "Pending" | "Failed";
  date: string;
  customer: string;
  commission: number;
  /** Resolved bank/issuer name for logo display; null when it maps to no bank. */
  logo?: string | null;
};

export type NetworkUser = {
  id: string;
  name: string;
  shop: string;
  role: "retailer" | "distributor" | "master-distributor";
  parentId?: string;
  city: string;
  state: string;
  joined: string;
  status: "Active" | "Pending KYC" | "Suspended";
  walletBalance: number;
  monthlyTurnover: number;
  retailers?: number;
};

/** Live network data comes from /api/network — kept empty so dashboards never show seed fiction. */
export const networkUsers: NetworkUser[] = [];

export type FundRequest = {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  amount: number;
  mode: "IMPS" | "NEFT" | "UPI" | "RTGS" | "Cash Deposit";
  reference: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  remarks?: string;
};

/** Live fund requests come from /api/fund-request. */
export const fundRequests: FundRequest[] = [];

export type KycRequest = {
  id: string;
  name: string;
  shop: string;
  city: string;
  role: "retailer" | "distributor" | "master-distributor";
  pan: string;
  aadhaar: string;
  submittedOn: string;
  status: "Awaiting Review" | "Verified" | "Rejected";
};

export const kycRequests: KycRequest[] = [
  {
    id: "KYC-001",
    name: "Anita Bose",
    shop: "Bose Tradelink",
    city: "Kolkata",
    role: "distributor",
    pan: "BNPLM4571F",
    aadhaar: "XXXX-XXXX-7891",
    submittedOn: "Apr 18, 2026",
    status: "Awaiting Review"
  },
  {
    id: "KYC-002",
    name: "Kavita Devi",
    shop: "Devi Sewa Kendra",
    city: "Nashik",
    role: "retailer",
    pan: "DKVPS1212K",
    aadhaar: "XXXX-XXXX-1245",
    submittedOn: "Apr 18, 2026",
    status: "Awaiting Review"
  },
  {
    id: "KYC-003",
    name: "Iqbal Khan",
    shop: "Khan Mobile Centre",
    city: "Hyderabad",
    role: "retailer",
    pan: "IKKAJ5621Z",
    aadhaar: "XXXX-XXXX-8910",
    submittedOn: "Apr 17, 2026",
    status: "Awaiting Review"
  },
  {
    id: "KYC-004",
    name: "Vivek Joshi",
    shop: "Joshi Travels",
    city: "Indore",
    role: "retailer",
    pan: "VKJOS9912R",
    aadhaar: "XXXX-XXXX-3344",
    submittedOn: "Apr 16, 2026",
    status: "Verified"
  },
  {
    id: "KYC-005",
    name: "Rashida Begum",
    shop: "RB Sewa Kendra",
    city: "Patna",
    role: "retailer",
    pan: "RBPSK0921L",
    aadhaar: "XXXX-XXXX-5566",
    submittedOn: "Apr 15, 2026",
    status: "Rejected"
  }
];

export type CommissionSlab = {
  service: string;
  retailer: string;
  distributor: string;
  master: string;
  superDistributor: string;
  whiteLabel: string;
};

export const commissionSlabs: CommissionSlab[] = [
  { service: "AePS Cash Withdrawal", retailer: "0.45%", distributor: "0.12%", master: "0.06%", superDistributor: "0.03%", whiteLabel: "Custom" },
  { service: "Money Transfer (IMPS)", retailer: "₹7 / txn", distributor: "₹2.50 / txn", master: "₹1.25 / txn", superDistributor: "₹0.60 / txn", whiteLabel: "Custom" },
  { service: "Mobile Recharge", retailer: "2.80%", distributor: "0.45%", master: "0.22%", superDistributor: "0.11%", whiteLabel: "Custom" },
  { service: "DTH Recharge", retailer: "3.25%", distributor: "0.55%", master: "0.25%", superDistributor: "0.12%", whiteLabel: "Custom" },
  { service: "Electricity Bill", retailer: "0.75%", distributor: "0.22%", master: "0.11%", superDistributor: "0.06%", whiteLabel: "Custom" },
  { service: "LPG Refill Booking", retailer: "₹5 / txn", distributor: "₹1.50 / txn", master: "₹0.75 / txn", superDistributor: "₹0.40 / txn", whiteLabel: "Custom" },
  { service: "UPI Collect", retailer: "0.25%", distributor: "0.06%", master: "0.03%", superDistributor: "0.015%", whiteLabel: "Custom" },
  { service: "Bus Ticketing", retailer: "4.50%", distributor: "0.90%", master: "0.45%", superDistributor: "0.22%", whiteLabel: "Custom" }
];

export type Biller = {
  category: string;
  count: number;
  routing: string;
  uptime: string;
  status: "Live" | "Degraded" | "Down";
};

export const billers: Biller[] = [
  { category: "Electricity", count: 84, routing: "BBPS · NPCI", uptime: "99.92%", status: "Live" },
  { category: "Water", count: 36, routing: "BBPS · NPCI", uptime: "99.81%", status: "Live" },
  { category: "Gas (Piped + LPG)", count: 24, routing: "BBPS + Direct", uptime: "99.97%", status: "Live" },
  { category: "Telecom", count: 12, routing: "Direct API", uptime: "99.99%", status: "Live" },
  { category: "DTH", count: 6, routing: "Direct API", uptime: "98.42%", status: "Degraded" },
  { category: "Credit Card", count: 41, routing: "BBPS", uptime: "99.95%", status: "Live" },
  { category: "Education", count: 312, routing: "Eduvanz / Direct", uptime: "99.74%", status: "Live" },
  { category: "Insurance", count: 28, routing: "BBPS", uptime: "99.90%", status: "Live" },
  { category: "FASTag", count: 23, routing: "NPCI · NETC", uptime: "99.99%", status: "Live" },
  { category: "Municipal Tax", count: 162, routing: "BBPS", uptime: "98.10%", status: "Degraded" }
];

export type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  ts: string;
  severity: "info" | "warn" | "danger";
};

export const auditEvents: AuditEvent[] = [
  { id: "AU-94221", actor: "admin@bankingpoint-24.com", action: "Approved KYC", target: "Vivek Joshi (KYC-004)", ip: "10.18.4.21", ts: "Apr 19, 10:22 AM", severity: "info" },
  { id: "AU-94220", actor: "neha.k@bankingpoint-24.com", action: "Override commission", target: "DMT IMPS · JNPD2017", ip: "49.207.211.4", ts: "Apr 19, 09:51 AM", severity: "warn" },
  { id: "AU-94219", actor: "admin@bankingpoint-24.com", action: "Suspended retailer", target: "JNPR3217 (Patil Enterprises)", ip: "10.18.4.21", ts: "Apr 19, 09:14 AM", severity: "danger" },
  { id: "AU-94218", actor: "system", action: "Biller routing failover", target: "DTH · Tata Play → fallback", ip: "n/a", ts: "Apr 19, 08:42 AM", severity: "warn" },
  { id: "AU-94217", actor: "rohit.v@bankingpoint-24.com", action: "Approved fund request", target: "FR-9003 · ₹15,000", ip: "182.65.21.99", ts: "Apr 18, 06:30 PM", severity: "info" },
  { id: "AU-94216", actor: "system", action: "Settlement run", target: "T+1 · ₹8.42 Cr · 12,481 txns", ip: "n/a", ts: "Apr 18, 11:05 PM", severity: "info" }
];

export type Settlement = {
  id: string;
  cycle: string;
  counterparty: string;
  amount: number;
  status: "Settled" | "In Bank" | "Reconciling";
  date: string;
};

export const settlements: Settlement[] = [
  { id: "STL-2026-04-18", cycle: "T+1", counterparty: "ICICI Nodal", amount: 84272340, status: "Settled", date: "Apr 18, 2026" },
  { id: "STL-2026-04-17", cycle: "T+1", counterparty: "ICICI Nodal", amount: 79914000, status: "Settled", date: "Apr 17, 2026" },
  { id: "STL-2026-04-16", cycle: "T+1", counterparty: "ICICI Nodal", amount: 68142890, status: "Settled", date: "Apr 16, 2026" },
  { id: "STL-2026-04-15", cycle: "T+1", counterparty: "Yes Bank Nodal", amount: 14820000, status: "In Bank", date: "Apr 15, 2026" },
  { id: "STL-2026-04-14", cycle: "T+1", counterparty: "Yes Bank Nodal", amount: 12482111, status: "Reconciling", date: "Apr 14, 2026" }
];

export type SystemMetric = {
  service: string;
  uptime: string;
  p95ms: number;
  txnsToday: number;
  errorRate: string;
};

export const systemMetrics: SystemMetric[] = [
  { service: "AePS Switch", uptime: "99.98%", p95ms: 412, txnsToday: 184221, errorRate: "0.04%" },
  { service: "DMT - IMPS", uptime: "99.99%", p95ms: 286, txnsToday: 98412, errorRate: "0.02%" },
  { service: "UPI Collect", uptime: "99.99%", p95ms: 212, txnsToday: 482011, errorRate: "0.01%" },
  { service: "BBPS Gateway", uptime: "99.92%", p95ms: 642, txnsToday: 121088, errorRate: "0.18%" },
  { service: "Recharge Aggregator", uptime: "99.86%", p95ms: 521, txnsToday: 312441, errorRate: "0.12%" },
  { service: "Travel Aggregator", uptime: "99.74%", p95ms: 1421, txnsToday: 8421, errorRate: "0.34%" }
];

export type Integration = {
  name: string;
  category: string;
  href?: string;
  initials: string;
  color: string;
};

export const integrations: Integration[] = [
  { name: "NPCI", category: "Switch", initials: "NPCI", color: "from-brand-500 to-brand-700" },
  { name: "NPCI Bharat BillPay", category: "BBPS", initials: "BBPS", color: "from-brand-600 to-violet-600" },
  { name: "Regulatory Sandbox", category: "Regulatory", initials: "RS", color: "from-ink-700 to-ink-900" },
  { name: "ICICI Nodal", category: "Nodal Bank", initials: "ICICI", color: "from-orange-500 to-rose-500" },
  { name: "Yes Bank Nodal", category: "Nodal Bank", initials: "YES", color: "from-blue-500 to-indigo-600" },
  { name: "Axis Bank", category: "DMT Partner", initials: "AXIS", color: "from-rose-500 to-pink-600" },
  { name: "Visa", category: "Card Network", initials: "VISA", color: "from-blue-700 to-blue-900" },
  { name: "Mastercard", category: "Card Network", initials: "MC", color: "from-amber-500 to-rose-500" },
  { name: "RuPay", category: "Card Network", initials: "RUPAY", color: "from-emerald-500 to-brand-500" },
  { name: "Aadhaar / UIDAI", category: "Identity", initials: "UIDAI", color: "from-amber-500 to-orange-600" },
  { name: "Mantra MFS100", category: "Biometric", initials: "MFS", color: "from-violet-500 to-fuchsia-600" },
  { name: "Morpho MSO 1300", category: "Biometric", initials: "MORPH", color: "from-cyan-500 to-blue-600" }
];

/* ── Payment Gateway (PG) ───────────────────────────────────────────── */

export type PgMerchant = {
  id: string;
  name: string;
  business: string;
  city: string;
  mid: string;
  modes: string[];
  mdr: string;
  status: "Live" | "Pending KYC" | "Suspended";
  volume30d: number;
  onboarded: string;
};

export const pgMerchants: PgMerchant[] = [
  {
    id: "MER-1001",
    name: "Hiren Desai",
    business: "Desai Textiles",
    city: "Surat",
    mid: "NGPM84211",
    modes: ["UPI", "Cards", "Net Banking"],
    mdr: "UPI 0% · Cards 1.20%",
    status: "Live",
    volume30d: 4825000,
    onboarded: "May 02, 2026"
  },
  {
    id: "MER-1002",
    name: "Farhan Shaikh",
    business: "FS Electronics",
    city: "Ahmedabad",
    mid: "NGPM84230",
    modes: ["UPI", "Cards", "Wallets"],
    mdr: "UPI 0% · Cards 1.10%",
    status: "Live",
    volume30d: 2214000,
    onboarded: "May 11, 2026"
  },
  {
    id: "MER-1003",
    name: "Bhavna Patel",
    business: "Patel Jewellers",
    city: "Surat",
    mid: "NGPM84274",
    modes: ["UPI", "Cards", "Net Banking", "EMI"],
    mdr: "UPI 0% · Cards 0.95%",
    status: "Live",
    volume30d: 9120000,
    onboarded: "May 19, 2026"
  },
  {
    id: "MER-1004",
    name: "Ravi Iyer",
    business: "Iyer Pharma Mart",
    city: "Vadodara",
    mid: "NGPM84301",
    modes: ["UPI", "Cards"],
    mdr: "UPI 0% · Cards 1.40%",
    status: "Pending KYC",
    volume30d: 0,
    onboarded: "Jun 06, 2026"
  },
  {
    id: "MER-1005",
    name: "Deepak Rana",
    business: "Rana Mobile Hub",
    city: "Rajkot",
    mid: "NGPM84318",
    modes: ["UPI"],
    mdr: "UPI 0%",
    status: "Suspended",
    volume30d: 84000,
    onboarded: "Apr 21, 2026"
  }
];

export type PgTransaction = {
  id: string;
  orderId: string;
  merchant: string;
  mode: "UPI" | "Card" | "Net Banking" | "Wallet";
  amount: number;
  fee: number;
  status: "Success" | "Pending" | "Failed" | "Refunded";
  settlement: "Settled" | "T+1 Queue" | "—";
  date: string;
};

export const pgTransactions: PgTransaction[] = [
  { id: "PGT-88412", orderId: "ORD-20312", merchant: "Desai Textiles", mode: "UPI", amount: 12400, fee: 0, status: "Success", settlement: "T+1 Queue", date: "Jun 12, 2026 · 11:42 AM" },
  { id: "PGT-88409", orderId: "ORD-20309", merchant: "Patel Jewellers", mode: "Card", amount: 86500, fee: 822, status: "Success", settlement: "T+1 Queue", date: "Jun 12, 2026 · 11:18 AM" },
  { id: "PGT-88401", orderId: "ORD-20301", merchant: "FS Electronics", mode: "Net Banking", amount: 23999, fee: 288, status: "Success", settlement: "T+1 Queue", date: "Jun 12, 2026 · 10:52 AM" },
  { id: "PGT-88394", orderId: "ORD-20294", merchant: "Desai Textiles", mode: "UPI", amount: 5600, fee: 0, status: "Pending", settlement: "—", date: "Jun 12, 2026 · 10:31 AM" },
  { id: "PGT-88381", orderId: "ORD-20281", merchant: "Patel Jewellers", mode: "Card", amount: 145000, fee: 1378, status: "Success", settlement: "Settled", date: "Jun 11, 2026 · 06:24 PM" },
  { id: "PGT-88375", orderId: "ORD-20275", merchant: "FS Electronics", mode: "Wallet", amount: 1899, fee: 23, status: "Refunded", settlement: "—", date: "Jun 11, 2026 · 04:12 PM" },
  { id: "PGT-88362", orderId: "ORD-20262", merchant: "Rana Mobile Hub", mode: "UPI", amount: 8500, fee: 0, status: "Failed", settlement: "—", date: "Jun 11, 2026 · 01:08 PM" }
];

/* ── Point of Sale (POS) ────────────────────────────────────────────── */

export type PosMachine = {
  serial: string;
  model: string;
  assignedTo: string;
  city: string;
  status: "Active" | "In Stock" | "Faulty" | "Returned";
  plan: string;
  monthlyRent: number;
  txns30d: number;
  volume30d: number;
};

export const posMachines: PosMachine[] = [
  { serial: "NGP-POS-30121", model: "PAX A920 Pro", assignedTo: "Desai Textiles", city: "Surat", status: "Active", plan: "Rental · Standard", monthlyRent: 499, txns30d: 1284, volume30d: 2418000 },
  { serial: "NGP-POS-30122", model: "PAX A920 Pro", assignedTo: "Patel Jewellers", city: "Surat", status: "Active", plan: "Rental · Premium", monthlyRent: 799, txns30d: 842, volume30d: 6120000 },
  { serial: "NGP-POS-30126", model: "Verifone X990", assignedTo: "FS Electronics", city: "Ahmedabad", status: "Active", plan: "Rental · Standard", monthlyRent: 499, txns30d: 611, volume30d: 1422000 },
  { serial: "NGP-POS-30131", model: "PAX A77", assignedTo: "—", city: "Warehouse · Surat", status: "In Stock", plan: "—", monthlyRent: 0, txns30d: 0, volume30d: 0 },
  { serial: "NGP-POS-30132", model: "PAX A77", assignedTo: "—", city: "Warehouse · Surat", status: "In Stock", plan: "—", monthlyRent: 0, txns30d: 0, volume30d: 0 },
  { serial: "NGP-POS-30118", model: "Verifone X990", assignedTo: "Rana Mobile Hub", city: "Rajkot", status: "Faulty", plan: "Rental · Standard", monthlyRent: 499, txns30d: 12, volume30d: 31000 },
  { serial: "NGP-POS-30102", model: "PAX A920", assignedTo: "—", city: "Returned · Surat", status: "Returned", plan: "—", monthlyRent: 0, txns30d: 0, volume30d: 0 }
];

export type PosTransaction = {
  id: string;
  terminal: string;
  merchant: string;
  mode: "Card" | "UPI" | "BharatQR" | "Tap & Pay";
  amount: number;
  status: "Approved" | "Declined" | "Voided" | "Refunded";
  settlement: "Settled" | "T+1 Queue" | "—";
  date: string;
};

export const posTransactions: PosTransaction[] = [
  { id: "POS-77231", terminal: "NGP-POS-30122", merchant: "Patel Jewellers", mode: "Card", amount: 58000, status: "Approved", settlement: "T+1 Queue", date: "Jun 12, 2026 · 12:04 PM" },
  { id: "POS-77226", terminal: "NGP-POS-30121", merchant: "Desai Textiles", mode: "UPI", amount: 3450, status: "Approved", settlement: "T+1 Queue", date: "Jun 12, 2026 · 11:48 AM" },
  { id: "POS-77219", terminal: "NGP-POS-30126", merchant: "FS Electronics", mode: "Tap & Pay", amount: 12999, status: "Approved", settlement: "T+1 Queue", date: "Jun 12, 2026 · 11:21 AM" },
  { id: "POS-77204", terminal: "NGP-POS-30121", merchant: "Desai Textiles", mode: "BharatQR", amount: 1860, status: "Approved", settlement: "Settled", date: "Jun 11, 2026 · 07:42 PM" },
  { id: "POS-77198", terminal: "NGP-POS-30122", merchant: "Patel Jewellers", mode: "Card", amount: 24500, status: "Voided", settlement: "—", date: "Jun 11, 2026 · 05:16 PM" },
  { id: "POS-77185", terminal: "NGP-POS-30118", merchant: "Rana Mobile Hub", mode: "Card", amount: 7200, status: "Declined", settlement: "—", date: "Jun 11, 2026 · 02:39 PM" }
];

export type PosRental = {
  invoice: string;
  terminal: string;
  merchant: string;
  plan: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Due" | "Overdue";
};

export const posRentals: PosRental[] = [
  { invoice: "RNT-2026-06-011", terminal: "NGP-POS-30121", merchant: "Desai Textiles", plan: "Standard", amount: 499, dueDate: "Jun 05, 2026", status: "Paid" },
  { invoice: "RNT-2026-06-012", terminal: "NGP-POS-30122", merchant: "Patel Jewellers", plan: "Premium", amount: 799, dueDate: "Jun 05, 2026", status: "Paid" },
  { invoice: "RNT-2026-06-013", terminal: "NGP-POS-30126", merchant: "FS Electronics", plan: "Standard", amount: 499, dueDate: "Jun 05, 2026", status: "Due" },
  { invoice: "RNT-2026-06-014", terminal: "NGP-POS-30118", merchant: "Rana Mobile Hub", plan: "Standard", amount: 499, dueDate: "May 05, 2026", status: "Overdue" }
];

/* ── QR Code Payments ───────────────────────────────────────────────── */

export type QrCodeItem = {
  id: string;
  type: "Static" | "Dynamic";
  label: string;
  vpa: string;
  amount?: number;
  created: string;
  payments: number;
  collected: number;
  status: "Active" | "Expired" | "Disabled";
};

export const qrCodes: QrCodeItem[] = [
  { id: "QR-5001", type: "Static", label: "Shop Counter 1", vpa: "BankingPoint24.desai@icici", created: "May 02, 2026", payments: 1841, collected: 1284500, status: "Active" },
  { id: "QR-5002", type: "Static", label: "Shop Counter 2", vpa: "BankingPoint24.desai2@icici", created: "May 02, 2026", payments: 644, collected: 412800, status: "Active" },
  { id: "QR-5014", type: "Dynamic", label: "Invoice #4421", vpa: "BankingPoint24.desai@icici", amount: 12400, created: "Jun 12, 2026", payments: 1, collected: 12400, status: "Expired" },
  { id: "QR-5015", type: "Dynamic", label: "Invoice #4427", vpa: "BankingPoint24.desai@icici", amount: 8600, created: "Jun 12, 2026", payments: 0, collected: 0, status: "Active" },
  { id: "QR-5009", type: "Static", label: "Delivery Van", vpa: "BankingPoint24.desai3@icici", created: "May 22, 2026", payments: 102, collected: 89200, status: "Disabled" }
];

export type QrPayment = {
  id: string;
  qrId: string;
  payer: string;
  amount: number;
  status: "Received" | "Pending" | "Failed";
  settled: boolean;
  date: string;
};

export const qrPayments: QrPayment[] = [
  { id: "QRP-99121", qrId: "QR-5001", payer: "ramesh.k@oksbi", amount: 1250, status: "Received", settled: false, date: "Jun 12, 2026 · 12:10 PM" },
  { id: "QRP-99118", qrId: "QR-5014", payer: "sunita@ybl", amount: 12400, status: "Received", settled: false, date: "Jun 12, 2026 · 11:44 AM" },
  { id: "QRP-99110", qrId: "QR-5001", payer: "arif.m@paytm", amount: 480, status: "Received", settled: false, date: "Jun 12, 2026 · 10:58 AM" },
  { id: "QRP-99094", qrId: "QR-5002", payer: "jay.p@okaxis", amount: 2200, status: "Received", settled: true, date: "Jun 11, 2026 · 08:21 PM" },
  { id: "QRP-99082", qrId: "QR-5001", payer: "meena@upi", amount: 940, status: "Failed", settled: false, date: "Jun 11, 2026 · 06:02 PM" },
  { id: "QRP-99075", qrId: "QR-5002", payer: "vikas.t@ibl", amount: 1675, status: "Received", settled: true, date: "Jun 11, 2026 · 03:47 PM" }
];

/** Live transactions come from /api/transactions. */
export const recentTransactions: Transaction[] = [];
