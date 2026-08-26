import { FEATURED_VEHICLES } from "@/lib/content";
import { formatCents } from "@/lib/money";

/** Demo deposit defaults to one weekly rate when not listed on the vehicle. */
export function demoDepositCents(weeklyRateCents: number): number {
  return weeklyRateCents;
}

export const DEMO_PARTNER_VEHICLES = FEATURED_VEHICLES.map((v, index) => ({
  ...v,
  status: index % 3 === 0 ? ("pending_approval" as const) : ("approved" as const),
  plate: `AZ-${1000 + index}`,
  depositCents: demoDepositCents(v.weeklyRateCents),
}));

export const DEMO_PARTNER_RESERVATIONS = [
  {
    id: "res-demo-1",
    vehicle: "2022 Toyota Camry",
    renter: "Marcus J.",
    startDate: "2026-08-24",
    endDate: "2026-09-07",
    weeks: 2,
    status: "confirmed",
    weeklyRateCents: 34900,
  },
  {
    id: "res-demo-2",
    vehicle: "2023 Toyota Prius",
    renter: "Devon K.",
    startDate: "2026-08-31",
    endDate: "2026-09-07",
    weeks: 1,
    status: "hold",
    weeklyRateCents: 32900,
  },
  {
    id: "res-demo-3",
    vehicle: "2021 Honda Odyssey",
    renter: "Aisha T.",
    startDate: "2026-09-07",
    endDate: "2026-09-28",
    weeks: 3,
    status: "confirmed",
    weeklyRateCents: 42900,
  },
] as const;

export const DEMO_EARNINGS_LEDGER = [
  {
    id: "led-1",
    period: "Week of Aug 10",
    vehicle: "2022 Toyota Camry",
    grossCents: 34900,
    managementFeeCents: 5235,
    processingFeeCents: 1047,
    netCents: 28618,
  },
  {
    id: "led-2",
    period: "Week of Aug 10",
    vehicle: "2023 Toyota Prius",
    grossCents: 32900,
    managementFeeCents: 4935,
    processingFeeCents: 987,
    netCents: 26978,
  },
  {
    id: "led-3",
    period: "Week of Aug 17",
    vehicle: "2022 Toyota Camry",
    grossCents: 34900,
    managementFeeCents: 5235,
    processingFeeCents: 1047,
    netCents: 28618,
  },
] as const;

export const DEMO_MAINTENANCE = [
  {
    id: "mnt-1",
    vehicle: "2022 Toyota Camry",
    vehicleId: "pm-camry-2022",
    type: "Oil change",
    dueDate: "2026-09-01",
    status: "scheduled" as const,
    partner: "Desert Fleet LLC",
  },
  {
    id: "mnt-2",
    vehicle: "2021 Honda Odyssey",
    vehicleId: "pm-odyssey-2021",
    type: "Tire rotation",
    dueDate: "2026-08-28",
    status: "overdue" as const,
    partner: "Desert Fleet LLC",
  },
  {
    id: "mnt-3",
    vehicle: "2022 Toyota RAV4",
    vehicleId: "pm-rav4-2022",
    type: "Inspection",
    dueDate: "2026-09-15",
    status: "scheduled" as const,
    partner: "Permanence owned",
  },
  {
    id: "mnt-4",
    vehicle: "2023 Toyota Prius",
    vehicleId: "pm-prius-2023",
    type: "Brake pads",
    dueDate: "2026-08-20",
    status: "overdue" as const,
    partner: "Valley Gig Motors",
  },
] as const;

export const DEMO_INSPECTIONS = [
  {
    id: "insp-1",
    vehicle: "2023 Honda Civic",
    vehicleId: "pm-civic-2023",
    renter: "Devon K.",
    type: "pickup" as const,
    status: "submitted" as const,
    scheduledAt: "2026-08-24T15:00:00Z",
    odometer: 41_220,
  },
  {
    id: "insp-2",
    vehicle: "2022 Toyota Camry",
    vehicleId: "pm-camry-2022",
    renter: "Marcus J.",
    type: "return" as const,
    status: "reviewed" as const,
    scheduledAt: "2026-08-17T18:00:00Z",
    odometer: 52_880,
  },
  {
    id: "insp-3",
    vehicle: "2021 Honda Odyssey",
    vehicleId: "pm-odyssey-2021",
    renter: "Aisha T.",
    type: "pickup" as const,
    status: "draft" as const,
    scheduledAt: "2026-09-07T14:00:00Z",
    odometer: null,
  },
] as const;

export const DEMO_UTILIZATION = [
  { vehicleId: "pm-camry-2022", availableDays: 30, rentedDays: 28 },
  { vehicleId: "pm-prius-2023", availableDays: 30, rentedDays: 21 },
  { vehicleId: "pm-odyssey-2021", availableDays: 30, rentedDays: 14 },
  { vehicleId: "pm-civic-2023", availableDays: 30, rentedDays: 7 },
] as const;

export const DEMO_OUTSTANDING_BALANCES = [
  { partyId: "rn-3", partyLabel: "Nina W.", balanceCents: 12_500 },
  { partyId: "rn-2", partyLabel: "Devon K.", balanceCents: 3_190 },
  { partyId: "rn-1", partyLabel: "Marcus J.", balanceCents: 0 },
] as const;

