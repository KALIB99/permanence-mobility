import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    email: text("email").notNull(),
    fullName: text("full_name"),
    phone: text("phone"),
    avatarUrl: text("avatar_url"),
    platformRole: text("platform_role"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("profiles_user_id_uidx").on(table.userId),
    uniqueIndex("profiles_email_uidx").on(table.email),
    index("profiles_platform_role_idx").on(table.platformRole),
  ],
);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull().default("draft"),
    legalName: text("legal_name"),
    taxId: text("tax_id"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    billingEmail: text("billing_email"),
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country").notNull().default("US"),
    stripeConnectAccountId: text("stripe_connect_account_id"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("organizations_slug_uidx").on(table.slug),
    index("organizations_type_status_idx").on(table.type, table.status),
  ],
);

export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    partnerRole: text("partner_role").notNull(),
    status: text("status").notNull().default("active"),
    invitedBy: uuid("invited_by").references(() => profiles.id),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("org_memberships_org_profile_uidx").on(
      table.organizationId,
      table.profileId,
    ),
    index("org_memberships_profile_idx").on(table.profileId),
  ],
);

export const gigPlatforms = pgTable(
  "gig_platforms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ...timestamps,
  },
  (table) => [uniqueIndex("gig_platforms_code_uidx").on(table.code)],
);

export const feeAgreements = pgTable(
  "fee_agreements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    managementFeeBps: integer("management_fee_bps").notNull().default(0),
    processingFeeBps: integer("processing_fee_bps").notNull().default(0),
    flatFeeCents: integer("flat_fee_cents").notNull().default(0),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    notes: text("notes"),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    index("fee_agreements_org_idx").on(table.organizationId),
    index("fee_agreements_effective_idx").on(
      table.organizationId,
      table.effectiveFrom,
    ),
  ],
);

export const partnerApplications = pgTable(
  "partner_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    applicantProfileId: uuid("applicant_profile_id")
      .notNull()
      .references(() => profiles.id),
    status: text("status").notNull().default("draft"),
    companyName: text("company_name").notNull(),
    fleetSizeEstimate: integer("fleet_size_estimate"),
    operatingMarkets: text("operating_markets"),
    businessDescription: text("business_description"),
    documentUrls: jsonb("document_urls").$type<string[]>().default([]),
    reviewedBy: uuid("reviewed_by").references(() => profiles.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    decisionNotes: text("decision_notes"),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    index("partner_applications_status_idx").on(table.status),
    index("partner_applications_applicant_idx").on(table.applicantProfileId),
  ],
);

export const renterProfiles = pgTable(
  "renter_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    status: text("status").notNull().default("applicant"),
    dateOfBirth: date("date_of_birth"),
    driversLicenseNumber: text("drivers_license_number"),
    driversLicenseState: text("drivers_license_state"),
    preferredMarkets: text("preferred_markets"),
    approvedPlatforms: text("approved_platforms"),
    weeklyBudgetCents: integer("weekly_budget_cents"),
    stripeCustomerId: text("stripe_customer_id"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("renter_profiles_profile_uidx").on(table.profileId),
    index("renter_profiles_status_idx").on(table.status),
  ],
);

