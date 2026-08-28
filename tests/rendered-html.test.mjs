import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("home page brands Permanence and links primary CTAs", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);
  assert.match(page, /Permanence Mobility/);
  assert.match(page, /Find a Gig Car/);
  assert.match(page, /href="\/vehicles"/);
  assert.match(page, /href="\/partners"/);
  assert.match(layout, /Cormorant_Garamond/);
  assert.match(layout, /DM_Sans/);
  assert.doesNotMatch(`${page}\n${layout}`, /codex-preview|Your site is taking shape/i);
});

test("marketing pages and shared shell exist", async () => {
  const files = await Promise.all(
    [
      "app/vehicles/page.tsx",
      "app/vehicles/[id]/page.tsx",
      "app/apply/page.tsx",
      "app/how-it-works/page.tsx",
      "app/partners/page.tsx",
      "app/partners/apply/page.tsx",
      "app/faq/page.tsx",
      "components/MarketingShell.tsx",
      "components/SiteHeader.tsx",
      "lib/content.ts",
    ].map((path) => readFile(new URL(path, root), "utf8")),
  );
  const source = files.join("\n");
  assert.match(source, /MarketingShell/);
  assert.match(source, /FEATURED_VEHICLES/);
  assert.match(source, /Find a Gig Car/);
  assert.match(source, /renterApplicationSchema|react-hook-form/);
});

test("auth, portals, and health API are present", async () => {
  const files = await Promise.all(
    [
      "app/(auth)/login/page.tsx",
      "app/(auth)/signup/page.tsx",
      "app/admin/page.tsx",
      "app/admin/layout.tsx",
      "app/partners/portal/page.tsx",
      "app/partners/portal/layout.tsx",
      "app/renter/page.tsx",
      "app/renter/layout.tsx",
      "lib/portal-auth.ts",
      "app/api/health/route.ts",
      "app/api/bookings/route.ts",
      "app/api/webhooks/stripe/route.ts",
      "app/book/[id]/page.tsx",
      "lib/booking.ts",
      "lib/stripe.ts",
    ].map((path) => readFile(new URL(path, root), "utf8")),
  );
  const source = files.join("\n");
  assert.match(source, /signInWithPassword|Create account/);
  assert.match(source, /\/admin|\/partners\/portal|\/renter/);
  assert.match(source, /permanence-mobility/);
  assert.match(source, /requireSignedIn|getUser/);
  assert.match(source, /createHoldInput|assertNoOverlap|buildPeriods/);
  assert.match(source, /getStripe|createConnectAccountLink|createWeeklyPaymentIntent/);
  assert.match(source, /STRIPE_WEBHOOK_SECRET|checkout\.session\.completed/);
  assert.match(source, /Partner portal|Admin dashboard|Your weeks/);
});

test("application APIs validate with zod", async () => {
  const [renter, partner, contact, bookings] = await Promise.all([
    readFile(new URL("app/api/renter-applications/route.ts", root), "utf8"),
    readFile(new URL("app/api/partner-applications/route.ts", root), "utf8"),
    readFile(new URL("app/api/contact/route.ts", root), "utf8"),
    readFile(new URL("app/api/bookings/route.ts", root), "utf8"),
  ]);
  assert.match(renter, /renterApplicationSchema/);
  assert.match(partner, /partnerApplicationSchema/);
  assert.match(contact, /contactSchema/);
  assert.match(bookings, /safeCreateHoldInput|createHold/);
});

test("vehicle detail wires booking CTA", async () => {
  const page = await readFile(new URL("app/vehicles/[id]/page.tsx", root), "utf8");
  assert.match(page, /\/book\/\$\{vehicle\.id\}|\/book\//);
});

test("phase 2 portal sibling routes exist", async () => {
  const paths = [
    "app/partners/portal/vehicles/page.tsx",
    "app/partners/portal/vehicles/new/page.tsx",
    "app/partners/portal/reservations/page.tsx",
    "app/partners/portal/earnings/page.tsx",
    "app/partners/portal/team/page.tsx",
    "app/partners/portal/maintenance/page.tsx",
    "app/partners/portal/documents/page.tsx",
    "app/admin/partners/page.tsx",
    "app/admin/vehicles/page.tsx",
    "app/admin/renters/page.tsx",
    "app/admin/reservations/page.tsx",
    "app/admin/fees/page.tsx",
    "app/admin/reports/page.tsx",
    "app/admin/audit/page.tsx",
    "app/renter/application/page.tsx",
    "app/renter/documents/page.tsx",
    "app/renter/rentals/page.tsx",
    "app/renter/payments/page.tsx",
    "app/renter/support/page.tsx",
  ];
  for (const path of paths) {
    const source = await readFile(new URL(path, root), "utf8");
    assert.ok(source.length > 100, `${path} should be non-empty`);
  }
});
