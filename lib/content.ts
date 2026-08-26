/** Shared marketing copy and demo data until the database is wired. */

export const BRAND = {
  name: "Permanence Mobility",
  tagline: "Excellence Is Eternal",
  email: "hello@permanencemobility.com",
  location: "Phoenix, Arizona",
} as const;

export const NAV_LINKS = [
  { href: "/vehicles", label: "Find a Gig Car" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/partners", label: "List Your Vehicles" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Renters",
    links: [
      { href: "/vehicles", label: "Find a Gig Car" },
      { href: "/apply", label: "Apply to Rent" },
      { href: "/renter-requirements", label: "Renter Requirements" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Partners",
    links: [
      { href: "/partners", label: "List Your Vehicles" },
      { href: "/partners/apply", label: "Partner Application" },
      { href: "/partner-requirements", label: "Partner Requirements" },
      { href: "/pricing", label: "Partner Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/cancellation", label: "Cancellation" },
    ],
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    title: "Apply",
    body: "Share your license, gig platforms, and driving history. We review every application personally.",
  },
  {
    title: "Get approved",
    body: "Once approved, you unlock eligible weekly vehicles matched to your platforms and market.",
  },
  {
    title: "Choose your week",
    body: "Select a vehicle, confirm your weekly start date, and complete your rental agreement.",
  },
  {
    title: "Drive and renew",
    body: "Pick up, earn, and renew week to week—or swap when availability allows.",
  },
] as const;

export const GIG_USES = [
  {
    title: "Rideshare",
    body: "Uber, Lyft, and similar platforms—vehicles reviewed for passenger eligibility.",
  },
  {
    title: "Delivery",
    body: "DoorDash, Uber Eats, and courier work with cargo-ready weekly options.",
  },
  {
    title: "Courier & logistics",
    body: "Reliable weekly capacity for packages, medical runs, and local logistics.",
  },
] as const;

export const RENTER_BENEFITS = [
  {
    title: "Weekly clarity",
    body: "Exact seven-day periods with transparent rates—no surprise day-rate math.",
  },
  {
    title: "Work-ready fleet",
    body: "Every listing is reviewed for condition, documents, and platform fit.",
  },
  {
    title: "Human support",
    body: "Operations stays close for onboarding, maintenance, and the road ahead.",
  },
] as const;

export const PARTNER_BENEFITS = [
  {
    title: "Managed demand",
    body: "Approved gig renters find your vehicles through a curated marketplace.",
  },
  {
    title: "Operational guardrails",
    body: "Applications, documents, and vehicle approval keep quality high.",
  },
  {
    title: "Transparent economics",
    body: "Platform fees, payouts, and statements designed for fleet owners.",
  },
] as const;

export const QUALIFICATION_STEPS = [
  "Submit your renter application with license and gig-platform details.",
  "Upload required documents for identity and driving-history review.",
  "Receive an approval decision from Permanence operations.",
  "Browse eligible vehicles and book your first weekly period.",
] as const;

export const RENTER_REQUIREMENTS = [
  "Valid driver’s license in good standing",
  "Proof of residence",
  "Active or pending gig-platform account information",
  "Authorization for driving-history review",
  "Payment method for weekly charges and deposit holds",
  "Minimum age and eligibility as stated in your market",
] as const;

export const PARTNER_REQUIREMENTS = [
  "Registered business or sole-proprietor documentation",
  "Proof of ownership or authorized fleet control",
  "Current insurance meeting platform minimums",
  "Vehicle titles, registrations, and inspection readiness",
  "Willingness to complete partner and vehicle approval reviews",
  "Banking details for Stripe Connect payouts (after approval)",
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "Weekly terms finally match how I actually work. Approval was thorough—and the car was ready when they said it would be.",
    name: "Marcus J.",
    role: "Rideshare · Phoenix",
  },
  {
    quote:
      "Listing through Permanence means I don’t chase random renters. The review process protects my fleet and my brand.",
    name: "Elena R.",
    role: "Fleet Partner · Scottsdale",
  },
  {
    quote:
      "Support answered when a tire issue hit mid-week. That’s the difference between a rental and a partner.",
    name: "Devon K.",
    role: "Delivery · Tempe",
  },
] as const;

export const FAQS = [
  {
    question: "Who can rent a gig vehicle?",
    answer:
      "Approved renters with a valid license, acceptable driving history, required documents, and a gig-work use case we support.",
  },
  {
    question: "How long is a rental?",
    answer:
      "Rentals run in exact weekly periods (seven days), with a one-week minimum and multi-week options when available.",
  },
  {
    question: "Can I list my own vehicles?",
    answer:
      "Yes. Apply as a Fleet Partner. Permanence reviews your business and each vehicle before anything goes live.",
  },
  {
    question: "Are vehicles automatically approved?",
    answer:
      "No. Every partner organization and every vehicle must pass review before a listing can appear.",
  },
  {
    question: "What platforms are supported?",
    answer:
      "Eligibility is data-driven by market and vehicle—rideshare, delivery, and courier uses are common. Your approval letter lists what you can drive.",
  },
  {
    question: "How do deposits and weekly billing work?",
    answer:
      "A security deposit hold is authorized at confirmation. Weekly rent is billed for each seven-day period; eligible deductions may capture from the deposit if needed.",
  },
  {
    question: "What if I need to cancel?",
    answer:
      "See our Cancellation Policy for hold expiry, confirmed reservation changes, and partner-side obligations.",
  },
] as const;

export type FeaturedVehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  weeklyRateCents: number;
  category: string;
  location: string;
  imageUrl?: string;
  seats?: number;
  transmission?: string;
  eligibility?: string[];
  description?: string;
};

