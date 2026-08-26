# Deployment

Target: **Vercel** (Next.js) + **Supabase** (Auth, Postgres, Storage) + **Stripe Connect** (test → live).

## Vercel

1. Import the Git repository into Vercel.
2. Framework preset: Next.js. Build: `npm run build`. Output: default.
3. Set **Node.js ≥ 20.19** (matches `package.json` `engines`).
4. Configure environment variables (Production + Preview as needed) from `.env.example`.
5. Set `NEXT_PUBLIC_SITE_URL` to the production URL (e.g. `https://your-domain.com`).
6. Deploy. Confirm `GET /api/health` returns OK.

Do **not** enable `ALLOW_SEED=true` in production.

## Environment variables

| Variable | Required in prod | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser-safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only; Vercel secret |
| `DATABASE_URL` | Yes | Prefer pooled URL if provided by Supabase |
| `STRIPE_SECRET_KEY` | When payments live | Use `sk_live_…` only after test sign-off |
| `STRIPE_WEBHOOK_SECRET` | When webhooks live | From Stripe Dashboard endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | When payments live | |
| `STRIPE_CONNECT_CLIENT_ID` | When Connect onboarding live | |
| `RESEND_API_KEY` | When email live | |
| `NOTIFICATION_FROM_EMAIL` | When email live | Verified domain sender |
| `TWILIO_*` | Optional | SMS adapter stays dormant until set |
| `BOOTSTRAP_SUPER_ADMIN_EMAIL` | Optional | First admin bootstrap only |
| `ALLOW_SEED` | No | Leave unset/false |

Never commit `.env.local` or service-role / Stripe secret keys.

## Stripe webhook

When the Stripe webhook route is enabled (expected path: `/api/stripe/webhook`):

1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://<your-domain>/api/stripe/webhook`
3. Select Connect- and billing-relevant events (payment intents, invoices, account updates, payouts, disputes—as implemented).
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Verify signature with the raw request body (no JSON re-parse before verification).

Local forwarding (optional):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use **test mode** keys until the Phase 4 money checklist in [TESTING.md](TESTING.md) passes.

## Supabase production checklist

- [ ] Migrations applied (`supabase db push` or verified SQL Editor run of `20250821000000_init.sql`)
- [ ] Seed **not** applied (or applied only to a staging project)
- [ ] Auth site URL + redirect URLs match production domain(s)
- [ ] Email confirmations / SMTP configured as required for launch
- [ ] Storage buckets for documents/images created with signed-URL access only (no public PII buckets)
- [ ] Database password rotated from initial dashboard password if shared
- [ ] Service role key stored only in Vercel (and CI secrets if needed)—never in client bundles
- [ ] At least one `profiles.platform_role` admin exists
- [ ] RLS enabled on all public tenant tables (see verification below)

## RLS verification

After migrate:

1. Confirm RLS is on for tenant tables (profiles, organizations, memberships, vehicles, reservations, payments, ledger, etc.).
2. As an **anon** or unrelated authenticated user, attempt to `select` another org’s vehicles/reservations—should return empty / deny.
3. As a **partner member**, confirm access is limited to `organization_id` memberships via `private.user_org_ids()` / `is_org_member`.
4. As a **renter**, confirm reservation/document access is scoped to `current_renter_profile_id()`.
5. Confirm `ledger_entries` are not updatable/deletable by authenticated roles (service role / privileged paths only for appends).
6. Spot-check that the Next.js app uses the anon key + user session for browser/server user paths, and `createAdminClient()` (`lib/supabase/admin.ts`) only on the server for webhooks/seeds/cross-tenant jobs.

Helpers defined in the migration: `is_platform_admin()`, `user_org_ids()`, `has_org_role()`, `is_org_member()`, `current_renter_profile_id()`.

## Post-deploy smoke

- Marketing home loads with brand assets (`/public/og.png`, logos)
- `/login` / `/signup` work against production Auth
- `/admin`, `/partners/portal`, `/renter` redirect unauthenticated users to `/login`
- Application POSTs validate (`/api/contact`, `/api/renter-applications`, `/api/partner-applications`)
- Stripe test webhook delivery succeeds when money phase is enabled

## Related

- [SETUP.md](SETUP.md) — local parity
- [SECURITY.md](SECURITY.md) — isolation rules
- [TESTING.md](TESTING.md) — QA before go-live
