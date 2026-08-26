import assert from "node:assert/strict";
import test from "node:test";
import {
  averageUtilizationRate,
  outstandingBalances,
  revenueByVehicle,
  totalOutstandingCents,
  utilizationRate,
} from "../lib/reporting.ts";

test("utilizationRate computes rented/available ratio", () => {
  const result = utilizationRate({
    vehicleId: "v1",
    availableDays: 30,
    rentedDays: 21,
  });
  assert.equal(result.rate, 0.7);
});

test("utilizationRate is zero when availableDays is zero", () => {
  assert.equal(
    utilizationRate({ vehicleId: "v1", availableDays: 0, rentedDays: 0 }).rate,
    0,
  );
});

test("utilizationRate rejects rentedDays over availableDays", () => {
  assert.throws(() =>
    utilizationRate({ vehicleId: "v1", availableDays: 7, rentedDays: 8 }),
  );
});

test("averageUtilizationRate averages per-vehicle rates", () => {
  const avg = averageUtilizationRate([
    { vehicleId: "a", availableDays: 10, rentedDays: 10 },
    { vehicleId: "b", availableDays: 10, rentedDays: 0 },
  ]);
  assert.equal(avg, 0.5);
});

test("revenueByVehicle aggregates and ranks by gross", () => {
  const rows = revenueByVehicle([
    { vehicleId: "camry", vehicleLabel: "Camry", grossCents: 34_900 },
    { vehicleId: "prius", vehicleLabel: "Prius", grossCents: 32_900 },
    { vehicleId: "camry", grossCents: 34_900 },
  ]);
  assert.equal(rows[0]?.vehicleId, "camry");
  assert.equal(rows[0]?.grossCents, 69_800);
  assert.equal(rows[0]?.share, 69_800 / (69_800 + 32_900));
  assert.equal(rows.length, 2);
});

test("outstandingBalances filters positives and sorts descending", () => {
  const list = outstandingBalances([
    { partyId: "r1", partyLabel: "Marcus", balanceCents: 5_000 },
    { partyId: "r2", balanceCents: 0 },
    { partyId: "r3", balanceCents: -200 },
    { partyId: "r4", partyLabel: "Devon", balanceCents: 12_000 },
  ]);
  assert.deepEqual(
    list.map((r) => r.partyId),
    ["r4", "r1"],
  );
  assert.equal(totalOutstandingCents(list), 17_000);
});

test("outstandingBalances can include credits", () => {
  const list = outstandingBalances(
    [
      { partyId: "a", balanceCents: 100 },
      { partyId: "b", balanceCents: -50 },
    ],
    { includeCredits: true },
  );
  assert.equal(list.length, 2);
});
