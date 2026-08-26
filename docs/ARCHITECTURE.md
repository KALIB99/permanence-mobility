# Permanence Mobility — Architecture

## Product

Multi-tenant gig-vehicle rental platform. Permanence Mobility operates its own fleet and hosts independent Fleet Partners who list vehicles for weekly rentals to approved gig workers.

**Brand:** Permanence Mobility · *Excellence Is Eternal*  
**Primary asset:** `/public/og.png` (black + metallic gold)

## Stack decision

| Layer | Choice | Why |
|---|---|---|
| App | Next.js App Router + TypeScript | Vercel-compatible, RSC, server actions |
| UI | Tailwind CSS 4 | Mobile-first, brand tokens |
| Auth / DB / Storage | Supabase (PostgreSQL) | Auth, RLS, signed storage URLs |
| ORM / SQL | Drizzle ORM + SQL migrations | Typed queries + migration control |
| Payments | Stripe Connect | Renter charges, platform fees, partner payouts |
| Email / SMS | Resend + Twilio-ready adapters | Transactional notifications |
| Validation | Zod + React Hook Form | Shared client/server schemas |

### Why not Turso

Turso (libSQL) is excellent for edge SQLite, but this product requires:

- PostgreSQL **row-level security** for org-level tenant isolation
- Rich constraints, exclusion/overlap prevention, and financial ledger integrity
- Supabase Auth + Storage integration as specified

**Database choice: Supabase PostgreSQL** with FAANG-grade schema practices (normalized tenants, immutable ledger entries, audit logs, soft deletes, overlap exclusion via constraints/transactions).

## Multi-tenant model

```
auth.users
    └── profiles (1:1)
            └── organization_memberships (N)
                    └── organizations
                            ├── vehicles, reservations, documents, ...
                            └── stripe_connect_accounts, balances, payouts
```

- Every partner-owned row carries `organization_id`.
- RLS policies resolve membership via `auth.uid()` → memberships → org.
- Platform admins use a `platform_role` on `profiles` (never `user_metadata`).
- Service role is server-only for webhooks, seeds, and cross-tenant admin ops.

### Organization types

`permanence_owned` | `fleet_partner` | `corporate_fleet` | `suspended` | `terminated`

### Role domains

1. **Platform:** super_admin, permanence_admin, operations_manager, finance_manager, rental_agent, maintenance_coordinator, support_agent  
2. **Partner:** partner_owner, partner_manager, partner_staff, partner_accountant, partner_read_only  
3. **Renter lifecycle:** applicant → approved → active (plus suspended/delinquent/terminated)

Authorization is evaluated **server-side** (`lib/authz.ts`) and enforced again by **RLS**.

## Application surfaces

| Route prefix | Audience |
|---|---|
| `/` public marketing | Anonymous |
| `/vehicles`, `/apply` | Renters / applicants |
| `/partners/apply`, `/partners/*` | Fleet Partners |
| `/renter/*` | Approved/active renters |
| `/admin/*` | Permanence staff |
| `/api/*` | Authenticated APIs + Stripe webhooks |

## Weekly rental engine

- Minimum 1 week; multi-week reservations supported.
- Exact 7-day periods stored in `rental_periods`.
- Overlap prevention: transactional insert + exclusion/unique active booking constraints on `(vehicle_id, daterange)`.
- Holds expire (default 20 minutes) before confirmation.
- Recurring weekly billing via Stripe subscription/invoices linked to `payments` + `ledger_entries`.

## Money flow

```
Renter → Stripe → Platform balance
                → management fee (platform)
                → processing fee
                → deductions (maintenance/damage/insurance)
                → net → Fleet Partner Connect payout
```

All amounts are integer **cents**. Ledger is append-only.

## Security

- RLS on every tenant table
- Server-side permission checks before mutations
- Signed document URLs (Supabase Storage)
- Stripe webhook signature verification
- Zod validation on all inputs
- Audit log for privileged actions
- No raw card data stored

## Deployment

- Vercel (Next.js)
- Supabase project (DB, Auth, Storage)
- Env vars via Vercel + local `.env.local` (see `.env.example`)

## Documentation map

- `docs/ERD.md` — entity relationships
- `docs/ASSUMPTIONS.md` — business rules
- `docs/IMPLEMENTATION_PLAN.md` — phased delivery
- `docs/SETUP.md` / `docs/DEPLOYMENT.md` / `docs/TESTING.md` / `docs/SECURITY.md`