export const FEATURED_VEHICLES: FeaturedVehicle[] = [
  {
    id: "pm-camry-2022",
    make: "Toyota",
    model: "Camry",
    year: 2022,
    weeklyRateCents: 34900,
    category: "Sedan",
    location: "Phoenix, AZ",
    seats: 5,
    transmission: "Automatic",
    eligibility: ["Rideshare", "Delivery"],
    description:
      "Reliable mid-size sedan with strong fuel economy—suited for high-mileage gig weeks.",
  },
  {
    id: "pm-prius-2023",
    make: "Toyota",
    model: "Prius",
    year: 2023,
    weeklyRateCents: 32900,
    category: "Hybrid",
    location: "Tempe, AZ",
    seats: 5,
    transmission: "Automatic",
    eligibility: ["Rideshare", "Delivery"],
    description: "Hybrid efficiency for drivers who measure every mile against earnings.",
  },
  {
    id: "pm-odyssey-2021",
    make: "Honda",
    model: "Odyssey",
    year: 2021,
    weeklyRateCents: 42900,
    category: "Van",
    location: "Scottsdale, AZ",
    seats: 7,
    transmission: "Automatic",
    eligibility: ["Delivery", "Courier"],
    description: "Cargo-friendly cabin for delivery and courier weeks that need space.",
  },
  {
    id: "pm-corolla-2024",
    make: "Toyota",
    model: "Corolla",
    year: 2024,
    weeklyRateCents: 30900,
    category: "Sedan",
    location: "Mesa, AZ",
    seats: 5,
    transmission: "Automatic",
    eligibility: ["Rideshare", "Delivery"],
    description: "Compact, current-year sedan for approved renters building consistent weeks.",
  },
  {
    id: "pm-rav4-2022",
    make: "Toyota",
    model: "RAV4",
    year: 2022,
    weeklyRateCents: 39900,
    category: "SUV",
    location: "Phoenix, AZ",
    seats: 5,
    transmission: "Automatic",
    eligibility: ["Rideshare", "Delivery", "Courier"],
    description: "Crossover versatility when weather, cargo, or passenger comfort matters.",
  },
  {
    id: "pm-civic-2023",
    make: "Honda",
    model: "Civic",
    year: 2023,
    weeklyRateCents: 31900,
    category: "Sedan",
    location: "Chandler, AZ",
    seats: 5,
    transmission: "Automatic",
    eligibility: ["Rideshare", "Delivery"],
    description: "Agile sedan with modern cabin tech for long shift days.",
  },
];

export const VEHICLE_CATEGORIES = ["Sedan", "Hybrid", "SUV", "Van"] as const;

export const PRICING_RENTER = [
  {
    title: "Weekly rate",
    body: "Each vehicle lists a clear weekly price in USD. You pay for exact seven-day periods.",
  },
  {
    title: "Security deposit",
    body: "Authorized at confirmation and released per policy when the rental closes cleanly.",
  },
  {
    title: "What is included",
    body: "Approved vehicle access, onboarding guidance, and operations support during your weeks.",
  },
] as const;

export const PRICING_PARTNER = [
  {
    title: "Platform management fee",
    body: "A hybrid schedule covers marketplace, screening, and operations. Agreements may override defaults.",
  },
  {
    title: "Processing",
    body: "Card and payout processing fees apply through Stripe; net proceeds settle to your Connect account.",
  },
  {
    title: "No surprise listing fees",
    body: "You do not pay to apply. Live listings follow approval—not a public self-serve upload.",
  },
] as const;
