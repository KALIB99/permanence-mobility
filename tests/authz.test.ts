import assert from "node:assert/strict";
import test from "node:test";
import {
  can,
  isPlatformRole,
  partnerCan,
  permissionsFor,
  ROLE_PERMISSIONS,
  PARTNER_ROLE_PERMISSIONS,
} from "../lib/authz.ts";
import {
  PARTNER_ROLES,
  PERMISSIONS,
  PLATFORM_ROLES,
} from "../lib/roles.ts";
import { calculateWeeklyTotal, buildRentalPeriods } from "../lib/domain.ts";
import { formatCents, dollarsToCents, applyBasisPoints } from "../lib/money.ts";
import {
  clearRecordedNotificationIntents,
  deliverNotification,
  getRecordedNotificationIntents,
} from "../lib/notifications.ts";

test("super_admin can perform all mapped platform permissions", () => {
  assert.equal(can(PLATFORM_ROLES.SUPER_ADMIN, PERMISSIONS.MANAGE_PLATFORM), true);
  assert.equal(can(PLATFORM_ROLES.SUPER_ADMIN, PERMISSIONS.VIEW_LEDGER), true);
  assert.ok(ROLE_PERMISSIONS[PLATFORM_ROLES.SUPER_ADMIN].length > 10);
});

test("support_agent cannot manage payouts", () => {
  assert.equal(can(PLATFORM_ROLES.SUPPORT_AGENT, PERMISSIONS.MANAGE_PAYOUTS), false);
  assert.equal(can(PLATFORM_ROLES.SUPPORT_AGENT, PERMISSIONS.MANAGE_SUPPORT), true);
});

test("isPlatformRole narrows known roles only", () => {
  assert.equal(isPlatformRole("super_admin"), true);
  assert.equal(isPlatformRole("partner_owner"), false);
  assert.equal(isPlatformRole(null), false);
  assert.equal(can("not-a-role", PERMISSIONS.MANAGE_SUPPORT), false);
});

test("partnerCan respects partner role maps", () => {
  assert.equal(
    partnerCan(PARTNER_ROLES.PARTNER_OWNER, PERMISSIONS.PARTNER_MANAGE_ORG),
    true,
  );
  assert.equal(
    partnerCan(PARTNER_ROLES.PARTNER_READ_ONLY, PERMISSIONS.PARTNER_MANAGE_VEHICLES),
    false,
  );
  assert.equal(
    partnerCan(PARTNER_ROLES.PARTNER_ACCOUNTANT, PERMISSIONS.PARTNER_VIEW_PAYOUTS),
    true,
  );
  assert.ok(PARTNER_ROLE_PERMISSIONS[PARTNER_ROLES.PARTNER_OWNER].length >= 8);
});

test("permissionsFor returns empty for unknown roles", () => {
  assert.deepEqual(permissionsFor("ghost"), []);
});

test("calculateWeeklyTotal multiplies cents by weeks", () => {
  assert.equal(calculateWeeklyTotal(39_900, 4), 159_600);
  assert.throws(() => calculateWeeklyTotal(100, 0));
});

test("buildRentalPeriods creates exact 7-day slices", () => {
  const periods = buildRentalPeriods("2026-08-03", 2);
  assert.deepEqual(periods, [
    { weekIndex: 1, startDate: "2026-08-03", endDate: "2026-08-10" },
    { weekIndex: 2, startDate: "2026-08-10", endDate: "2026-08-17" },
  ]);
});

test("money helpers format and convert cents", () => {
  assert.equal(formatCents(39_900), "$399.00");
  assert.equal(dollarsToCents(12.5), 1250);
  assert.equal(applyBasisPoints(10_000, 250), 250);
});

test("deliverNotification records intent when keys are missing", async () => {
  clearRecordedNotificationIntents();
  const previous = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NOTIFICATION_FROM_EMAIL: process.env.NOTIFICATION_FROM_EMAIL,
  };
  delete process.env.RESEND_API_KEY;
  delete process.env.NOTIFICATION_FROM_EMAIL;

  const result = await deliverNotification({
    channel: "email",
    to: "renter@example.com",
    subject: "Hold confirmed",
    body: "Your weekly hold is confirmed.",
    eventType: "reservation_hold",
  });

  assert.equal(result.status, "pending_configuration");
  assert.equal(getRecordedNotificationIntents().length, 1);

  if (previous.RESEND_API_KEY) process.env.RESEND_API_KEY = previous.RESEND_API_KEY;
  if (previous.NOTIFICATION_FROM_EMAIL) {
    process.env.NOTIFICATION_FROM_EMAIL = previous.NOTIFICATION_FROM_EMAIL;
  }
});
