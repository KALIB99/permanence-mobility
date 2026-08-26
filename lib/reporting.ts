/**
 * Pure reporting aggregations for ops dashboards.
 * Works on plain arrays — no DB required.
 */

export type UtilizationPeriod = {
  vehicleId: string;
  /** Inclusive calendar days the vehicle existed / was available in the window. */
  availableDays: number;
  /** Calendar days under active rental in the window. */
  rentedDays: number;
};

export type RevenueRow = {
  vehicleId: string;
  vehicleLabel?: string;
  grossCents: number;
};

export type BalanceRow = {
  partyId: string;
  partyLabel?: string;
  /** Positive = amount owed to platform / outstanding receivable. */
  balanceCents: number;
};

export type UtilizationResult = {
  vehicleId: string;
  availableDays: number;
  rentedDays: number;
  /** 0–1 ratio; 0 when availableDays is 0. */
  rate: number;
};

export type RevenueByVehicleResult = {
  vehicleId: string;
  vehicleLabel?: string;
  grossCents: number;
  share: number;
};

export type OutstandingBalanceResult = {
  partyId: string;
  partyLabel?: string;
  balanceCents: number;
};

function assertNonNegInt(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
}

/** Utilization rate for a single vehicle period (rented / available). */
export function utilizationRate(input: UtilizationPeriod): UtilizationResult {
  assertNonNegInt("availableDays", input.availableDays);
  assertNonNegInt("rentedDays", input.rentedDays);
  if (input.rentedDays > input.availableDays && input.availableDays > 0) {
    throw new Error("rentedDays cannot exceed availableDays");
  }
  const rate =
    input.availableDays === 0 ? 0 : input.rentedDays / input.availableDays;
  return {
    vehicleId: input.vehicleId,
    availableDays: input.availableDays,
    rentedDays: input.rentedDays,
    rate,
  };
}

/** Fleet-wide average utilization (equal weight per vehicle row). */
export function averageUtilizationRate(periods: UtilizationPeriod[]): number {
  if (periods.length === 0) return 0;
  const sum = periods.reduce((acc, p) => acc + utilizationRate(p).rate, 0);
  return sum / periods.length;
}

/**
 * Aggregate gross revenue by vehicle and attach share of total.
 * Rows with the same vehicleId are summed.
 */
export function revenueByVehicle(
  rows: RevenueRow[],
): RevenueByVehicleResult[] {
  const map = new Map<
    string,
    { vehicleId: string; vehicleLabel?: string; grossCents: number }
  >();

  for (const row of rows) {
    if (!Number.isInteger(row.grossCents)) {
      throw new Error("grossCents must be an integer");
    }
    const existing = map.get(row.vehicleId);
    if (existing) {
      existing.grossCents += row.grossCents;
      if (!existing.vehicleLabel && row.vehicleLabel) {
        existing.vehicleLabel = row.vehicleLabel;
      }
    } else {
      map.set(row.vehicleId, {
        vehicleId: row.vehicleId,
        vehicleLabel: row.vehicleLabel,
        grossCents: row.grossCents,
      });
    }
  }

  const list = [...map.values()];
  const total = list.reduce((s, r) => s + r.grossCents, 0);

  return list
    .map((r) => ({
      ...r,
      share: total === 0 ? 0 : r.grossCents / total,
    }))
    .sort((a, b) => b.grossCents - a.grossCents);
}

/**
 * Filter and sort parties with positive outstanding balances.
 * Negative balances (credits) are excluded unless `includeCredits` is true.
 */
export function outstandingBalances(
  rows: BalanceRow[],
  options?: { includeCredits?: boolean },
): OutstandingBalanceResult[] {
  const includeCredits = options?.includeCredits ?? false;
  const filtered = rows.filter((r) => {
    if (!Number.isInteger(r.balanceCents)) {
      throw new Error("balanceCents must be an integer");
    }
    return includeCredits ? r.balanceCents !== 0 : r.balanceCents > 0;
  });

  return filtered
    .map((r) => ({
      partyId: r.partyId,
      partyLabel: r.partyLabel,
      balanceCents: r.balanceCents,
    }))
    .sort((a, b) => b.balanceCents - a.balanceCents);
}

/** Sum of outstanding (positive) balances. */
export function totalOutstandingCents(rows: BalanceRow[]): number {
  return outstandingBalances(rows).reduce((s, r) => s + r.balanceCents, 0);
}
