-- =============================================================================
-- Permanence Mobility — initial schema
-- Multi-tenant gig vehicle rental platform (Supabase PostgreSQL)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists btree_gist with schema extensions;

create schema if not exists private;
create schema if not exists extensions;

-- Migrations should resolve extension types/functions reliably
set search_path to public, extensions, private;

comment on schema private is
  'Internal helpers and security-definer implementations; not exposed via PostgREST.';

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.organization_type as enum (
  'permanence_owned',
  'fleet_partner',
  'corporate_fleet'
);

create type public.organization_status as enum (
  'pending',
  'active',
  'suspended',
  'terminated',
  'rejected'
);

create type public.platform_role as enum (
  'super_admin',
  'permanence_admin',
  'operations_manager',
  'finance_manager',
  'rental_agent',
  'maintenance_coordinator',
  'support_agent'
);

create type public.partner_role as enum (
  'partner_owner',
  'partner_manager',
  'partner_staff',
  'partner_accountant',
  'partner_read_only'
);

create type public.membership_status as enum (
  'invited',
  'active',
  'suspended',
  'removed'
);

create type public.application_status as enum (
  'draft',
  'submitted',
  'in_review',
  'approved',
  'rejected',
  'withdrawn'
);

create type public.renter_status as enum (
  'applicant',
  'approved',
  'active',
  'suspended',
  'delinquent',
  'terminated'
);

create type public.document_status as enum (
  'pending',
  'approved',
  'rejected',
  'expired'
);

create type public.vehicle_status as enum (
  'draft',
  'available',
  'held',
  'rented',
  'maintenance',
  'unavailable',
  'retired'
);

create type public.approval_status as enum (
  'pending',
  'approved',
  'rejected',
  'changes_requested'
);

create type public.maintenance_status as enum (
  'ok',
  'due_soon',
  'overdue',
  'in_shop'
);

create type public.vehicle_category as enum (
  'sedan',
  'hatchback',
  'suv',
  'crossover',
  'van',
  'truck',
  'ev',
  'hybrid',
  'other'
);

create type public.reservation_status as enum (
  'held',
  'confirmed',
  'active',
  'completed',
  'cancelled',
  'expired'
);

create type public.rental_period_status as enum (
  'scheduled',
  'active',
  'billed',
  'paid',
  'failed',
  'waived',
  'cancelled'
);

create type public.renewal_status as enum (
  'pending',
  'accepted',
  'declined',
  'expired',
  'cancelled'
);

create type public.swap_status as enum (
  'requested',
  'approved',
  'completed',
  'rejected',
  'cancelled'
);

create type public.payment_status as enum (
  'pending',
  'authorized',
  'captured',
  'failed',
  'refunded',
  'partially_refunded',
  'cancelled'
);

create type public.deposit_status as enum (
  'authorized',
  'captured',
  'released',
  'partially_captured',
  'failed',
  'cancelled'
);

create type public.refund_status as enum (
  'pending',
  'succeeded',
  'failed',
  'cancelled'
);

create type public.chargeback_status as enum (
  'opened',
  'won',
  'lost',
  'accepted',
  'evidence_needed'
);

create type public.ledger_entry_type as enum (
  'rental_charge',
  'platform_fee',
  'processing_fee',
  'partner_credit',
  'partner_debit',
  'deposit_hold',
  'deposit_capture',
  'deposit_release',
  'refund',
  'chargeback',
  'payout',
  'adjustment',
  'tax',
  'other'
);

create type public.payout_status as enum (
  'pending',
  'in_transit',
  'paid',
  'failed',
  'cancelled'
);

create type public.inspection_type as enum (
  'pickup',
  'return',
  'periodic',
  'damage',
  'pre_listing'
);

create type public.inspection_status as enum (
  'draft',
  'submitted',
  'reviewed',
  'disputed'
);

create type public.damage_severity as enum (
  'cosmetic',
  'minor',
  'moderate',
  'severe',
  'total_loss'
);

create type public.accident_status as enum (
  'reported',
  'investigating',
  'insurance_filed',
  'closed'
);

create type public.agreement_status as enum (
  'draft',
  'sent',
  'signed',
  'void',
  'expired'
);

create type public.signature_status as enum (
  'pending',
  'signed',
  'declined',
  'expired'
);

create type public.notification_channel as enum (
  'email',
  'sms',
  'in_app',
  'push'
);

create type public.ticket_status as enum (
  'open',
  'in_progress',
  'waiting',
  'resolved',
  'closed'
);

create type public.ticket_priority as enum (
  'low',
  'normal',
  'high',
  'urgent'
);

-- ---------------------------------------------------------------------------
-- Utility: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Identity & tenancy
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email extensions.citext not null,
  full_name text,
  platform_role public.platform_role,
  phone text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint profiles_email_unique unique (email)
);

comment on table public.profiles is
  '1:1 extension of auth.users. platform_role is stored here (never in user_metadata).';

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  type public.organization_type not null,
  status public.organization_status not null default 'pending',
  stripe_connect_account_id text,
  settings jsonb not null default '{}'::jsonb,
  legal_name text,
  tax_id text,
  billing_email extensions.citext,
  phone text,
  address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint organizations_slug_unique unique (slug),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

comment on table public.organizations is
  'Tenant root. Permanence-owned fleet is type=permanence_owned; partners are fleet_partner.';

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  partner_role public.partner_role not null default 'partner_staff',
  status public.membership_status not null default 'invited',
  invited_email extensions.citext,
  invited_by uuid references public.profiles (id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint organization_memberships_org_user_unique unique (organization_id, user_id),
  constraint organization_memberships_user_or_invite check (
    user_id is not null or invited_email is not null
  )
);

comment on table public.organization_memberships is
  'Partner-org RBAC membership. unique(organization_id, user_id).';

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint permissions_key_unique unique (key)
);

comment on table public.permissions is
  'Granular permission keys (e.g. vehicles.write, payouts.read).';

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_domain text not null check (role_domain in ('platform', 'partner')),
  role_key text not null,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint role_permissions_unique unique (role_domain, role_key, permission_id)
);

comment on table public.role_permissions is
  'Maps platform_role / partner_role string keys to permission rows.';

