import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_FEE_AGREEMENT,
  DEMO_PERCENT_FEE_AGREEMENT,
  buildLedgerLines,
  calculateFeeBreakdown,
  calculateManagementFee,
  calculateNetPayout,
  estimateProcessingFeeCents,
} from "../lib/fees.ts";
import { assembleWeeklyLedgerEntries, buildLedgerEntryPayload } from "../lib/ledger.ts";

test("percentage management fee matches demo Camry week", () => {
  const result = calculateManagementFee({
    grossCents: 34_900,
    agreement: DEMO_PERCENT_FEE_AGREEMENT,
  });
  assert.equal(result.managementFeeCents, 5235);
  assert.equal(result.percentComponentCents, 5235);
  assert.equal(result.fixedComponentCents, 0);
  assert.equal(result.appliedMinimum, false);
});

test("fixed management fee uses weekly flat amount", () => {
  const result = calculateManagementFee({
    grossCents: 34_900,
    agreement: { type: "fixed", fixedWeeklyCents: 4_000 },
  });
  assert.equal(result.managementFeeCents, 4_000);
  assert.equal(result.percentComponentCents, 0);
  assert.equal(result.fixedComponentCents, 4_000);
});

test("hybrid management fee sums percent + fixed and respects minimum", () => {
  const hybrid = calculateManagementFee({
    grossCents: 34_900,
    agreement: DEFAULT_FEE_AGREEMENT,
  });
  // 15% of 34900 = 5235 + 2500 flat = 7735
  assert.equal(hybrid.managementFeeCents, 7735);

  const floored = calculateManagementFee({
    grossCents: 5_000,
    agreement: {
      type: "hybrid",
      percentBps: 1500,
      fixedWeeklyCents: 0,
      minimumCents: 2_000,
    },
  });
  assert.equal(floored.managementFeeCents, 2_000);
  assert.equal(floored.appliedMinimum, true);
});

test("calculateNetPayout subtracts fees, deductions, and refunds", () => {
  const net = calculateNetPayout({
    grossCents: 34_900,
    managementFeeCents: 5_235,
    processingFeeCents: 1_047,
    deductionsCents: [500, 250],
    refundsCents: 100,
  });
  assert.equal(net.deductionsTotalCents, 750);
  assert.equal(net.netPayoutCents, 34_900 - 5_235 - 1_047 - 750 - 100);
});

test("estimateProcessingFeeCents uses 2.9% + $0.30", () => {
  assert.equal(estimateProcessingFeeCents(34_900), Math.round((34_900 * 290) / 10_000) + 30);
});

test("buildLedgerLines emits gross, fees, and partner credit", () => {
  const lines = buildLedgerLines({
    organizationId: "org-demo",
    periodStart: "2026-08-10",
    periodEnd: "2026-08-17",
    vehicleLabel: "2022 Toyota Camry",
    grossCents: 34_900,
    agreement: DEMO_PERCENT_FEE_AGREEMENT,
    processingFeeCents: 1_047,
  });

  const types = lines.map((l) => l.entryType);
  assert.deepEqual(types, [
    "rental_charge",
    "platform_fee",
    "processing_fee",
    "partner_credit",
  ]);

  const credit = lines.find((l) => l.entryType === "partner_credit");
  assert.equal(credit?.amountCents, 28_618);
});

test("buildLedgerLines includes deduction and refund lines", () => {
  const lines = buildLedgerLines({
    organizationId: "org-demo",
    periodStart: "2026-08-10",
    periodEnd: "2026-08-17",
    grossCents: 10_000,
    agreement: { type: "percentage", percentBps: 1000 },
    processingFeeCents: 100,
    deductionsCents: [200],
    refundsCents: 50,
  });
  assert.ok(lines.some((l) => l.entryType === "partner_debit"));
  assert.ok(lines.some((l) => l.entryType === "refund"));
});

test("assembleWeeklyLedgerEntries attaches org + idempotency keys", () => {
  const entries = assembleWeeklyLedgerEntries({
    organizationId: "org-1",
    reservationId: "res-1",
    rentalPeriodId: "rp-1",
    paymentId: "pay-1",
    periodStart: "2026-08-10",
    periodEnd: "2026-08-17",
    grossCents: 10_000,
    agreement: { type: "fixed", fixedWeeklyCents: 1_000 },
    processingFeeCents: 200,
    idempotencyPrefix: "week:rp-1",
  });

  assert.ok(entries.length >= 4);
  assert.equal(entries[0]?.organizationId, "org-1");
  assert.equal(entries[0]?.idempotencyKey, "week:rp-1:rental_charge:0");
  assert.equal(entries[0]?.reservationId, "res-1");
});

test("buildLedgerEntryPayload validates amount", () => {
  assert.throws(() =>
    buildLedgerEntryPayload({
      organizationId: "org-1",
      entryType: "adjustment",
      direction: "debit",
      amountCents: -1,
    }),
  );

  const payload = buildLedgerEntryPayload({
    organizationId: "org-1",
    entryType: "adjustment",
    direction: "credit",
    amountCents: 500,
    description: "Goodwill",
  });
  assert.equal(payload.amountCents, 500);
  assert.equal(payload.entryType, "adjustment");
});

test("calculateFeeBreakdown combines management + processing + net", () => {
  const breakdown = calculateFeeBreakdown({
    grossCents: 34_900,
    agreement: DEMO_PERCENT_FEE_AGREEMENT,
    processingFeeCents: 1_047,
  });
  assert.equal(breakdown.managementFeeCents, 5_235);
  assert.equal(breakdown.processingFeeCents, 1_047);
  assert.equal(breakdown.netPayoutCents, 28_618);
});
