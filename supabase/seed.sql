-- =============================================================================
-- Permanence Mobility — local/demo seed (public schema)
-- Fixed UUIDs for predictable local development.
--
-- NOTE: profiles / organization_memberships / renter_profiles require auth.users.
-- Create those via an app seed script (Supabase Admin API), then link the fixed
-- UUIDs documented in the "Auth-linked placeholders" section below.
-- =============================================================================

-- Fixed IDs
-- permanence org:  a0000000-0000-4000-8000-000000000001
-- partner org:     a0000000-0000-4000-8000-000000000002
-- vehicles:        b0000000-0000-4000-8000-00000000000{1..4}
-- gig platforms:   c0000000-0000-4000-8000-00000000000{1..4}
-- eligibility:     d0000000-0000-4000-8000-000000000001
-- pricing rule:    e0000000-0000-4000-8000-000000000001
-- fee agreement:   e0000000-0000-4000-8000-000000000002
-- images/avail:    f0000000-0000-4000-8000-0000000000xx

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
insert into public.organizations (
  id, name, slug, type, status, settings, legal_name, billing_email, phone, address
) values
(
  'a0000000-0000-4000-8000-000000000001',
  'Permanence Mobility',
  'permanence-mobility',
  'permanence_owned',
  'active',
  '{"brand":"Permanence Mobility","tagline":"Excellence Is Eternal","hold_minutes":20}'::jsonb,
  'Permanence Mobility LLC',
  'fleet@permanence.mobility',
  '+1-555-0100',
  '{"line1":"100 Eternal Ave","city":"Atlanta","state":"GA","postal":"30301","country":"US"}'::jsonb
),
(
  'a0000000-0000-4000-8000-000000000002',
  'Horizon Fleet Partners',
  'horizon-fleet',
  'fleet_partner',
  'active',
  '{"onboarding_complete":true,"default_min_weeks":1}'::jsonb,
  'Horizon Fleet Partners LLC',
  'ops@horizonfleet.example',
  '+1-555-0200',
  '{"line1":"42 Partner Way","city":"Austin","state":"TX","postal":"78701","country":"US"}'::jsonb
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Gig platforms (configurable — not hard-coded in app logic)
-- ---------------------------------------------------------------------------
insert into public.gig_platforms (id, key, name, is_active, metadata) values
(
  'c0000000-0000-4000-8000-000000000001',
  'uber',
  'Uber',
  true,
  '{"category":"rideshare"}'::jsonb
),
(
  'c0000000-0000-4000-8000-000000000002',
  'lyft',
  'Lyft',
  true,
  '{"category":"rideshare"}'::jsonb
),
(
  'c0000000-0000-4000-8000-000000000003',
  'doordash',
  'DoorDash',
  true,
  '{"category":"delivery"}'::jsonb
),
(
  'c0000000-0000-4000-8000-000000000004',
  'uber_eats',
  'Uber Eats',
  true,
  '{"category":"delivery"}'::jsonb
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Eligibility + pricing (platform / partner)
-- ---------------------------------------------------------------------------
insert into public.eligibility_rules (
  id, organization_id, gig_platform_id, name, is_active, rule, priority
) values (
  'd0000000-0000-4000-8000-000000000001',
  null,
  null,
  'Default gig eligibility',
  true,
  '{
    "min_driver_rating": 4.7,
    "min_trips": 100,
    "require_verified_platform_profile": true,
    "allowed_categories": ["sedan","suv","crossover","hybrid","ev"]
  }'::jsonb,
  100
)
on conflict (id) do nothing;

insert into public.pricing_rules (
  id, organization_id, vehicle_id, name, is_active, rule, priority, effective_from
) values (
  'e0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  null,
  'Permanence multi-week discount',
  true,
  '{
    "multi_week": {"2": 0.97, "4": 0.94, "8": 0.90},
    "currency": "usd"
  }'::jsonb,
  50,
  current_date
)
on conflict (id) do nothing;