-- ---------------------------------------------------------------------------
-- Onboarding
-- ---------------------------------------------------------------------------
create table public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  applicant_user_id uuid references public.profiles (id) on delete set null,
  company_name text not null,
  contact_email extensions.citext not null,
  contact_phone text,
  fleet_size_estimate integer,
  status public.application_status not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

comment on table public.partner_applications is
  'Fleet Partner onboarding applications prior to / while creating an organization.';

create table public.fleet_management_agreements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  version text not null,
  status public.agreement_status not null default 'draft',
  document_url text,
  terms jsonb not null default '{}'::jsonb,
  effective_at timestamptz,
  expires_at timestamptz,
  signed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.renter_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.renter_status not null default 'applicant',
  date_of_birth date,
  license_number text,
  license_state text,
  license_expires date,
  address jsonb not null default '{}'::jsonb,
  emergency_contact jsonb not null default '{}'::jsonb,
  stripe_customer_id text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint renter_profiles_user_unique unique (user_id)
);

comment on table public.renter_profiles is
  'Gig-worker renter identity and lifecycle status (applicant → active).';

create table public.renter_applications (
  id uuid primary key default gen_random_uuid(),
  renter_profile_id uuid not null references public.renter_profiles (id) on delete cascade,
  status public.application_status not null default 'draft',
  preferred_platforms text[] not null default '{}',
  preferred_vehicle_category public.vehicle_category,
  weekly_budget_cents integer,
  city text,
  payload jsonb not null default '{}'::jsonb,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.driver_documents (
  id uuid primary key default gen_random_uuid(),
  renter_profile_id uuid not null references public.renter_profiles (id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  status public.document_status not null default 'pending',
  expires_at date,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.gig_platforms (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  name text not null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint gig_platforms_key_unique unique (key)
);

comment on table public.gig_platforms is
  'Configurable gig platforms (Uber, DoorDash, etc.). Never hard-code business rules.';

create table public.gig_platform_profiles (
  id uuid primary key default gen_random_uuid(),
  renter_profile_id uuid not null references public.renter_profiles (id) on delete cascade,
  gig_platform_id uuid not null references public.gig_platforms (id) on delete cascade,
  external_driver_id text,
  rating numeric(3, 2),
  trips_completed integer,
  status public.document_status not null default 'pending',
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint gig_platform_profiles_unique unique (renter_profile_id, gig_platform_id)
);

create table public.eligibility_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  gig_platform_id uuid references public.gig_platforms (id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  rule jsonb not null default '{}'::jsonb,
  priority integer not null default 100,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

comment on table public.eligibility_rules is
  'Data-driven eligibility constraints; organization_id null = platform-wide default.';

-- ---------------------------------------------------------------------------
-- Fleet
-- ---------------------------------------------------------------------------
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  make text not null,
  model text not null,
  year integer not null check (year >= 1990 and year <= 2100),
  vin text not null,
  plate text,
  color text,
  odometer integer not null default 0 check (odometer >= 0),
  category public.vehicle_category not null default 'other',
  weekly_rate_cents integer not null check (weekly_rate_cents >= 0),
  multi_week_pricing jsonb not null default '{}'::jsonb,
  deposit_cents integer not null default 0 check (deposit_cents >= 0),
  mileage_allowance integer,
  excess_mileage_fee_cents integer not null default 0 check (excess_mileage_fee_cents >= 0),
  min_weeks integer not null default 1 check (min_weeks >= 1 and min_weeks <= 26),
  status public.vehicle_status not null default 'draft',
  registration_expires date,
  insurance_expires date,
  inspection_expires date,
  maintenance_status public.maintenance_status not null default 'ok',
  condition_notes text,
  current_renter_id uuid references public.renter_profiles (id) on delete set null,
  approval_status public.approval_status not null default 'pending',
  location text,
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint vehicles_vin_unique unique (vin)
);

comment on table public.vehicles is
  'Partner-owned (or Permanence-owned) fleet units. Money fields are integer cents.';

create table public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  alt_text text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.vehicle_approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  status public.approval_status not null default 'pending',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  checklist jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.vehicle_availability (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  starts_on date not null,
  ends_on date,
  is_available boolean not null default true,
  weekday_flags boolean[7],
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint vehicle_availability_range check (ends_on is null or ends_on >= starts_on)
);

comment on table public.vehicle_availability is
  'Date-range and optional weekday flags (Mon=1 … Sun=7 index 0..6) for listing availability.';

create table public.vehicle_platform_eligibility (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  gig_platform_id uuid not null references public.gig_platforms (id) on delete cascade,
  eligibility_rule_id uuid references public.eligibility_rules (id) on delete set null,
  is_eligible boolean not null default true,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint vehicle_platform_eligibility_unique unique (vehicle_id, gig_platform_id)
);

-- ---------------------------------------------------------------------------
-- Rentals
-- ---------------------------------------------------------------------------
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  renter_id uuid not null references public.renter_profiles (id) on delete restrict,
  status public.reservation_status not null default 'held',
  start_date date not null,
  end_date date not null,
  weeks integer not null check (weeks >= 1 and weeks <= 26),
  hold_expires_at timestamptz,
  weekly_rate_cents integer not null check (weekly_rate_cents >= 0),
  deposit_cents integer not null default 0 check (deposit_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  currency text not null default 'usd',
  stripe_subscription_id text,
  notes text,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint reservations_date_range check (end_date > start_date),
  constraint reservations_weeks_match check (
    end_date = (start_date + make_interval(days => weeks * 7))::date
  )
);

comment on table public.reservations is
  'Weekly rental bookings. Overlapping held/confirmed/active ranges are excluded via GiST.';

-- Prevent overlapping active reservations for the same vehicle
alter table public.reservations
  add constraint reservations_no_overlap_active
  exclude using gist (
    vehicle_id with =,
    daterange(start_date, end_date, '[)') with &&
  )
  where (status in ('held', 'confirmed', 'active') and deleted_at is null);

create table public.rental_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  period_index integer not null check (period_index >= 1),
  starts_on date not null,
  ends_on date not null,
  status public.rental_period_status not null default 'scheduled',
  amount_cents integer not null check (amount_cents >= 0),
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint rental_periods_range check (ends_on = (starts_on + interval '7 days')::date),
  constraint rental_periods_unique unique (reservation_id, period_index)
);

comment on table public.rental_periods is
  'Exact 7-day billing periods belonging to a reservation.';

create table public.rental_renewals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  additional_weeks integer not null check (additional_weeks >= 1 and additional_weeks <= 26),
  status public.renewal_status not null default 'pending',
  offered_weekly_rate_cents integer check (offered_weekly_rate_cents is null or offered_weekly_rate_cents >= 0),
  expires_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.vehicle_swaps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  from_vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  to_vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  status public.swap_status not null default 'requested',
  reason text,
  effective_on date,
  decided_by uuid references public.profiles (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint vehicle_swaps_different check (from_vehicle_id <> to_vehicle_id)
);

-- ---------------------------------------------------------------------------
-- Money
-- ---------------------------------------------------------------------------
create table public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  vehicle_id uuid references public.vehicles (id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  rule jsonb not null default '{}'::jsonb,
  priority integer not null default 100,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.fee_agreements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  vehicle_id uuid references public.vehicles (id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  schedule jsonb not null default '{}'::jsonb,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

comment on table public.fee_agreements is
  'Management / hybrid fee schedules; null organization_id = platform default.';

create table public.fee_calculations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  reservation_id uuid references public.reservations (id) on delete set null,
  rental_period_id uuid references public.rental_periods (id) on delete set null,
  fee_agreement_id uuid references public.fee_agreements (id) on delete set null,
  gross_cents integer not null check (gross_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  processing_fee_cents integer not null default 0 check (processing_fee_cents >= 0),
  partner_net_cents integer not null default 0,
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  reservation_id uuid references public.reservations (id) on delete set null,
  rental_period_id uuid references public.rental_periods (id) on delete set null,
  renter_id uuid references public.renter_profiles (id) on delete set null,
  status public.payment_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  stripe_charge_id text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.security_deposits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  renter_id uuid not null references public.renter_profiles (id) on delete restrict,
  status public.deposit_status not null default 'authorized',
  amount_cents integer not null check (amount_cents >= 0),
  captured_cents integer not null default 0 check (captured_cents >= 0),
  currency text not null default 'usd',
  stripe_payment_intent_id text,
  released_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  payment_id uuid not null references public.payments (id) on delete restrict,
  status public.refund_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  stripe_refund_id text,
  reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.chargebacks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  payment_id uuid not null references public.payments (id) on delete restrict,
  status public.chargeback_status not null default 'opened',
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  stripe_dispute_id text,
  reason text,
  evidence jsonb not null default '{}'::jsonb,
  opened_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  entry_type public.ledger_entry_type not null,
  amount_cents integer not null,
  currency text not null default 'usd',
  direction text not null check (direction in ('debit', 'credit')),
  reservation_id uuid references public.reservations (id) on delete set null,
  payment_id uuid references public.payments (id) on delete set null,
  payout_id uuid,
  rental_period_id uuid references public.rental_periods (id) on delete set null,
  fee_calculation_id uuid references public.fee_calculations (id) on delete set null,
  external_ref text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles (id) on delete set null
);

comment on table public.ledger_entries is
  'Append-only financial ledger. No update/delete for authenticated roles; service_role only.';

create table public.partner_balances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  available_cents integer not null default 0,
  pending_cents integer not null default 0,
  currency text not null default 'usd',
  as_of timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint partner_balances_org_currency_unique unique (organization_id, currency)
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status public.payout_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  stripe_payout_id text,
  arrival_date date,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.ledger_entries
  add constraint ledger_entries_payout_id_fkey
  foreign key (payout_id) references public.payouts (id) on delete set null;

create table public.payout_statements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  payout_id uuid not null references public.payouts (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  gross_cents integer not null default 0,
  fees_cents integer not null default 0,
  net_cents integer not null default 0,
  line_items jsonb not null default '[]'::jsonb,
  document_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payout_statements_range check (period_end >= period_start)
);

-- ---------------------------------------------------------------------------
-- Ops
-- ---------------------------------------------------------------------------
create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  performed_at timestamptz not null default timezone('utc', now()),
  odometer integer,
  category text,
  description text,
  cost_cents integer not null default 0 check (cost_cents >= 0),
  vendor text,
  status text not null default 'completed',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  reservation_id uuid references public.reservations (id) on delete set null,
  inspection_type public.inspection_type not null,
  status public.inspection_status not null default 'draft',
  inspected_at timestamptz,
  inspector_id uuid references public.profiles (id) on delete set null,
  odometer integer,
  fuel_level numeric(4, 1),
  gps jsonb,
  checklist jsonb not null default '{}'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.damage_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  reservation_id uuid references public.reservations (id) on delete set null,
  inspection_id uuid references public.inspections (id) on delete set null,
  reported_by uuid references public.profiles (id) on delete set null,
  severity public.damage_severity not null default 'cosmetic',
  description text not null,
  estimated_cost_cents integer check (estimated_cost_cents is null or estimated_cost_cents >= 0),
  photos jsonb not null default '[]'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.accident_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  reservation_id uuid references public.reservations (id) on delete set null,
  renter_id uuid references public.renter_profiles (id) on delete set null,
  status public.accident_status not null default 'reported',
  occurred_at timestamptz not null,
  location text,
  police_report_number text,
  description text,
  insurance_claim_number text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.rental_agreements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  status public.agreement_status not null default 'draft',
  version text not null,
  document_url text,
  terms_hash text,
  sent_at timestamptz,
  signed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.electronic_signatures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  rental_agreement_id uuid not null references public.rental_agreements (id) on delete cascade,
  signer_user_id uuid references public.profiles (id) on delete set null,
  signer_email extensions.citext,
  status public.signature_status not null default 'pending',
  signed_at timestamptz,
  ip_address inet,
  user_agent text,
  signature_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel public.notification_channel not null default 'in_app',
  title text not null,
  body text,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  opened_by uuid not null references public.profiles (id) on delete cascade,
  assigned_to uuid references public.profiles (id) on delete set null,
  reservation_id uuid references public.reservations (id) on delete set null,
  vehicle_id uuid references public.vehicles (id) on delete set null,
  status public.ticket_status not null default 'open',
  priority public.ticket_priority not null default 'normal',
  subject text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz,
  deleted_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  before jsonb,
  after jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.audit_logs is
  'Immutable privileged-action audit trail. Append-only for authenticated clients.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index profiles_platform_role_idx on public.profiles (platform_role)
  where platform_role is not null and deleted_at is null;
create index profiles_deleted_at_idx on public.profiles (deleted_at);

create index organizations_type_idx on public.organizations (type);
create index organizations_status_idx on public.organizations (status);
create index organizations_deleted_at_idx on public.organizations (deleted_at);

create index organization_memberships_org_idx on public.organization_memberships (organization_id);
create index organization_memberships_user_idx on public.organization_memberships (user_id);
create index organization_memberships_status_idx on public.organization_memberships (status);

create index partner_applications_status_idx on public.partner_applications (status);
create index partner_applications_org_idx on public.partner_applications (organization_id);

create index fleet_management_agreements_org_idx on public.fleet_management_agreements (organization_id);

create index renter_profiles_status_idx on public.renter_profiles (status);
create index renter_applications_renter_idx on public.renter_applications (renter_profile_id);
create index renter_applications_status_idx on public.renter_applications (status);
create index driver_documents_renter_idx on public.driver_documents (renter_profile_id);
create index driver_documents_status_idx on public.driver_documents (status);

create index gig_platforms_active_idx on public.gig_platforms (is_active) where deleted_at is null;
create index gig_platform_profiles_renter_idx on public.gig_platform_profiles (renter_profile_id);
create index eligibility_rules_org_idx on public.eligibility_rules (organization_id);
create index eligibility_rules_platform_idx on public.eligibility_rules (gig_platform_id);

create index vehicles_organization_id_idx on public.vehicles (organization_id);
create index vehicles_status_idx on public.vehicles (status);
create index vehicles_approval_status_idx on public.vehicles (approval_status);
create index vehicles_vin_idx on public.vehicles (vin);
create index vehicles_current_renter_idx on public.vehicles (current_renter_id);
create index vehicles_category_idx on public.vehicles (category);
create index vehicles_deleted_at_idx on public.vehicles (deleted_at);

create index vehicle_images_vehicle_idx on public.vehicle_images (vehicle_id);
create index vehicle_images_org_idx on public.vehicle_images (organization_id);
create index vehicle_approvals_vehicle_idx on public.vehicle_approvals (vehicle_id);
create index vehicle_approvals_org_idx on public.vehicle_approvals (organization_id);
create index vehicle_availability_vehicle_idx on public.vehicle_availability (vehicle_id);
create index vehicle_availability_org_idx on public.vehicle_availability (organization_id);
create index vehicle_availability_dates_idx on public.vehicle_availability (starts_on, ends_on);
create index vehicle_platform_eligibility_vehicle_idx on public.vehicle_platform_eligibility (vehicle_id);
create index vehicle_platform_eligibility_org_idx on public.vehicle_platform_eligibility (organization_id);

create index reservations_organization_id_idx on public.reservations (organization_id);
create index reservations_vehicle_id_idx on public.reservations (vehicle_id);
create index reservations_renter_id_idx on public.reservations (renter_id);
create index reservations_status_idx on public.reservations (status);
create index reservations_dates_idx on public.reservations (start_date, end_date);
create index reservations_hold_expires_idx on public.reservations (hold_expires_at)
  where status = 'held';

create index rental_periods_org_idx on public.rental_periods (organization_id);
create index rental_periods_reservation_idx on public.rental_periods (reservation_id);
create index rental_periods_status_idx on public.rental_periods (status);
create index rental_renewals_org_idx on public.rental_renewals (organization_id);
create index rental_renewals_reservation_idx on public.rental_renewals (reservation_id);
create index vehicle_swaps_org_idx on public.vehicle_swaps (organization_id);
create index vehicle_swaps_reservation_idx on public.vehicle_swaps (reservation_id);

create index pricing_rules_org_idx on public.pricing_rules (organization_id);
create index pricing_rules_vehicle_idx on public.pricing_rules (vehicle_id);
create index fee_agreements_org_idx on public.fee_agreements (organization_id);
create index fee_calculations_org_idx on public.fee_calculations (organization_id);
create index payments_org_idx on public.payments (organization_id);
create index payments_reservation_idx on public.payments (reservation_id);
create index payments_status_idx on public.payments (status);
create index payments_stripe_pi_idx on public.payments (stripe_payment_intent_id);
create index security_deposits_org_idx on public.security_deposits (organization_id);
create index security_deposits_reservation_idx on public.security_deposits (reservation_id);
create index refunds_org_idx on public.refunds (organization_id);
create index chargebacks_org_idx on public.chargebacks (organization_id);
create index ledger_entries_org_idx on public.ledger_entries (organization_id);
create index ledger_entries_type_idx on public.ledger_entries (entry_type);
create index ledger_entries_created_at_idx on public.ledger_entries (created_at);
create index ledger_entries_payment_idx on public.ledger_entries (payment_id);
create index ledger_entries_payout_idx on public.ledger_entries (payout_id);
create index partner_balances_org_idx on public.partner_balances (organization_id);
create index payouts_org_idx on public.payouts (organization_id);
create index payouts_status_idx on public.payouts (status);
create index payout_statements_org_idx on public.payout_statements (organization_id);
create index payout_statements_payout_idx on public.payout_statements (payout_id);

create index maintenance_records_org_idx on public.maintenance_records (organization_id);
create index maintenance_records_vehicle_idx on public.maintenance_records (vehicle_id);
create index inspections_org_idx on public.inspections (organization_id);
create index inspections_vehicle_idx on public.inspections (vehicle_id);
create index inspections_reservation_idx on public.inspections (reservation_id);
create index damage_reports_org_idx on public.damage_reports (organization_id);
create index damage_reports_vehicle_idx on public.damage_reports (vehicle_id);
create index accident_reports_org_idx on public.accident_reports (organization_id);
create index accident_reports_vehicle_idx on public.accident_reports (vehicle_id);
create index rental_agreements_org_idx on public.rental_agreements (organization_id);
create index rental_agreements_reservation_idx on public.rental_agreements (reservation_id);
create index electronic_signatures_org_idx on public.electronic_signatures (organization_id);
create index electronic_signatures_agreement_idx on public.electronic_signatures (rental_agreement_id);
create index notifications_user_idx on public.notifications (user_id);
create index notifications_org_idx on public.notifications (organization_id);
create index support_tickets_org_idx on public.support_tickets (organization_id);
create index support_tickets_opened_by_idx on public.support_tickets (opened_by);
create index support_tickets_status_idx on public.support_tickets (status);
create index audit_logs_org_idx on public.audit_logs (organization_id);
create index audit_logs_actor_idx on public.audit_logs (actor_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles',
    'organizations',
    'organization_memberships',
    'partner_applications',
    'fleet_management_agreements',
    'renter_profiles',
    'renter_applications',
    'driver_documents',
    'gig_platforms',
    'gig_platform_profiles',
    'eligibility_rules',
    'vehicles',
    'vehicle_images',
    'vehicle_approvals',
    'vehicle_availability',
    'vehicle_platform_eligibility',
    'reservations',
    'rental_periods',
    'rental_renewals',
    'vehicle_swaps',
    'pricing_rules',
    'fee_agreements',
    'payments',
    'security_deposits',
    'refunds',
    'chargebacks',
    'partner_balances',
    'payouts',
    'payout_statements',
    'maintenance_records',
    'inspections',
    'damage_reports',
    'accident_reports',
    'rental_agreements',
    'electronic_signatures',
    'support_tickets'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function private.set_updated_at()',
      t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Auth helpers (private implementations + public wrappers)
-- ---------------------------------------------------------------------------
create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.platform_role is not null
      and p.deleted_at is null
  );
$$;

create or replace function private.user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.organization_id
  from public.organization_memberships m
  where m.user_id = auth.uid()
    and m.status = 'active'
    and m.deleted_at is null;
$$;

create or replace function private.has_org_role(
  p_org_id uuid,
  p_roles public.partner_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = p_org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.deleted_at is null
      and m.partner_role = any (p_roles)
  );
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_platform_admin();
$$;

create or replace function public.user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select private.user_org_ids();
$$;

create or replace function public.has_org_role(
  org_id uuid,
  roles public.partner_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_org_role(org_id, roles);
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.deleted_at is null
  );
$$;

create or replace function public.current_renter_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select rp.id
  from public.renter_profiles rp
  where rp.user_id = auth.uid()
    and rp.deleted_at is null
  limit 1;
$$;

revoke all on function private.is_platform_admin() from public;
revoke all on function private.user_org_ids() from public;
revoke all on function private.has_org_role(uuid, public.partner_role[]) from public;

grant execute on function public.is_platform_admin() to authenticated, anon;
grant execute on function public.user_org_ids() to authenticated, anon;
grant execute on function public.has_org_role(uuid, public.partner_role[]) to authenticated, anon;
grant execute on function public.is_org_member(uuid) to authenticated, anon;
grant execute on function public.current_renter_profile_id() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Public vehicle catalog (limited columns)
-- ---------------------------------------------------------------------------
create or replace view public.vehicle_catalog
with (security_invoker = true)
as
select
  v.id,
  v.organization_id,
  v.make,
  v.model,
  v.year,
  v.color,
  v.category,
  v.weekly_rate_cents,
  v.multi_week_pricing,
  v.deposit_cents,
  v.mileage_allowance,
  v.excess_mileage_fee_cents,
  v.min_weeks,
  v.status,
  v.location,
  v.features,
  v.created_at
from public.vehicles v
where v.approval_status = 'approved'
  and v.status = 'available'
  and v.deleted_at is null;

comment on view public.vehicle_catalog is
  'Public listing projection of approved + available vehicles (limited columns).';

-- ---------------------------------------------------------------------------
-- RLS: enable on all public tables
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.partner_applications enable row level security;
alter table public.fleet_management_agreements enable row level security;
alter table public.renter_profiles enable row level security;
alter table public.renter_applications enable row level security;
alter table public.driver_documents enable row level security;
alter table public.gig_platforms enable row level security;
alter table public.gig_platform_profiles enable row level security;
alter table public.eligibility_rules enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_images enable row level security;
alter table public.vehicle_approvals enable row level security;
alter table public.vehicle_availability enable row level security;
alter table public.vehicle_platform_eligibility enable row level security;
alter table public.reservations enable row level security;
alter table public.rental_periods enable row level security;
alter table public.rental_renewals enable row level security;
alter table public.vehicle_swaps enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.fee_agreements enable row level security;
alter table public.fee_calculations enable row level security;
alter table public.payments enable row level security;
alter table public.security_deposits enable row level security;
alter table public.refunds enable row level security;
alter table public.chargebacks enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.partner_balances enable row level security;
alter table public.payouts enable row level security;
alter table public.payout_statements enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.inspections enable row level security;
alter table public.damage_reports enable row level security;
alter table public.accident_reports enable row level security;
alter table public.rental_agreements enable row level security;
alter table public.electronic_signatures enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.audit_logs enable row level security;

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

-- profiles
create policy profiles_select_own_or_admin
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_platform_admin());

create policy profiles_update_own_or_admin
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_platform_admin())
  with check (id = auth.uid() or public.is_platform_admin());

create policy profiles_insert_own
  on public.profiles for insert to authenticated
  with check (id = auth.uid() or public.is_platform_admin());

-- organizations
create policy organizations_select
  on public.organizations for select to authenticated
  using (
    public.is_platform_admin()
    or id in (select public.user_org_ids())
  );

create policy organizations_insert_admin
  on public.organizations for insert to authenticated
  with check (public.is_platform_admin());

create policy organizations_update
  on public.organizations for update to authenticated
  using (
    public.is_platform_admin()
    or public.has_org_role(id, array['partner_owner', 'partner_manager']::public.partner_role[])
  )
  with check (
    public.is_platform_admin()
    or public.has_org_role(id, array['partner_owner', 'partner_manager']::public.partner_role[])
  );

-- organization_memberships
create policy memberships_select
  on public.organization_memberships for select to authenticated
  using (
    public.is_platform_admin()
    or user_id = auth.uid()
    or organization_id in (select public.user_org_ids())
  );

create policy memberships_insert
  on public.organization_memberships for insert to authenticated
  with check (
    public.is_platform_admin()
    or public.has_org_role(
      organization_id,
      array['partner_owner', 'partner_manager']::public.partner_role[]
    )
  );

create policy memberships_update
  on public.organization_memberships for update to authenticated
  using (
    public.is_platform_admin()
    or public.has_org_role(
      organization_id,
      array['partner_owner', 'partner_manager']::public.partner_role[]
    )
  )
  with check (
    public.is_platform_admin()
    or public.has_org_role(
      organization_id,
      array['partner_owner', 'partner_manager']::public.partner_role[]
    )
  );

-- permissions / role_permissions (read for authenticated; write admin)
create policy permissions_select
  on public.permissions for select to authenticated
  using (true);

create policy permissions_admin_write
  on public.permissions for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy role_permissions_select
  on public.role_permissions for select to authenticated
  using (true);

create policy role_permissions_admin_write
  on public.role_permissions for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- partner_applications
create policy partner_applications_select
  on public.partner_applications for select to authenticated
  using (
    public.is_platform_admin()
    or applicant_user_id = auth.uid()
    or (
      organization_id is not null
      and organization_id in (select public.user_org_ids())
    )
  );

create policy partner_applications_insert
  on public.partner_applications for insert to authenticated
  with check (
    public.is_platform_admin()
    or applicant_user_id = auth.uid()
  );

create policy partner_applications_update
  on public.partner_applications for update to authenticated
  using (
    public.is_platform_admin()
    or applicant_user_id = auth.uid()
  )
  with check (
    public.is_platform_admin()
    or applicant_user_id = auth.uid()
  );

-- fleet_management_agreements
create policy fma_select
  on public.fleet_management_agreements for select to authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
  );

create policy fma_write
  on public.fleet_management_agreements for all to authenticated
  using (
    public.is_platform_admin()
    or public.has_org_role(
      organization_id,
      array['partner_owner', 'partner_manager']::public.partner_role[]
    )
  )
  with check (
    public.is_platform_admin()
    or public.has_org_role(
      organization_id,
      array['partner_owner', 'partner_manager']::public.partner_role[]
    )
  );

-- renter_profiles
create policy renter_profiles_select
  on public.renter_profiles for select to authenticated
  using (
    public.is_platform_admin()
    or user_id = auth.uid()
  );

create policy renter_profiles_insert
  on public.renter_profiles for insert to authenticated
  with check (user_id = auth.uid() or public.is_platform_admin());

create policy renter_profiles_update
  on public.renter_profiles for update to authenticated
  using (user_id = auth.uid() or public.is_platform_admin())
  with check (user_id = auth.uid() or public.is_platform_admin());

-- renter_applications
create policy renter_applications_select
  on public.renter_applications for select to authenticated
  using (
    public.is_platform_admin()
    or renter_profile_id = public.current_renter_profile_id()
  );

create policy renter_applications_insert
  on public.renter_applications for insert to authenticated
  with check (
    public.is_platform_admin()
    or renter_profile_id = public.current_renter_profile_id()
  );

create policy renter_applications_update
  on public.renter_applications for update to authenticated
  using (
    public.is_platform_admin()
    or renter_profile_id = public.current_renter_profile_id()
  )
  with check (
    public.is_platform_admin()
    or renter_profile_id = public.current_renter_profile_id()
  );

-- driver_documents
create policy driver_documents_select
  on public.driver_documents for select to authenticated
  using (
    public.is_platform_admin()
    or renter_profile_id = public.current_renter_profile_id()
  );

create policy driver_documents_insert
  on public.driver_documents for insert to authenticated
  with check (
    public.is_platform_admin()
    or renter_profile_id = public.current_renter_profile_id()
  );

create policy driver_documents_update
  on public.driver_documents for update to authenticated
  using (
    public.is_platform_admin()
    or renter_profile_id = public.current_renter_profile_id()
  )
  with check (
    public.is_platform_admin()
    or renter_profile_id = public.current_renter_profile_id()
  );

-- gig_platforms (public read of active)
create policy gig_platforms_select
  on public.gig_platforms for select to anon, authenticated
  using (deleted_at is null and (is_active or public.is_platform_admin()));

create policy gig_platforms_admin_write
  on public.gig_platforms for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- gig_platform_profiles
create policy gig_platform_profiles_select
  on public.gig_platform_profiles for select to authenticated
  using (
    public.is_platform_admin()
    or renter_profile_id = public.current_renter_profile_id()
  );

create policy gig_platform_profiles_write
  on public.gig_platform_profiles for all to authenticated
  using (
    public.is_platform_admin()
    or renter_profile_id = public.current_renter_profile_id()
  )
  with check (
    public.is_platform_admin()
    or renter_profile_id = public.current_renter_profile_id()
  );

-- eligibility_rules
create policy eligibility_rules_select
  on public.eligibility_rules for select to authenticated
  using (
    public.is_platform_admin()
    or organization_id is null
    or organization_id in (select public.user_org_ids())
  );

create policy eligibility_rules_write
  on public.eligibility_rules for all to authenticated
  using (
    public.is_platform_admin()
    or (
      organization_id is not null
      and public.has_org_role(
        organization_id,
        array['partner_owner', 'partner_manager']::public.partner_role[]
      )
    )
  )
  with check (
    public.is_platform_admin()
    or (
      organization_id is not null
      and public.has_org_role(
        organization_id,
        array['partner_owner', 'partner_manager']::public.partner_role[]
      )
    )
  );

-- vehicles: org members + admins; public catalog rows for anon/authenticated
create policy vehicles_select
  on public.vehicles for select to anon, authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
    or (
      approval_status = 'approved'
      and status = 'available'
      and deleted_at is null
    )
  );

