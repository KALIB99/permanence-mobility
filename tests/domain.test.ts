import assert from "node:assert/strict";
import test from "node:test";
import { addWeeks, futureDailyStartDates, futureWeeklyStartDates, matchesWaitingClient, periodsOverlap } from "../lib/domain.ts";
import { hashPassword, verifyPassword } from "../lib/security.ts";

test("weekly periods end on the same weekday", () => {
  assert.equal(addWeeks("2026-08-03", 1), "2026-08-10");
  assert.equal(addWeeks("2026-08-03", 4), "2026-08-31");
});

test("overlap rule allows adjacent weekly rentals and blocks intersecting rentals", () => {
  assert.equal(periodsOverlap("2026-08-03", "2026-08-10", "2026-08-10", "2026-08-17"), false);
  assert.equal(periodsOverlap("2026-08-03", "2026-08-17", "2026-08-10", "2026-08-24"), true);
});

test("future start dates are Mondays", () => {
  const dates = futureWeeklyStartDates(4, new Date("2026-07-29T12:00:00Z"));
  assert.deepEqual(dates, ["2026-08-03", "2026-08-10", "2026-08-17", "2026-08-24"]);
});

test("calendar offers every day rather than Monday-only starts", () => {
  const dates = futureDailyStartDates(10, new Date("2026-08-05T12:00:00Z"));
  assert.equal(dates[0], "2026-08-05");
  assert.equal(dates[1], "2026-08-06");
  assert.equal(dates[6], "2026-08-11");
});

test("waiting-list matching respects category, budget, location, and work platform", () => {
  const vehicle = { category: "SUV", weekly_price: 449, location: "Phoenix, AZ", eligibility: "Uber,Lyft,Amazon Flex" };
  assert.equal(matchesWaitingClient(vehicle, {
    preferred_vehicle_type: "SUV", weekly_budget: 500, location: "Phoenix",
    approved_platforms: "DoorDash, Uber",
  }), true);
  assert.equal(matchesWaitingClient(vehicle, {
    preferred_vehicle_type: "Sedan", weekly_budget: 500, location: "Phoenix",
    approved_platforms: "Uber",
  }), false);
  assert.equal(matchesWaitingClient(vehicle, {
    preferred_vehicle_type: "SUV", weekly_budget: 400, location: "Phoenix",
    approved_platforms: "Uber",
  }), false);
});

test("portal passwords are salted and verified without storing plaintext", async () => {
  const first = await hashPassword("Permanent-Rental-2026");
  const second = await hashPassword("Permanent-Rental-2026");
  assert.notEqual(first, second);
  assert.equal(await verifyPassword("Permanent-Rental-2026", first), true);
  assert.equal(await verifyPassword("wrong-password", first), false);
  assert.doesNotMatch(first, /Permanent-Rental/);
});
