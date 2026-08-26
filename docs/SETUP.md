# Local setup

## Prerequisites

- Node.js **≥ 20.19**
- npm (lockfile is `package-lock.json`)
- A [Supabase](https://supabase.com) project (hosted or local CLI)
- Optional: [Supabase CLI](https://supabase.com/docs/guides/cli) for `supabase db push`
- Optional: Stripe / Resend / Twilio accounts for payments and notifications

## 1. Clone and install

```bash
git clone <repo-url> permanence-mobility
cd permanence-mobility
npm install
```

## 2. Environment

```bash
cp .env.example .env.local
```

Fill at least:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; never expose to the browser |
| `DATABASE_URL` | Postgres connection string (Drizzle / direct SQL) |
| `ALLOW_SEED` | `true` for local/demo seeding only |
| `BOOTSTRAP_SUPER_ADMIN_EMAIL` | Email used to promote the first platform admin |

Stripe, Resend, and Twilio keys can stay empty until you exercise those adapters. Without them, notification adapters no-op / record intent; payment flows remain unavailable.

## 3. Create the Supabase project

In the Supabase dashboard (or `supabase start` locally):

1. Create a project and copy URL + keys into `.env.local`.
2. Confirm Auth email signup is enabled (local `supabase/config.toml` disables email confirmations for convenience).
3. Set Auth site URL / redirect URLs to `http://localhost:3000` (and `http://localhost:3000/**`).

## 4. Run migrations

Canonical schema + RLS live in:

`supabase/migrations/20250821000000_init.sql`

**Option A — CLI (preferred):**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B — SQL Editor:** paste and run the full contents of `20250821000000_init.sql` in the Supabase SQL Editor.

Drizzle (`db/schema.ts`, `npm run db:generate`) mirrors types for the app; **do not** treat Drizzle generate as a substitute for the Supabase SQL migration in Phase 1.

## 5. Seed demo data

```bash
# CLI (uses supabase/config.toml [db.seed])
supabase db reset   # local only — applies migrations + seed.sql

# Or paste supabase/seed.sql into the SQL Editor on a linked project
```

`seed.sql` inserts organizations, gig platforms, eligibility/pricing/fees, sample vehicles, availability, and zeroed partner balances. It does **not** insert `auth.users`, `profiles`, memberships, or renter profiles.

Production: keep `ALLOW_SEED` unset/false unless you intentionally seed a non-prod environment.

## 6. Auth users matching seed UUIDs

Profiles and memberships require real `auth.users` rows. Create users (Dashboard → Authentication → Users, or Admin API with the service role), then align IDs to the placeholders in `supabase/seed.sql`:

| Role | Auth user UUID | Email (sample) |
|---|---|---|
| Platform admin | `90000000-0000-4000-8000-000000000001` | `admin@permanence.mobility` |
| Partner owner | `90000000-0000-4000-8000-000000000002` | `owner@horizonfleet.example` |
| Renter A (approved) | `90000000-0000-4000-8000-000000000003` | `alex.renter@example.com` |
| Renter B (applicant) | `90000000-0000-4000-8000-000000000004` | `jordan.renter@example.com` |

**Notes:**

- Supabase Admin `auth.admin.createUser` can set a fixed `id` so UUIDs match the seed comments.
- After users exist, insert `profiles` / `organization_memberships` / `renter_profiles` using the example SQL at the bottom of `seed.sql`.
- Set `profiles.platform_role = 'super_admin'` for the admin user (never put roles in `user_metadata`).
- Orgs from seed: Permanence `a0000000-0000-4000-8000-000000000001`, Horizon partner `a0000000-0000-4000-8000-000000000002`.

Alternatively, sign up via `/signup` with `BOOTSTRAP_SUPER_ADMIN_EMAIL` matching that account, then grant memberships manually—fixed UUIDs are only required if you want seed-linked predictability.

## 7. Run the app

```bash
npm run dev
```

Sanity checks:

- `GET /api/health`
- Marketing pages at `/`
- `/login` → protected `/admin`, `/partners/portal`, `/renter`

## Related

- [ARCHITECTURE.md](ARCHITECTURE.md) — tenancy and stack
- [DEPLOYMENT.md](DEPLOYMENT.md) — production
- [SECURITY.md](SECURITY.md) — RLS and service role