create policy vehicles_insert
  on public.vehicles for insert to authenticated
  with check (
    public.is_platform_admin()
    or public.has_org_role(
      organization_id,
      array['partner_owner', 'partner_manager', 'partner_staff']::public.partner_role[]
    )
  );

create policy vehicles_update
  on public.vehicles for update to authenticated
  using (
    public.is_platform_admin()
    or public.has_org_role(
      organization_id,
      array['partner_owner', 'partner_manager', 'partner_staff']::public.partner_role[]
    )
  )
  with check (
    public.is_platform_admin()
    or public.has_org_role(
      organization_id,
      array['partner_owner', 'partner_manager', 'partner_staff']::public.partner_role[]
    )
  );

-- Limit anon column exposure on vehicles (catalog fields only)
revoke all on table public.vehicles from anon;
grant select (
  id,
  organization_id,
  make,
  model,
  year,
  color,
  category,
  weekly_rate_cents,
  multi_week_pricing,
  deposit_cents,
  mileage_allowance,
  excess_mileage_fee_cents,
  min_weeks,
  status,
  location,
  features,
  created_at,
  approval_status,
  deleted_at
) on table public.vehicles to anon;

grant select on public.vehicle_catalog to anon, authenticated;

-- Generic org-scoped helper policies for partner-owned tables
-- vehicle_images
create policy vehicle_images_select
  on public.vehicle_images for select to anon, authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
    or exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id
        and v.approval_status = 'approved'
        and v.status = 'available'
        and v.deleted_at is null
    )
  );

