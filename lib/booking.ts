/**
 * Weekly booking engine — pure domain helpers.
 *
 * Assumptions (also see docs/ASSUMPTIONS.md):
 * - A rental unit is exactly 7 days; day-level rentals are out of scope.
 * - Periods are half-open [start, end): adjacent weeks do not overlap.
 * - Checkout holds expire after HOLD_MINUTES (default 20).
 * - Late fees: flat per-day charge after a grace period; capped at one weekly rate.
 * - Proration: unused *full* weeks may be credited on early return; the current
 *   partial week is not day-prorated in v1 (weekly commitment).
 * - Renewals extend endDate by N×7 days at the reservation's weekly price.
 */

import { z } from "zod";
import {
  HOLD_MINUTES,
  MAX_RENTAL_WEEKS,
  addWeeks,
  buildRentalPeriods,
  calculateWeeklyTotal,
  holdExpiresAt,
  normalizeDate,
  periodsOverlap,
} from "@/lib/domain";
import { createHoldSchema, type CreateHoldInput } from "@/lib/validators";

export type DateRange = {
  startDate: string;
  endDate: string;
  status?: string;
};

export type RentalPeriod = {
  weekIndex: number;
  startDate: string;
  endDate: string;
};

export type ValidatedHoldInput = CreateHoldInput & {
  startDate: string;
  endDate: string;
};

const ACTIVE_OVERLAP_STATUSES = new Set(["hold", "confirmed", "active"]);

/** Validate and normalize create-hold input; computes exclusive endDate. */
export function createHoldInput(raw: unknown): ValidatedHoldInput {
  const parsed = createHoldSchema.parse(raw);
  const startDate = normalizeDate(parsed.startDate);
  const endDate = addWeeks(startDate, parsed.weeks);
  return { ...parsed, startDate, endDate };
}

/** Soft-parse variant that returns Zod issues instead of throwing. */
export function safeCreateHoldInput(raw: unknown) {
  const parsed = createHoldSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error };
  }
  try {
    const startDate = normalizeDate(parsed.data.startDate);
    const endDate = addWeeks(startDate, parsed.data.weeks);
    return {
      success: true as const,
      data: { ...parsed.data, startDate, endDate } satisfies ValidatedHoldInput,
    };
  } catch (err) {
    return {
      success: false as const,
      error: new z.ZodError([
        {
          code: "custom",
          path: ["startDate"],
          message: err instanceof Error ? err.message : "Invalid hold input",
        },
      ]),
    };
  }
}

/**
 * Throws if [start, end) overlaps any active existing range.
 * Expired holds (status hold + holdExpiresAt in the past) should be filtered
 * by the caller before invoking this helper.
 */
export function assertNoOverlap(
  existing: DateRange[],
  start: string,
  end: string,
): void {
  const startDate = normalizeDate(start);
  const endDate = normalizeDate(end);
  if (startDate >= endDate) {
    throw new Error("start must be before end");
  }
  for (const row of existing) {
    const status = row.status ?? "confirmed";
    if (!ACTIVE_OVERLAP_STATUSES.has(status)) continue;
    if (periodsOverlap(row.startDate, row.endDate, startDate, endDate)) {
      throw new Error(
        `Overlaps existing reservation ${row.startDate}→${row.endDate} (${status})`,
      );
    }
  }
}

/** Alias matching product language — exact 7-day slices. */
export function buildPeriods(start: string, weeks: number): RentalPeriod[] {
  return buildRentalPeriods(start, weeks);
}

export type RenewalQuote = {
  previousEndDate: string;
  newEndDate: string;
  additionalWeeks: number;
  additionalCents: number;
  periods: RentalPeriod[];
};

/** Quote a renewal that extends a reservation by additionalWeeks. */
export function quoteRenewal(input: {
  currentEndDate: string;
  additionalWeeks: number;
  weeklyPriceCents: number;
}): RenewalQuote {
  const { additionalWeeks, weeklyPriceCents } = input;
  if (
    !Number.isInteger(additionalWeeks) ||
    additionalWeeks < 1 ||
    additionalWeeks > MAX_RENTAL_WEEKS
  ) {
    throw new Error(`additionalWeeks must be 1–${MAX_RENTAL_WEEKS}`);
  }
  const previousEndDate = normalizeDate(input.currentEndDate);
  const newEndDate = addWeeks(previousEndDate, additionalWeeks);
  const periods = buildPeriods(previousEndDate, additionalWeeks);
  return {
    previousEndDate,
    newEndDate,
    additionalWeeks,
    additionalCents: calculateWeeklyTotal(weeklyPriceCents, additionalWeeks),
    periods,
  };
}

/**
 * Late fee in cents.
 * Assumption: charge `dailyFeeCents` for each full calendar day past
 * `dueDate` after `graceDays`, capped at `capCents` (default: one weekly rate).
 */
