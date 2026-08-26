# Business-rule assumptions

1. **Rental unit is a week** (exactly 7 days). Day-level rentals are out of scope for v1.
2. **Weekly start dates** default to any calendar day the vehicle is available; UI may prefer Mondays but the engine is date-agnostic as long as periods are 7-day multiples.
3. **One active reservation per vehicle** at a time (confirmed or held). Overlaps are rejected at the database transaction layer.
4. **Checkout holds** last 20 minutes; expired holds free the vehicle automatically on next request or via cron-equivalent cleanup.
5. **Fleet Partners cannot publish** vehicles until both the organization and the vehicle are `approved`.
6. **Permanence-owned fleet** is modeled as a special organization (`type = permanence_owned`) so the same schema and portals apply.
7. **Management fees** default to a platform-wide hybrid schedule; orgs/vehicles may override via `fee_agreements`.
8. **Security deposits** are authorized (hold) on confirmation and captured only for eligible deductions.
9. **Currency** is USD cents for v1; multi-currency can extend `ledger_entries.currency`.
10. **Gig platforms** (Uber, DoorDash, etc.) are data-driven rows — never hard-coded eligibility in application logic.
11. **Identity verification** is document-upload + admin review in v1 (Stripe Identity / Persona can plug in later).
12. **SMS** uses a provider interface; Twilio credentials optional until configured.
13. **GPS on inspections** is optional and only stored when the client consents and the org setting allows it.
14. **Soft delete** via `deleted_at` for tenant records; financial ledger entries are never deleted.
15. **Sample accounts** use fixed emails for local/demo; production seeds are disabled unless `ALLOW_SEED=true`.