create policy vehicle_images_write
  on public.vehicle_images for all to authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
  )
  with check (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
  );

-- vehicle_approvals
create policy vehicle_approvals_select
  on public.vehicle_approvals for select to authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
  );

create policy vehicle_approvals_write
  on public.vehicle_approvals for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- vehicle_availability
create policy vehicle_availability_select
  on public.vehicle_availability for select to anon, authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
    or exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id
        and v.approval_status = 'approved'
        and v.status = 'available'
        and v.deleted_at is null
    )
  );

create policy vehicle_availability_write
  on public.vehicle_availability for all to authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
  )
  with check (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
  );

-- vehicle_platform_eligibility
create policy vehicle_platform_eligibility_select
  on public.vehicle_platform_eligibility for select to anon, authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
    or exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id
        and v.approval_status = 'approved'
        and v.status = 'available'
        and v.deleted_at is null
    )
  );

create policy vehicle_platform_eligibility_write
  on public.vehicle_platform_eligibility for all to authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
  )
  with check (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
  );

-- reservations
create policy reservations_select
  on public.reservations for select to authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
    or renter_id = public.current_renter_profile_id()
  );

create policy reservations_insert
  on public.reservations for insert to authenticated
  with check (
    public.is_platform_admin()
    or renter_id = public.current_renter_profile_id()
    or organization_id in (select public.user_org_ids())
  );

