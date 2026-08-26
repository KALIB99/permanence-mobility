# Security

Permanence Mobility is multi-tenant. Defense in depth: **RLS in Postgres**, **server-side authz** (`lib/authz.ts`), **Zod validation**, and **verified webhooks**.

## Tenant isolation

```
auth.users → profiles → organization_memberships → organizations
                                          ↓
                         vehicles, reservations, documents, balances, …
```

Rules:

- Partner-owned rows carry `organization_id`.
- Access resolves `auth.uid()` → active memberships → org IDs (`private.user_org_ids()` / `is_org_member()`).
- Platform staff use `profiles.platform_role` (e.g. `super_admin`)—**never** JWT `user_metadata` for authorization.
- Renters are scoped via `renter_profiles` / `current_renter_profile_id()`.
- Soft delete via `deleted_at` where applicable; **ledger entries are never deleted**.

Org types include `permanence_owned`, `fleet_partner`, `corporate_fleet`, `suspended`, `terminated`. Suspended/terminated orgs must not gain write access through app checks even if historical memberships exist.

## Row-level security (RLS)

- Enabled on all public tenant tables in `supabase/migrations/20250821000000_init.sql`.
- Policies use security-definer helpers with a fixed `search_path` (`is_platform_admin`, `has_org_role`, etc.).
- Public catalog exposure is limited (e.g. `vehicle_catalog` view with `security_invoker`).
- Authenticated clients may read ledger rows allowed by policy but must not mutate them; appends are system/service paths.

Always assume the client can call PostgREST with the anon key + a stolen user JWT: **RLS is the last line of defense**.

## Service role rules

`createAdminClient()` in `lib/supabase/admin.ts` uses `SUPABASE_SERVICE_ROLE_KEY` and **bypasses RLS**.

Allowed uses:

- Stripe (and similar) webhooks
- Seed / bootstrap jobs when `ALLOW_SEED` is explicitly enabled
- Privileged cross-tenant admin operations that cannot run as the user

Forbidden:

- Importing the admin client into Client Components or shared browser code
- Exposing the key via `NEXT_PUBLIC_*`
- Using service role for ordinary user reads/writes “for convenience”

Prefer the user-scoped server client (`lib/supabase/server.ts`) so RLS applies.

## Webhook verification

- Stripe (and any future signed webhooks) must verify signatures with the provider secret (`STRIPE_WEBHOOK_SECRET`) against the **raw** body.
- Reject missing/invalid signatures with `4xx`—do not process the event.
- Handlers should be **idempotent** (replay-safe) and write via controlled server paths (often service role) after verification.
- Never trust client-supplied payment status; trust Stripe events + server-side retrieval.

## IDOR prevention

Insecure Direct Object Reference risks appear when handlers accept `organization_id`, `vehicle_id`, `reservation_id`, or document IDs from the client.

Prevent by:

1. Authenticating the session (`getUser()` / middleware for portal routes).
2. Authorizing with `can` / `partnerCan` / membership checks in `lib/authz.ts` **before** mutation.
3. Scoping queries to the caller’s org or renter profile—not “fetch by id, then hope UI hid the link.”
4. Relying on RLS so a missed app check still returns no row / deny.
5. Using signed Storage URLs for documents; do not serve private `storage_path` objects publicly.
6. Validating all inputs with Zod (`lib/validators.ts`)—types and enums, not just presence.

Middleware protects `/admin`, `/partners/portal`, and `/renter` (login redirect) but is **not** a substitute for per-resource authorization.

## Additional controls

- No raw card data stored—Stripe identifiers only.
- Audit log for privileged actions (schema: `audit_logs`).
- Passwords via Supabase Auth (legacy helpers in `lib/security.ts` are for isolated unit tests / legacy PIN patterns, not a parallel auth system).
- Notifications: Resend/Twilio credentials server-side only.

## Related

- [ARCHITECTURE.md](ARCHITECTURE.md) — threat model summary
- [DEPLOYMENT.md](DEPLOYMENT.md) — production RLS checklist
- [SETUP.md](SETUP.md) — local secrets handling