export function calculateLateFeeCents(input: {
  dueDate: string;
  asOfDate: string;
  dailyFeeCents: number;
  graceDays?: number;
  capCents?: number;
}): number {
  const due = normalizeDate(input.dueDate);
  const asOf = normalizeDate(input.asOfDate);
  if (!Number.isInteger(input.dailyFeeCents) || input.dailyFeeCents < 0) {
    throw new Error("dailyFeeCents must be a non-negative integer");
  }
  const graceDays = input.graceDays ?? 1;
  if (!Number.isInteger(graceDays) || graceDays < 0) {
    throw new Error("graceDays must be a non-negative integer");
  }

  const dueMs = Date.parse(`${due}T00:00:00.000Z`);
  const asOfMs = Date.parse(`${asOf}T00:00:00.000Z`);
  const daysLate = Math.floor((asOfMs - dueMs) / 86_400_000) - graceDays;
  if (daysLate <= 0) return 0;

  const raw = daysLate * input.dailyFeeCents;
  const cap = input.capCents ?? Number.POSITIVE_INFINITY;
  if (Number.isFinite(cap) && (!Number.isInteger(cap) || cap < 0)) {
    throw new Error("capCents must be a non-negative integer");
  }
  return Math.min(raw, cap);
}

/**
 * Credit for early return.
 * Assumption: only unused *full* remaining weeks after `returnDate` are credited;
 * the week containing the return date is not day-prorated.
 */
export function calculateEarlyReturnCreditCents(input: {
  reservationStartDate: string;
  reservationEndDate: string;
  returnDate: string;
  weeklyPriceCents: number;
}): { creditedWeeks: number; creditCents: number; forfeitedPartialWeek: boolean } {
  const start = normalizeDate(input.reservationStartDate);
  const end = normalizeDate(input.reservationEndDate);
  const returned = normalizeDate(input.returnDate);

  if (returned <= start) {
    const totalWeeks = Math.round(
      (Date.parse(`${end}T00:00:00.000Z`) - Date.parse(`${start}T00:00:00.000Z`)) /
        (7 * 86_400_000),
    );
    return {
      creditedWeeks: totalWeeks,
      creditCents: calculateWeeklyTotal(input.weeklyPriceCents, Math.max(totalWeeks, 1)),
      forfeitedPartialWeek: false,
    };
  }
  if (returned >= end) {
    return { creditedWeeks: 0, creditCents: 0, forfeitedPartialWeek: false };
  }

  // Align credit start to the next period boundary after return.
  // If returnDate falls exactly on a period start, credit from that date (no partial forfeit).
  const startMs = Date.parse(`${start}T00:00:00.000Z`);
  const returnMs = Date.parse(`${returned}T00:00:00.000Z`);
  const endMs = Date.parse(`${end}T00:00:00.000Z`);
  const elapsedDays = Math.floor((returnMs - startMs) / 86_400_000);
  const onPeriodBoundary = elapsedDays % 7 === 0;
  const nextBoundaryMs = onPeriodBoundary
    ? returnMs
    : startMs + (Math.floor(elapsedDays / 7) + 1) * 7 * 86_400_000;
  const forfeitedPartialWeek = !onPeriodBoundary;

  if (nextBoundaryMs >= endMs) {
    return { creditedWeeks: 0, creditCents: 0, forfeitedPartialWeek };
  }

  const creditedWeeks = Math.round((endMs - nextBoundaryMs) / (7 * 86_400_000));
  return {
    creditedWeeks,
    creditCents:
      creditedWeeks > 0
        ? calculateWeeklyTotal(input.weeklyPriceCents, creditedWeeks)
        : 0,
    forfeitedPartialWeek,
  };
}

/** Build a demo/API hold payload from validated input + vehicle pricing. */
export function buildHoldRecord(input: {
  hold: ValidatedHoldInput;
  weeklyPriceCents: number;
  depositCents: number;
  publicId?: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const periods = buildPeriods(input.hold.startDate, input.hold.weeks);
  return {
    id: crypto.randomUUID(),
    publicId: input.publicId ?? `hold_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`,
    vehicleId: input.hold.vehicleId,
    status: "hold" as const,
    startDate: input.hold.startDate,
    endDate: input.hold.endDate,
    weeks: input.hold.weeks,
    weeklyPriceCents: input.weeklyPriceCents,
    depositCents: input.depositCents,
    rentTotalCents: calculateWeeklyTotal(input.weeklyPriceCents, input.hold.weeks),
    holdExpiresAt: holdExpiresAt(now, HOLD_MINUTES),
    periods,
  };
}

export { HOLD_MINUTES, MAX_RENTAL_WEEKS, calculateWeeklyTotal };