create policy reservations_update
  on public.reservations for update to authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
    or renter_id = public.current_renter_profile_id()
  )
  with check (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
    or renter_id = public.current_renter_profile_id()
  );

-- Macro: org-member select + admin/member write for remaining org tables
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'rental_periods',
    'rental_renewals',
    'vehicle_swaps',
    'fee_calculations',
    'payments',
    'security_deposits',
    'refunds',
    'chargebacks',
    'partner_balances',
    'payouts',
    'payout_statements',
    'maintenance_records',
    'inspections',
    'damage_reports',
    'accident_reports',
    'rental_agreements',
    'electronic_signatures'
  ]
  loop
    execute format(
      'create policy %I_select on public.%I for select to authenticated
       using (public.is_platform_admin() or organization_id in (select public.user_org_ids()))',
      tbl, tbl
    );
    execute format(
      'create policy %I_write on public.%I for all to authenticated
       using (public.is_platform_admin() or organization_id in (select public.user_org_ids()))
       with check (public.is_platform_admin() or organization_id in (select public.user_org_ids()))',
      tbl, tbl
    );
  end loop;
end;
$$;

-- pricing_rules / fee_agreements (platform-wide rows allowed)
create policy pricing_rules_select
  on public.pricing_rules for select to authenticated
  using (
    public.is_platform_admin()
    or organization_id is null
    or organization_id in (select public.user_org_ids())
  );