export const renterApplications = pgTable(
  "renter_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    renterProfileId: uuid("renter_profile_id")
      .notNull()
      .references(() => renterProfiles.id),
    status: text("status").notNull().default("draft"),
    preferredVehicleType: text("preferred_vehicle_type"),
    desiredStartDate: date("desired_start_date"),
    location: text("location"),
    approvedPlatforms: text("approved_platforms"),
    weeklyBudgetCents: integer("weekly_budget_cents"),
    documentUrls: jsonb("document_urls").$type<string[]>().default([]),
    reviewedBy: uuid("reviewed_by").references(() => profiles.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    decisionNotes: text("decision_notes"),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    index("renter_applications_status_idx").on(table.status),
    index("renter_applications_renter_idx").on(table.renterProfileId),
  ],
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    slug: text("slug").notNull(),
    vin: text("vin"),
    make: text("make").notNull(),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    trim: text("trim"),
    color: text("color"),
    category: text("category").notNull(),
    status: text("status").notNull().default("draft"),
    weeklyPriceCents: integer("weekly_price_cents").notNull(),
    depositCents: integer("deposit_cents").notNull().default(0),
    mileageAllowance: integer("mileage_allowance"),
    location: text("location"),
    features: jsonb("features").$type<string[]>().default([]),
    eligibility: jsonb("eligibility").$type<string[]>().default([]),
    imageUrl: text("image_url"),
    plateNumber: text("plate_number"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("vehicles_slug_uidx").on(table.slug),
    uniqueIndex("vehicles_vin_uidx").on(table.vin),
    index("vehicles_org_status_idx").on(table.organizationId, table.status),
  ],
);

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    publicId: text("public_id").notNull(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    renterProfileId: uuid("renter_profile_id")
      .notNull()
      .references(() => renterProfiles.id),
    status: text("status").notNull().default("hold"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    weeks: integer("weeks").notNull(),
    weeklyPriceCents: integer("weekly_price_cents").notNull(),
    depositCents: integer("deposit_cents").notNull().default(0),
    holdExpiresAt: timestamp("hold_expires_at", { withTimezone: true }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    notes: text("notes"),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("reservations_public_id_uidx").on(table.publicId),
    index("reservations_vehicle_period_idx").on(
      table.vehicleId,
      table.startDate,
      table.endDate,
      table.status,
    ),
    index("reservations_renter_idx").on(table.renterProfileId),
    index("reservations_org_idx").on(table.organizationId),
  ],
);

export const rentalPeriods = pgTable(
  "rental_periods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reservationId: uuid("reservation_id")
      .notNull()
      .references(() => reservations.id),
    weekIndex: integer("week_index").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: text("status").notNull().default("scheduled"),
    amountCents: integer("amount_cents").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("rental_periods_reservation_week_uidx").on(
      table.reservationId,
      table.weekIndex,
    ),
    index("rental_periods_dates_idx").on(table.startDate, table.endDate),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reservationId: uuid("reservation_id").references(() => reservations.id),
    organizationId: uuid("organization_id").references(() => organizations.id),
    renterProfileId: uuid("renter_profile_id").references(
      () => renterProfiles.id,
    ),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    paymentType: text("payment_type").notNull(),
    status: text("status").notNull().default("pending"),
    provider: text("provider").notNull().default("stripe"),
    providerPaymentId: text("provider_payment_id"),
    providerInvoiceId: text("provider_invoice_id"),
    dueDate: date("due_date"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ...timestamps,
  },
  (table) => [
    index("payments_reservation_idx").on(table.reservationId),
    index("payments_status_due_idx").on(table.status, table.dueDate),
    uniqueIndex("payments_provider_payment_uidx").on(table.providerPaymentId),
  ],
);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    reservationId: uuid("reservation_id").references(() => reservations.id),
    paymentId: uuid("payment_id").references(() => payments.id),
    entryType: text("entry_type").notNull(),
    direction: text("direction").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    description: text("description"),
    idempotencyKey: text("idempotency_key"),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("ledger_entries_idempotency_uidx").on(table.idempotencyKey),
    index("ledger_entries_org_idx").on(table.organizationId),
    index("ledger_entries_payment_idx").on(table.paymentId),
    index("ledger_entries_occurred_idx").on(table.occurredAt),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id),
    channel: text("channel").notNull(),
    recipient: text("recipient").notNull(),
    eventType: text("event_type").notNull(),
    subject: text("subject"),
    body: text("body"),
    status: text("status").notNull().default("pending"),
    provider: text("provider"),
    providerId: text("provider_id"),
    detail: text("detail"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("notifications_profile_idx").on(table.profileId),
    index("notifications_status_idx").on(table.status),
    index("notifications_event_idx").on(table.eventType),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorProfileId: uuid("actor_profile_id").references(() => profiles.id),
    organizationId: uuid("organization_id").references(() => organizations.id),
    action: text("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    before: jsonb("before").$type<Record<string, unknown> | null>(),
    after: jsonb("after").$type<Record<string, unknown> | null>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_actor_idx").on(table.actorProfileId),
    index("audit_logs_org_idx").on(table.organizationId),
    index("audit_logs_resource_idx").on(table.resourceType, table.resourceId),
    index("audit_logs_created_idx").on(table.createdAt),
  ],
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMembership =
  typeof organizationMemberships.$inferSelect;
export type NewOrganizationMembership =
  typeof organizationMemberships.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
export type RentalPeriod = typeof rentalPeriods.$inferSelect;
export type NewRentalPeriod = typeof rentalPeriods.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type NewLedgerEntry = typeof ledgerEntries.$inferInsert;
export type PartnerApplication = typeof partnerApplications.$inferSelect;
export type NewPartnerApplication = typeof partnerApplications.$inferInsert;
export type RenterProfile = typeof renterProfiles.$inferSelect;
export type NewRenterProfile = typeof renterProfiles.$inferInsert;
export type RenterApplication = typeof renterApplications.$inferSelect;
export type NewRenterApplication = typeof renterApplications.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type GigPlatform = typeof gigPlatforms.$inferSelect;
export type NewGigPlatform = typeof gigPlatforms.$inferInsert;
export type FeeAgreement = typeof feeAgreements.$inferSelect;
export type NewFeeAgreement = typeof feeAgreements.$inferInsert;