export const DEMO_TEAM = [
  { id: "tm-1", name: "Elena R.", email: "elena@desertfleet.example", role: "partner_owner" },
  { id: "tm-2", name: "Chris P.", email: "chris@desertfleet.example", role: "partner_manager" },
  { id: "tm-3", name: "Sam L.", email: "sam@desertfleet.example", role: "partner_staff" },
] as const;

export const DEMO_DOCUMENTS = [
  { id: "doc-1", name: "Certificate of insurance", status: "approved", updatedAt: "2026-07-12" },
  { id: "doc-2", name: "Business registration", status: "approved", updatedAt: "2026-07-01" },
  { id: "doc-3", name: "W-9", status: "pending_review", updatedAt: "2026-08-18" },
] as const;

export const DEMO_PARTNER_APPLICATIONS = [
  {
    id: "pa-1",
    businessName: "Desert Fleet LLC",
    contact: "Elena R.",
    city: "Scottsdale, AZ",
    vehicles: 8,
    status: "pending_review",
    submittedAt: "2026-08-15",
  },
  {
    id: "pa-2",
    businessName: "Valley Gig Motors",
    contact: "Jordan M.",
    city: "Mesa, AZ",
    vehicles: 3,
    status: "pending_review",
    submittedAt: "2026-08-18",
  },
  {
    id: "pa-3",
    businessName: "Sun Corridor Rentals",
    contact: "Priya S.",
    city: "Tempe, AZ",
    vehicles: 12,
    status: "approved",
    submittedAt: "2026-07-22",
  },
] as const;

export const DEMO_VEHICLE_APPROVALS = DEMO_PARTNER_VEHICLES.filter(
  (v) => v.status === "pending_approval",
).map((v) => ({
  id: v.id,
  label: `${v.year} ${v.make} ${v.model}`,
  partner: "Desert Fleet LLC",
  location: v.location,
  weeklyRate: formatCents(v.weeklyRateCents, { compact: true }),
  status: v.status,
}));

export const DEMO_RENTERS = [
  {
    id: "rn-1",
    name: "Marcus J.",
    email: "marcus@example.com",
    status: "active",
    city: "Phoenix, AZ",
  },
  {
    id: "rn-2",
    name: "Devon K.",
    email: "devon@example.com",
    status: "approved",
    city: "Tempe, AZ",
  },
  {
    id: "rn-3",
    name: "Nina W.",
    email: "nina@example.com",
    status: "applicant",
    city: "Chandler, AZ",
  },
] as const;

export const DEMO_ADMIN_METRICS = [
  { label: "Partner applications", value: "2", hint: "Awaiting review" },
  { label: "Vehicle approvals", value: String(DEMO_VEHICLE_APPROVALS.length), hint: "In queue" },
  { label: "Active reservations", value: "14", hint: "This week" },
  { label: "Gross volume (demo)", value: "$48.2k", hint: "Last 30 days" },
] as const;

export const DEMO_BOOKINGS = [
  {
    id: "bk-demo-1",
    publicId: "hold_pm_demo_001",
    vehicleId: "pm-camry-2022",
    status: "hold",
    startDate: "2026-08-24",
    endDate: "2026-09-07",
    weeks: 2,
    weeklyPriceCents: 34900,
    depositCents: 34900,
    holdExpiresAt: "2026-08-21T22:00:00.000Z",
  },
] as const;

export const DEMO_RENTER_RENTALS = [
  {
    id: "rr-1",
    vehicle: "2022 Toyota Camry",
    startDate: "2026-08-03",
    endDate: "2026-08-17",
    status: "completed",
    weeklyRateCents: 34900,
  },
  {
    id: "rr-2",
    vehicle: "2023 Honda Civic",
    startDate: "2026-08-24",
    endDate: "2026-09-07",
    status: "confirmed",
    weeklyRateCents: 31900,
  },
] as const;

export const DEMO_RENTER_PAYMENTS = [
  {
    id: "pay-1",
    label: "Week of Aug 3 · Camry",
    amountCents: 34900,
    status: "paid",
    paidAt: "2026-08-03",
  },
  {
    id: "pay-2",
    label: "Week of Aug 10 · Camry",
    amountCents: 34900,
    status: "paid",
    paidAt: "2026-08-10",
  },
  {
    id: "pay-3",
    label: "Deposit hold · Civic",
    amountCents: 31900,
    status: "authorized",
    paidAt: "2026-08-20",
  },
] as const;

export const DEMO_RENTER_DOCUMENTS = [
  { id: "rd-1", name: "Driver’s license", status: "approved" },
  { id: "rd-2", name: "Proof of residence", status: "approved" },
  { id: "rd-3", name: "Gig platform confirmation", status: "pending_review" },
] as const;

export const DEMO_AUDIT_EVENTS = [
  {
    id: "aud-1",
    at: "2026-08-20T16:12:00Z",
    actor: "ops@permanence.mobility",
    action: "partner.application.approved",
    subject: "Sun Corridor Rentals",
  },
  {
    id: "aud-2",
    at: "2026-08-19T11:04:00Z",
    actor: "finance@permanence.mobility",
    action: "fee_agreement.updated",
    subject: "Desert Fleet LLC",
  },
  {
    id: "aud-3",
    at: "2026-08-18T09:40:00Z",
    actor: "ops@permanence.mobility",
    action: "vehicle.approval.requested",
    subject: "pm-camry-2022",
  },
] as const;