create policy pricing_rules_write
  on public.pricing_rules for all to authenticated
  using (
    public.is_platform_admin()
    or (
      organization_id is not null
      and organization_id in (select public.user_org_ids())
    )
  )
  with check (
    public.is_platform_admin()
    or (
      organization_id is not null
      and organization_id in (select public.user_org_ids())
    )
  );

create policy fee_agreements_select
  on public.fee_agreements for select to authenticated
  using (
    public.is_platform_admin()
    or organization_id is null
    or organization_id in (select public.user_org_ids())
  );

create policy fee_agreements_write
  on public.fee_agreements for all to authenticated
  using (
    public.is_platform_admin()
    or (
      organization_id is not null
      and organization_id in (select public.user_org_ids())
    )
  )
  with check (
    public.is_platform_admin()
    or (
      organization_id is not null
      and organization_id in (select public.user_org_ids())
    )
  );

-- Renter can also see own payments / deposits / related rental rows
create policy payments_renter_select
  on public.payments for select to authenticated
  using (renter_id = public.current_renter_profile_id());

create policy security_deposits_renter_select
  on public.security_deposits for select to authenticated
  using (renter_id = public.current_renter_profile_id());

create policy rental_periods_renter_select
  on public.rental_periods for select to authenticated
  using (
    exists (
      select 1
      from public.reservations r
      where r.id = reservation_id
        and r.renter_id = public.current_renter_profile_id()
    )
  );

