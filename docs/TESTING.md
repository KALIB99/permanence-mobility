# Testing

## Strategy

| Layer | What | How |
|---|---|---|
| Unit | Domain booking math, authz maps, money helpers, notifications adapters | `npm test` |
| Static | Types + lint | `npm run typecheck`, `npm run lint` |
| API | Zod validation on route handlers | Manual / curl against `/api/*` |
| Manual QA | Portals + marketing flows | Checklist below |
| Payments | Stripe **test mode** | Dashboard + webhook forwarding |

Definition of done per phase: typecheck, lint, unit tests, and `npm run build` green ([IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)).

## Unit tests

```bash
npm test
```

Runs (Node test runner + `tsx`):

| File | Focus |
|---|---|
| `tests/domain.test.ts` | Weekly periods, overlap rules, start dates, waiting-list matching, password helpers |
| `tests/authz.test.ts` | Platform/partner `can` / `partnerCan`, role permission maps, domain pricing helpers, notification delivery without Resend |
| `tests/rendered-html.test.mjs` | Marketing/HTML smoke assertions |

Core libraries under test:

- `lib/domain.ts` — weeks, holds (`HOLD_MINUTES = 20`), period building, totals
- `lib/authz.ts` + `lib/roles.ts` — server-side RBAC
- `lib/money.ts` — cents / basis points
- `lib/notifications.ts` — Resend / Twilio-ready adapters

Add new domain/authz cases next to these files rather than embedding logic in UI tests.

## API validation

Current handlers validate JSON with Zod (`lib/validators.ts`) and return `400` on failure:

| Route | Schema |
|---|---|
| `POST /api/contact` | `contactSchema` |
| `POST /api/renter-applications` | `renterApplicationSchema` |
| `POST /api/partner-applications` | `partnerApplicationSchema` |
| `GET /api/health` | Liveness |

Example:

```bash
curl -s -X POST http://localhost:3000/api/contact \
  -H 'content-type: application/json' \
  -d '{"name":"A","email":"bad","subject":"Hi","message":"short"}'
# expect 400 + issues
```

When persistence and booking APIs land, extend tests to assert:

- Unauthorized → `401` / redirect
- Cross-tenant IDs → `403` / empty (app authz **and** RLS)
- Overlapping holds/reservations rejected
- Hold expiry frees the vehicle

## Manual QA — portals

### Public

- [ ] Home and key marketing pages render brand (black/gold) and primary CTA
- [ ] `/vehicles` lists seeded vehicles when DB is connected
- [ ] `/vehicles/[id]` shows rates/eligibility
- [ ] `/apply` and `/partners/apply` submit with client + server validation
- [ ] `/contact` submits successfully
- [ ] Legal pages (`/terms`, `/privacy`, `/cancellation`) load

### Auth

- [ ] `/signup` creates a Supabase user
- [ ] `/login` establishes a session cookie
- [ ] Unauthenticated visit to `/admin`, `/partners/portal`, `/renter` redirects to `/login?next=…`

### Admin (`/admin`)

- [ ] Non-staff authenticated user does not see staff capabilities
- [ ] User with `profiles.platform_role` sees admin shell / role indicator
- [ ] (When built) approve partners, vehicles, renters; audit-sensitive actions logged

### Partner (`/partners/portal`)

- [ ] Member of Horizon org sees only that org’s fleet context
- [ ] Non-member cannot access another org’s data via URL/ID guessing
- [ ] (When built) vehicle CRUD blocked until org + vehicle `approved`

### Renter (`/renter`)

- [ ] Approved renter (`alex.renter@…` when seeded) reaches portal
- [ ] Applicant sees limited state
- [ ] (When built) hold → confirm → weekly periods; second overlapping booking fails

## Stripe test mode

Until Phase 4 is complete, treat this as the target checklist:

1. Use `sk_test_…` / `pk_test_…` only.
2. `stripe listen --forward-to localhost:3000/api/stripe/webhook` (or Dashboard test endpoint on Preview).
3. Exercise Connect onboarding for a partner org → `stripe_connect_accounts` / related columns populated.
4. Create a test PaymentIntent / subscription for a reservation; confirm `payments` + append-only `ledger_entries`.
5. Simulate dispute/refund webhooks; ensure handlers are idempotent and signature-verified.
6. Confirm no live card data is stored—Stripe IDs only.

## Related

- [ASSUMPTIONS.md](ASSUMPTIONS.md) — booking and fee rules
- [SECURITY.md](SECURITY.md) — isolation expectations during QA
