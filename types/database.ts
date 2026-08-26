/**
 * Shared domain types for Permanence Mobility.
 * Prefer Drizzle `$inferSelect` types from `db/schema` at the data layer;
 * these aliases cover app/API boundaries and DTOs.
 */

import type {
  ApplicationStatus,
  OrganizationStatus,
  OrganizationType,
  PartnerRole,
  PlatformRole,
  RenterStatus,
  ReservationStatus,
  VehicleStatus,
} from "@/lib/roles";

export type Uuid = string;
export type IsoDate = string;
export type IsoDateTime = string;
export type Cents = number;

export type ProfileDto = {
  id: Uuid;
  userId: Uuid;
  email: string;
  fullName: string | null;
  phone: string | null;
  platformRole: PlatformRole | null;
  isActive: boolean;
};

export type OrganizationDto = {
  id: Uuid;
  name: string;
  slug: string;
  type: OrganizationType;
  status: OrganizationStatus;
  contactEmail: string | null;
  city: string | null;
  state: string | null;
};

export type MembershipDto = {
  id: Uuid;
  organizationId: Uuid;
  profileId: Uuid;
  partnerRole: PartnerRole;
  status: string;
};

export type VehicleDto = {
  id: Uuid;
  organizationId: Uuid;
  slug: string;
  make: string;
  model: string;
  year: number;
  category: string;
  status: VehicleStatus;
  weeklyPriceCents: Cents;
  depositCents: Cents;
  location: string | null;
  imageUrl: string | null;
  features: string[];
  eligibility: string[];
};

export type RenterProfileDto = {
  id: Uuid;
  profileId: Uuid;
  status: RenterStatus;
  weeklyBudgetCents: Cents | null;
  approvedPlatforms: string | null;
};

export type ReservationDto = {
  id: Uuid;
  publicId: string;
  organizationId: Uuid;
  vehicleId: Uuid;
  renterProfileId: Uuid;
  status: ReservationStatus;
  startDate: IsoDate;
  endDate: IsoDate;
  weeks: number;
  weeklyPriceCents: Cents;
  depositCents: Cents;
  holdExpiresAt: IsoDateTime | null;
};

export type RentalPeriodDto = {
  id: Uuid;
  reservationId: Uuid;
  weekIndex: number;
  startDate: IsoDate;
  endDate: IsoDate;
  status: string;
  amountCents: Cents;
};

export type PaymentDto = {
  id: Uuid;
  reservationId: Uuid | null;
  amountCents: Cents;
  currency: string;
  paymentType: string;
  status: string;
  providerPaymentId: string | null;
  dueDate: IsoDate | null;
  paidAt: IsoDateTime | null;
};

export type LedgerEntryDto = {
  id: Uuid;
  organizationId: Uuid | null;
  reservationId: Uuid | null;
  paymentId: Uuid | null;
  entryType: string;
  direction: "debit" | "credit" | string;
  amountCents: Cents;
  currency: string;
  occurredAt: IsoDateTime;
};

export type PartnerApplicationDto = {
  id: Uuid;
  organizationId: Uuid | null;
  applicantProfileId: Uuid;
  status: ApplicationStatus;
  companyName: string;
};

export type RenterApplicationDto = {
  id: Uuid;
  renterProfileId: Uuid;
  status: ApplicationStatus;
  preferredVehicleType: string | null;
  desiredStartDate: IsoDate | null;
  weeklyBudgetCents: Cents | null;
};

export type NotificationDto = {
  id: Uuid;
  profileId: Uuid | null;
  channel: "email" | "sms" | string;
  recipient: string;
  eventType: string;
  status: string;
  sentAt: IsoDateTime | null;
};

export type AuditLogDto = {
  id: Uuid;
  actorProfileId: Uuid | null;
  organizationId: Uuid | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  createdAt: IsoDateTime;
};

export type GigPlatformDto = {
  id: Uuid;
  code: string;
  name: string;
  isActive: boolean;
};

export type FeeAgreementDto = {
  id: Uuid;
  organizationId: Uuid;
  name: string;
  status: string;
  managementFeeBps: number;
  processingFeeBps: number;
  flatFeeCents: Cents;
  effectiveFrom: IsoDate;
  effectiveTo: IsoDate | null;
};

export type WeeklyBookingInput = {
  vehicleId: Uuid;
  renterProfileId: Uuid;
  startDate: IsoDate;
  weeks: number;
};

export type MoneyBreakdown = {
  weeklyPriceCents: Cents;
  weeks: number;
  subtotalCents: Cents;
  depositCents: Cents;
  totalDueCents: Cents;
};