create policy rental_agreements_renter_select
  on public.rental_agreements for select to authenticated
  using (
    exists (
      select 1
      from public.reservations r
      where r.id = reservation_id
        and r.renter_id = public.current_renter_profile_id()
    )
  );

create policy rental_renewals_renter_select
  on public.rental_renewals for select to authenticated
  using (
    exists (
      select 1
      from public.reservations r
      where r.id = reservation_id
        and r.renter_id = public.current_renter_profile_id()
    )
  );

-- ledger_entries: SELECT for org/admin only; NO insert/update/delete for authenticated
-- (service_role bypasses RLS for append-only system writes)
create policy ledger_entries_select
  on public.ledger_entries for select to authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
  );

-- audit_logs: select admin/org; insert for authenticated actors; no update/delete
create policy audit_logs_select
  on public.audit_logs for select to authenticated
  using (
    public.is_platform_admin()
    or organization_id in (select public.user_org_ids())
    or actor_id = auth.uid()
  );

create policy audit_logs_insert
  on public.audit_logs for insert to authenticated
  with check (
    actor_id = auth.uid()
    or public.is_platform_admin()
  );

-- notifications
create policy notifications_select
  on public.notifications for select to authenticated
  using (user_id = auth.uid() or public.is_platform_admin());

create policy notifications_update
  on public.notifications for update to authenticated
  using (user_id = auth.uid() or public.is_platform_admin())
  with check (user_id = auth.uid() or public.is_platform_admin());

