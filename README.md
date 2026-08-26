# Permanence Mobility

Multi-tenant gig-vehicle rental platform. Permanence Mobility operates its own fleet and hosts independent Fleet Partners who list vehicles for weekly rentals to approved gig workers.

**Brand:** Permanence Mobility · *Excellence Is Eternal*

## What it is

- **Public marketing** — fleet story, pricing, requirements, FAQ, apply flows
- **Renters** — applications, vehicle browse, weekly bookings (holds → confirmation)
- **Fleet Partners** — partner apply, portal for fleet/ops (phased)
- **Admin** — Permanence staff tools gated by `profiles.platform_role`
- **Money** — Stripe Connect for renter charges, platform fees, and partner payouts (phased)

Rental unit is an exact **7-day week**. Holds expire after **20 minutes**. Amounts are integer **USD cents**; the ledger is append-only.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 |
| Auth / DB / Storage | Supabase (Auth, PostgreSQL, Storage) |
| ORM | Drizzle ORM + SQL migrations under `supabase/migrations/` |
| Payments | Stripe Connect |
| Email / SMS | Resend + Twilio-ready adapters (`lib/notifications.ts`) |
| Validation | Zod (`lib/validators.ts`) + React Hook Form |

### Why Supabase Postgres (not Turso)

Turso/libSQL is a strong edge-SQLite option, but this product needs:

- **Row-level security (RLS)** for organization-scoped tenant isolation
- PostgreSQL constraints, transactional overlap prevention, and an immutable financial ledger
- First-class **Auth + Storage** alongside the database

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the multi-tenant model and money flow.

## Quick start

Requires **Node.js ≥ 20.19**.

```bash
git clone <repo-url> permanence-mobility
cd permanence-mobility
npm install
cp .env.example .env.local
# Fill Supabase + optional Stripe/Resend/Twilio values — see docs/SETUP.md
```

1. Create a Supabase project and apply `supabase/migrations/20250821000000_init.sql` (`supabase db push` or SQL Editor).
2. Run `supabase/seed.sql` for demo orgs/vehicles (does not create `auth.users`).
3. Create Auth users that match the fixed UUIDs documented in the seed file (see [docs/SETUP.md](docs/SETUP.md)).
4. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests (`tests/domain`, `authz`, `rendered-html`) |
| `npm run db:generate` | Drizzle Kit generate |
| `npm run db:studio` | Drizzle Kit studio |

## App surfaces

| Prefix | Audience |
|---|---|
| `/` | Public marketing |
| `/vehicles`, `/apply` | Renters / applicants |
| `/partners`, `/partners/apply`, `/partners/portal` | Fleet Partners |
| `/renter` | Approved/active renters |
| `/admin` | Permanence staff |
| `/api/*` | Health, contact, applications (+ Stripe webhooks when enabled) |

Protected prefixes (`/admin`, `/partners/portal`, `/renter`) require a Supabase session via `middleware.ts`.

## Documentation

| Doc | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack decisions, tenancy, booking, money |
| [docs/ERD.md](docs/ERD.md) | Entity relationships |
| [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md) | Business rules |
| [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Phased delivery |
| [docs/SETUP.md](docs/SETUP.md) | Local setup |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel + production checklist |
| [docs/TESTING.md](docs/TESTING.md) | Unit, API, manual QA |
| [docs/SECURITY.md](docs/SECURITY.md) | RLS, service role, webhooks, IDOR |
