# Implementation plan

## Phase 1 — Foundation (current)
- Brand system (black/gold), logo mark, public marketing site (15 pages)
- Supabase PostgreSQL schema + RLS + Drizzle types
- Auth (email/password), profiles, org memberships, RBAC helpers
- Sample Permanence org + partner org scaffolding
- Tests for domain + authz; lint/typecheck/build green

## Phase 2 — Fleet Partners
- Partner application wizard + document uploads
- Partner portal (portfolio, vehicles, team invites)
- Vehicle CRUD, images, availability, approval workflow

## Phase 3 — Renters & booking
- Renter application + document requirements
- Vehicle search / eligibility filtering
- Weekly booking engine, holds, renewals, swaps (domain + APIs)

## Phase 4 — Money
- Stripe Connect (test mode): renter charges, fees, balances, payouts
- Ledger + statements + webhook verification

## Phase 5 — Ops & polish
- Inspections, maintenance, incidents
- Reporting dashboards
- README, setup, deployment, testing docs finalization

## Definition of done per phase
Typecheck, lint, unit tests, and production build must pass before the phase is marked complete.