create policy notifications_insert
  on public.notifications for insert to authenticated
  with check (public.is_platform_admin() or user_id = auth.uid());

-- support_tickets
create policy support_tickets_select
  on public.support_tickets for select to authenticated
  using (
    public.is_platform_admin()
    or opened_by = auth.uid()
    or assigned_to = auth.uid()
    or (
      organization_id is not null
      and organization_id in (select public.user_org_ids())
    )
  );

create policy support_tickets_insert
  on public.support_tickets for insert to authenticated
  with check (opened_by = auth.uid() or public.is_platform_admin());

create policy support_tickets_update
  on public.support_tickets for update to authenticated
  using (
    public.is_platform_admin()
    or opened_by = auth.uid()
    or assigned_to = auth.uid()
  )
  with check (
    public.is_platform_admin()
    or opened_by = auth.uid()
    or assigned_to = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- Seed reference permissions (system catalog)
-- ---------------------------------------------------------------------------
insert into public.permissions (key, description) values
  ('vehicles.read', 'View vehicles'),
  ('vehicles.write', 'Create/update vehicles'),
  ('reservations.read', 'View reservations'),
  ('reservations.write', 'Manage reservations'),
  ('payouts.read', 'View payouts and balances'),
  ('payouts.write', 'Request or manage payouts'),
  ('team.read', 'View organization members'),
  ('team.write', 'Invite/manage organization members'),
  ('finance.read', 'View ledger and fee calculations'),
  ('finance.write', 'Adjust fees and financial settings'),
  ('maintenance.read', 'View maintenance and inspections'),
  ('maintenance.write', 'Record maintenance and inspections'),
  ('applications.review', 'Review partner/renter applications'),
  ('support.manage', 'Manage support tickets');

insert into public.role_permissions (role_domain, role_key, permission_id)
select 'partner', 'partner_owner', p.id from public.permissions p;

insert into public.role_permissions (role_domain, role_key, permission_id)
select 'partner', 'partner_manager', p.id
from public.permissions p
where p.key not in ('payouts.write');

insert into public.role_permissions (role_domain, role_key, permission_id)
select 'partner', 'partner_staff', p.id
from public.permissions p
where p.key in (
  'vehicles.read', 'vehicles.write',
  'reservations.read', 'reservations.write',
  'maintenance.read', 'maintenance.write',
  'team.read'
);

insert into public.role_permissions (role_domain, role_key, permission_id)
select 'partner', 'partner_accountant', p.id
from public.permissions p
where p.key in (
  'vehicles.read', 'reservations.read',
  'payouts.read', 'finance.read', 'finance.write', 'team.read'
);

insert into public.role_permissions (role_domain, role_key, permission_id)
select 'partner', 'partner_read_only', p.id
from public.permissions p
where p.key like '%.read';

insert into public.role_permissions (role_domain, role_key, permission_id)
select 'platform', role_key, p.id
from public.permissions p
cross join (
  values
    ('super_admin'),
    ('permanence_admin'),
    ('operations_manager'),
    ('finance_manager'),
    ('rental_agent'),
    ('maintenance_coordinator'),
    ('support_agent')
) as roles(role_key)
where
  roles.role_key in ('super_admin', 'permanence_admin')
  or (
    roles.role_key = 'finance_manager'
    and p.key in ('finance.read', 'finance.write', 'payouts.read', 'payouts.write', 'reservations.read', 'vehicles.read')
  )
  or (
    roles.role_key = 'operations_manager'
    and p.key not in ('payouts.write')
  )
  or (
    roles.role_key = 'rental_agent'
    and p.key in ('vehicles.read', 'reservations.read', 'reservations.write', 'applications.review', 'support.manage')
  )
  or (
    roles.role_key = 'maintenance_coordinator'
    and p.key in ('vehicles.read', 'maintenance.read', 'maintenance.write', 'reservations.read')
  )
  or (
    roles.role_key = 'support_agent'
    and p.key in ('support.manage', 'reservations.read', 'vehicles.read', 'team.read')
  );

-- Default platform fee agreement
insert into public.fee_agreements (name, is_active, schedule, effective_from)
values (
  'Platform default hybrid management fee',
  true,
  '{
    "type": "hybrid",
    "percent_bps": 1500,
    "flat_cents_per_week": 2500,
    "processing_fee_bps": 290,
    "notes": "Default until org/vehicle override"
  }'::jsonb,
  current_date
);

-- ---------------------------------------------------------------------------
-- Grants (authenticated / anon baselines; service_role bypasses RLS)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant usage on schema private to postgres, service_role;

grant select, insert, update on all tables in schema public to authenticated;
revoke insert, update, delete on table public.vehicle_catalog from authenticated;
grant select on public.vehicle_catalog to anon, authenticated;
grant select on public.gig_platforms to anon;
grant select on public.vehicle_images to anon;
grant select on public.vehicle_availability to anon;
grant select on public.vehicle_platform_eligibility to anon;

-- Re-assert anon column limits after broad grants
revoke all on table public.vehicles from anon;
grant select (
  id,
  organization_id,
  make,
  model,
  year,
  color,
  category,
  weekly_rate_cents,
  multi_week_pricing,
  deposit_cents,
  mileage_allowance,
  excess_mileage_fee_cents,
  min_weeks,
  status,
  location,
  features,
  created_at,
  approval_status,
  deleted_at
) on table public.vehicles to anon;

-- Ledger & audit: authenticated may select (via RLS) but not mutate ledger;
-- audit insert allowed via policy only.
revoke insert, update, delete on table public.ledger_entries from authenticated;
revoke update, delete on table public.audit_logs from authenticated;

grant usage, select on all sequences in schema public to authenticated;