insert into public.fee_agreements (
  id, organization_id, vehicle_id, name, is_active, schedule, effective_from
) values (
  'e0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000002',
  null,
  'Horizon partner hybrid fee',
  true,
  '{
    "type": "hybrid",
    "percent_bps": 1200,
    "flat_cents_per_week": 2000,
    "processing_fee_bps": 290
  }'::jsonb,
  current_date
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sample vehicles
-- ---------------------------------------------------------------------------
insert into public.vehicles (
  id,
  organization_id,
  make,
  model,
  year,
  vin,
  plate,
  color,
  odometer,
  category,
  weekly_rate_cents,
  multi_week_pricing,
  deposit_cents,
  mileage_allowance,
  excess_mileage_fee_cents,
  min_weeks,
  status,
  registration_expires,
  insurance_expires,
  inspection_expires,
  maintenance_status,
  condition_notes,
  approval_status,
  location,
  features
) values
(
  'b0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'Toyota',
  'Corolla',
  2022,
  'JTDEPRAE0NJ123001',
  'PRM-1001',
  'Silver',
  18420,
  'sedan',
  24900,
  '{"2":24153,"4":23406}'::jsonb,
  50000,
  1500,
  35,
  1,
  'available',
  current_date + 280,
  current_date + 200,
  current_date + 120,
  'ok',
  'Clean interior; minor curb wear on passenger rear.',
  'approved',
  'Atlanta, GA',
  '["bluetooth","backup_camera","usb_c"]'::jsonb
),
(
  'b0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'Hyundai',
  'Kona Electric',
  2023,
  'KM8K3CAAXPU123002',
  'PRM-2002',
  'White',
  9210,
  'ev',
  29900,
  '{"2":29003,"4":28106}'::jsonb,
  60000,
  1200,
  40,
  1,
  'available',
  current_date + 300,
  current_date + 210,
  current_date + 90,
  'ok',
  'Full charge ~258 mi EPA; Level 2 cable included.',
  'approved',
  'Atlanta, GA',
  '["ev","apple_carplay","heated_seats"]'::jsonb
),
(
  'b0000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000002',
  'Honda',
  'CR-V',
  2021,
  '2HKRW2H85MH123003',
  'HRZ-3003',
  'Blue',
  31250,
  'suv',
  27900,
  '{"2":27063,"4":26226}'::jsonb,
  55000,
  1400,
  38,
  1,
  'available',
  current_date + 190,
  current_date + 160,
  current_date + 75,
  'ok',
  'Cargo cover + phone mount installed for delivery work.',
  'approved',
  'Austin, TX',
  '["awd","backup_camera","roof_rails"]'::jsonb
),
(
  'b0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000002',
  'Nissan',
  'Sentra',
  2020,
  '3N1AB8CV5LY123004',
  'HRZ-4004',
  'Black',
  45110,
  'sedan',
  22900,
  '{"2":22213,"4":21526}'::jsonb,
  45000,
  1500,
  35,
  1,
  'available',
  current_date + 150,
  current_date + 140,
  current_date + 60,
  'due_soon',
  'Oil change due within 500 miles.',
  'approved',
  'Austin, TX',
  '["bluetooth","cruise_control"]'::jsonb
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Vehicle images, availability, platform eligibility
-- ---------------------------------------------------------------------------
insert into public.vehicle_images (
  id, organization_id, vehicle_id, storage_path, sort_order, is_primary, alt_text
) values
(
  'f0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  'vehicles/b0000000-0000-4000-8000-000000000001/primary.jpg',
  0,
  true,
  'Toyota Corolla exterior front'
),
(
  'f0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000002',
  'vehicles/b0000000-0000-4000-8000-000000000002/primary.jpg',
  0,
  true,
  'Hyundai Kona Electric exterior'
),
(
  'f0000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000003',
  'vehicles/b0000000-0000-4000-8000-000000000003/primary.jpg',
  0,
  true,
  'Honda CR-V exterior'
),
(
  'f0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000004',
  'vehicles/b0000000-0000-4000-8000-000000000004/primary.jpg',
  0,
  true,
  'Nissan Sentra exterior'
)
on conflict (id) do nothing;

insert into public.vehicle_availability (
  id, organization_id, vehicle_id, starts_on, ends_on, is_available, weekday_flags, notes
) values
(
  'f0000000-0000-4000-8000-000000000011',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  current_date,
  current_date + 365,
  true,
  array[true, true, true, true, true, true, true],
  'Open calendar for next year'
),
(
  'f0000000-0000-4000-8000-000000000012',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000002',
  current_date,
  current_date + 365,
  true,
  array[true, true, true, true, true, true, true],
  null
),
(
  'f0000000-0000-4000-8000-000000000013',
  'a0000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000003',
  current_date,
  current_date + 365,
  true,
  array[true, true, true, true, true, true, true],
  null
),
(
  'f0000000-0000-4000-8000-000000000014',
  'a0000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000004',
  current_date,
  current_date + 365,
  true,
  array[true, true, true, true, true, false, false],
  'Weekday preference for delivery partners'
)
on conflict (id) do nothing;

insert into public.vehicle_platform_eligibility (
  id, organization_id, vehicle_id, gig_platform_id, eligibility_rule_id, is_eligible
) values
-- Corolla: rideshare + delivery
('f0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', true),
('f0000000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', true),
('f0000000-0000-4000-8000-000000000023', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', true),
-- Kona EV: rideshare + Uber Eats
('f0000000-0000-4000-8000-000000000024', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', true),
('f0000000-0000-4000-8000-000000000025', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', true),
-- CR-V: all platforms
('f0000000-0000-4000-8000-000000000026', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', true),
('f0000000-0000-4000-8000-000000000027', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', true),
('f0000000-0000-4000-8000-000000000028', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', true),
('f0000000-0000-4000-8000-000000000029', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', true),
-- Sentra: DoorDash + Uber Eats
('f0000000-0000-4000-8000-00000000002a', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', true),
('f0000000-0000-4000-8000-00000000002b', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Partner balances (zeroed starting point)
-- ---------------------------------------------------------------------------
insert into public.partner_balances (organization_id, available_cents, pending_cents, currency)
values
  ('a0000000-0000-4000-8000-000000000001', 0, 0, 'usd'),
  ('a0000000-0000-4000-8000-000000000002', 0, 0, 'usd')
on conflict (organization_id, currency) do nothing;

-- ---------------------------------------------------------------------------
-- Auth-linked placeholders (for app seed script — DO NOT insert here without auth.users)
-- ---------------------------------------------------------------------------
-- Create auth users first, then profiles / memberships / renter_profiles using these IDs:
--
-- Platform admin user:   90000000-0000-4000-8000-000000000001
--   email: admin@permanence.mobility
--   platform_role: super_admin
--   membership: permanence org / partner_owner (optional)
--
-- Partner owner user:    90000000-0000-4000-8000-000000000002
--   email: owner@horizonfleet.example
--   membership: horizon-fleet / partner_owner
--
-- Sample renter A:       90000000-0000-4000-8000-000000000003
--   email: alex.renter@example.com
--   renter_profile id:   91000000-0000-4000-8000-000000000001
--   status: approved
--   platforms: uber, doordash
--
-- Sample renter B:       90000000-0000-4000-8000-000000000004
--   email: jordan.renter@example.com
--   renter_profile id:   91000000-0000-4000-8000-000000000002
--   status: applicant
--   platforms: lyft, uber_eats
--
-- After auth.users + profiles exist, example follow-up inserts:
--
-- insert into public.profiles (id, email, full_name, platform_role)
-- values ('90000000-0000-4000-8000-000000000001', 'admin@permanence.mobility', 'Permanence Admin', 'super_admin');
--
-- insert into public.organization_memberships (organization_id, user_id, partner_role, status)
-- values ('a0000000-0000-4000-8000-000000000002', '90000000-0000-4000-8000-000000000002', 'partner_owner', 'active');
--
-- insert into public.renter_profiles (id, user_id, status, license_state)
-- values ('91000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000003', 'approved', 'GA');
