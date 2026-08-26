/** Platform, partner, and domain role/status constants for Permanence Mobility. */

export const PLATFORM_ROLES = {
  SUPER_ADMIN: "super_admin",
  PERMANENCE_ADMIN: "permanence_admin",
  OPERATIONS_MANAGER: "operations_manager",
  FINANCE_MANAGER: "finance_manager",
  RENTAL_AGENT: "rental_agent",
  MAINTENANCE_COORDINATOR: "maintenance_coordinator",
  SUPPORT_AGENT: "support_agent",
} as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[keyof typeof PLATFORM_ROLES];

export const PLATFORM_ROLE_VALUES = Object.values(PLATFORM_ROLES);

export const PARTNER_ROLES = {
  PARTNER_OWNER: "partner_owner",
  PARTNER_MANAGER: "partner_manager",
  PARTNER_STAFF: "partner_staff",
  PARTNER_ACCOUNTANT: "partner_accountant",
  PARTNER_READ_ONLY: "partner_read_only",
} as const;

export type PartnerRole = (typeof PARTNER_ROLES)[keyof typeof PARTNER_ROLES];

export const PARTNER_ROLE_VALUES = Object.values(PARTNER_ROLES);

export const RENTER_STATUSES = {
  APPLICANT: "applicant",
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELINQUENT: "delinquent",
  TERMINATED: "terminated",
  REJECTED: "rejected",
} as const;

export type RenterStatus = (typeof RENTER_STATUSES)[keyof typeof RENTER_STATUSES];

export const ORGANIZATION_TYPES = {
  PERMANENCE_OWNED: "permanence_owned",
  FLEET_PARTNER: "fleet_partner",
  CORPORATE_FLEET: "corporate_fleet",
  SUSPENDED: "suspended",
  TERMINATED: "terminated",
} as const;

export type OrganizationType =
  (typeof ORGANIZATION_TYPES)[keyof typeof ORGANIZATION_TYPES];

export const ORGANIZATION_STATUSES = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  TERMINATED: "terminated",
  REJECTED: "rejected",
} as const;

export type OrganizationStatus =
  (typeof ORGANIZATION_STATUSES)[keyof typeof ORGANIZATION_STATUSES];

export const VEHICLE_STATUSES = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  AVAILABLE: "available",
  RESERVED: "reserved",
  RENTED: "rented",
  MAINTENANCE: "maintenance",
  UNAVAILABLE: "unavailable",
  RETIRED: "retired",
  REJECTED: "rejected",
} as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[keyof typeof VEHICLE_STATUSES];

export const RESERVATION_STATUSES = {
  HOLD: "hold",
  CONFIRMED: "confirmed",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUSES)[keyof typeof RESERVATION_STATUSES];

export const APPLICATION_STATUSES = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUSES)[keyof typeof APPLICATION_STATUSES];

/** Permission keys used by server-side authz and RLS-aligned checks. */
export const PERMISSIONS = {
  // Platform
  MANAGE_PLATFORM: "manage_platform",
  MANAGE_USERS: "manage_users",
  MANAGE_ORGANIZATIONS: "manage_organizations",
  APPROVE_PARTNERS: "approve_partners",
  APPROVE_RENTERS: "approve_renters",
  APPROVE_VEHICLES: "approve_vehicles",
  MANAGE_VEHICLES: "manage_vehicles",
  MANAGE_RESERVATIONS: "manage_reservations",
  MANAGE_PAYMENTS: "manage_payments",
  MANAGE_PAYOUTS: "manage_payouts",
  VIEW_LEDGER: "view_ledger",
  MANAGE_FEE_AGREEMENTS: "manage_fee_agreements",
  MANAGE_MAINTENANCE: "manage_maintenance",
  MANAGE_SUPPORT: "manage_support",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  MANAGE_NOTIFICATIONS: "manage_notifications",
  VIEW_REPORTS: "view_reports",
  // Partner org
  PARTNER_MANAGE_ORG: "partner.manage_org",
  PARTNER_MANAGE_TEAM: "partner.manage_team",
  PARTNER_MANAGE_VEHICLES: "partner.manage_vehicles",
  PARTNER_VIEW_VEHICLES: "partner.view_vehicles",
  PARTNER_MANAGE_AVAILABILITY: "partner.manage_availability",
  PARTNER_VIEW_RESERVATIONS: "partner.view_reservations",
  PARTNER_VIEW_PAYOUTS: "partner.view_payouts",
  PARTNER_VIEW_STATEMENTS: "partner.view_statements",
  PARTNER_MANAGE_DOCUMENTS: "partner.manage_documents",
  PARTNER_VIEW_REPORTS: "partner.view_reports",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_VALUES = Object.values(PERMISSIONS);

export function isPlatformRoleValue(value: string): value is PlatformRole {
  return (PLATFORM_ROLE_VALUES as readonly string[]).includes(value);
}

export function isPartnerRoleValue(value: string): value is PartnerRole {
  return (PARTNER_ROLE_VALUES as readonly string[]).includes(value);
}
