import assert from "node:assert/strict";
import test from "node:test";
import {
  assertNoOverlap,
  buildPeriods,
  calculateEarlyReturnCreditCents,
  calculateLateFeeCents,
  createHoldInput,
  quoteRenewal,
  safeCreateHoldInput,
} from "../lib/booking.ts";
import {
  createConnectAccountLink,
  createWeeklyPaymentIntent,
  getStripe,
  resetStripeClientForTests,
} from "../lib/stripe.ts";

test("createHoldInput validates and computes exclusive endDate", () => {
  const hold = createHoldInput({
    vehicleId: "pm-camry-2022",
    startDate: "2026-08-24",
    weeks: 2,
  });
  assert.equal(hold.startDate, "2026-08-24");
  assert.equal(hold.endDate, "2026-09-07");
  assert.equal(hold.weeks, 2);
});

test("safeCreateHoldInput returns zod issues for bad payloads", () => {
  const bad = safeCreateHoldInput({ vehicleId: "", startDate: "nope", weeks: 0 });
  assert.equal(bad.success, false);
});

test("assertNoOverlap allows adjacent weeks and rejects intersecting holds", () => {
  const existing = [
    { startDate: "2026-08-03", endDate: "2026-08-17", status: "confirmed" },
  ];
  assert.doesNotThrow(() => assertNoOverlap(existing, "2026-08-17", "2026-08-24"));
  assert.throws(() => assertNoOverlap(existing, "2026-08-10", "2026-08-24"));
  assert.doesNotThrow(() =>
    assertNoOverlap(
      [{ startDate: "2026-08-03", endDate: "2026-08-17", status: "cancelled" }],
      "2026-08-10",
      "2026-08-24",
    ),
  );
});

test("buildPeriods returns exact seven-day slices", () => {
  assert.deepEqual(buildPeriods("2026-08-03", 2), [
    { weekIndex: 1, startDate: "2026-08-03", endDate: "2026-08-10" },
    { weekIndex: 2, startDate: "2026-08-10", endDate: "2026-08-17" },
  ]);
});

test("quoteRenewal extends from current end date", () => {
  const quote = quoteRenewal({
    currentEndDate: "2026-08-17",
    additionalWeeks: 2,
    weeklyPriceCents: 34_900,
  });
  assert.equal(quote.newEndDate, "2026-08-31");
  assert.equal(quote.additionalCents, 69_800);
  assert.equal(quote.periods.length, 2);
});

test("calculateLateFeeCents respects grace and cap", () => {
  assert.equal(
    calculateLateFeeCents({
      dueDate: "2026-08-10",
      asOfDate: "2026-08-11",
      dailyFeeCents: 2500,
      graceDays: 1,
    }),
    0,
  );
  assert.equal(
    calculateLateFeeCents({
      dueDate: "2026-08-10",
      asOfDate: "2026-08-14",
      dailyFeeCents: 2500,
      graceDays: 1,
      capCents: 4000,
    }),
    4000,
  );
});

test("early return credits only unused full weeks", () => {
  const midWeek = calculateEarlyReturnCreditCents({
    reservationStartDate: "2026-08-03",
    reservationEndDate: "2026-08-31",
    returnDate: "2026-08-12",
    weeklyPriceCents: 10_000,
  });
  // Returned during week 2 → credit weeks starting 2026-08-17 → two weeks
  assert.equal(midWeek.creditedWeeks, 2);
  assert.equal(midWeek.creditCents, 20_000);
  assert.equal(midWeek.forfeitedPartialWeek, true);

  const onBoundary = calculateEarlyReturnCreditCents({
    reservationStartDate: "2026-08-03",
    reservationEndDate: "2026-08-31",
    returnDate: "2026-08-17",
    weeklyPriceCents: 10_000,
  });
  assert.equal(onBoundary.creditedWeeks, 2);
  assert.equal(onBoundary.forfeitedPartialWeek, false);
});

test("stripe helpers are null-safe without keys", async () => {
  const previous = process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_SECRET_KEY;
  resetStripeClientForTests();

  assert.equal(getStripe(), null);

  const link = await createConnectAccountLink({
    accountId: "acct_test",
    refreshUrl: "http://localhost/refresh",
    returnUrl: "http://localhost/return",
  });
  assert.equal(link.mode, "stub");
  assert.match(link.url, /connect=stub/);

  const intent = await createWeeklyPaymentIntent({ amountCents: 34_900 });
  assert.equal(intent.mode, "stub");
  assert.equal(intent.amount, 34_900);
  assert.match(intent.id, /^pi_stub_/);

  if (previous) process.env.STRIPE_SECRET_KEY = previous;
  resetStripeClientForTests();
});
