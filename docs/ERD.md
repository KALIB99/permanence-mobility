# Entity-Relationship Diagram

```mermaid
erDiagram
  profiles ||--o{ organization_memberships : has
  organizations ||--o{ organization_memberships : includes
  organizations ||--o{ vehicles : owns
  organizations ||--o{ partner_applications : applies
  organizations ||--o{ fee_agreements : priced_by
  organizations ||--o{ partner_balances : balances
  organizations ||--o{ payouts : receives

  profiles ||--o| renter_profiles : is
  renter_profiles ||--o{ renter_applications : submits
  renter_profiles ||--o{ driver_documents : uploads
  renter_profiles ||--o{ gig_platform_profiles : drives_on
  renter_profiles ||--o{ reservations : rents

  vehicles ||--o{ vehicle_images : has
  vehicles ||--o{ vehicle_approvals : reviewed
  vehicles ||--o{ vehicle_availability : calendars
  vehicles ||--o{ reservations : booked
  vehicles ||--o{ maintenance_records : serviced
  vehicles ||--o{ inspections : inspected

  reservations ||--o{ rental_periods : weeks
  reservations ||--o{ payments : charged
  reservations ||--o{ security_deposits : holds
  reservations ||--o{ inspections : pickup_return
  reservations ||--o{ vehicle_swaps : swaps
  reservations ||--o{ rental_agreements : signs

  payments ||--o{ ledger_entries : posts
  payouts ||--o{ ledger_entries : settles
  payouts ||--o{ payout_statements : documents

  gig_platforms ||--o{ vehicle_platform_eligibility : constrains
  eligibility_rules ||--o{ vehicle_platform_eligibility : configures

  profiles ||--o{ audit_logs : acts
  profiles ||--o{ support_tickets : opens
  profiles ||--o{ notifications : receives
```

## Core tables (grouped)

**Identity & tenancy:** `profiles`, `organizations`, `organization_memberships`, `permissions`, `role_permissions`

**Onboarding:** `partner_applications`, `fleet_management_agreements`, `renter_applications`, `driver_documents`, `gig_platform_profiles`, `gig_platforms`, `eligibility_rules`

**Fleet:** `vehicles`, `vehicle_images`, `vehicle_approvals`, `vehicle_availability`, `vehicle_platform_eligibility`

**Rentals:** `reservations`, `rental_periods`, `rental_renewals`, `vehicle_swaps`, `rental_agreements`, `electronic_signatures`

**Money:** `pricing_rules`, `fee_agreements`, `fee_calculations`, `payments`, `security_deposits`, `refunds`, `chargebacks`, `ledger_entries`, `partner_balances`, `payouts`, `payout_statements`

**Ops:** `maintenance_records`, `inspections`, `damage_reports`, `accident_reports`, `notifications`, `support_tickets`, `audit_logs`
