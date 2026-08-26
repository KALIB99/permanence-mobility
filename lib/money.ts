/** Money helpers — all amounts are integer USD cents unless noted. */

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const USD_COMPACT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Format cents as a USD currency string (e.g. 39900 → "$399.00"). */
export function formatCents(cents: number, options?: { compact?: boolean }): string {
  if (!Number.isFinite(cents)) {
    throw new Error("Amount must be a finite number of cents");
  }
  const dollars = cents / 100;
  return options?.compact ? USD_COMPACT.format(dollars) : USD.format(dollars);
}

/** Convert a dollar amount (possibly fractional) to integer cents. */
export function dollarsToCents(dollars: number): number {
  if (!Number.isFinite(dollars)) {
    throw new Error("Dollar amount must be finite");
  }
  return Math.round(dollars * 100);
}

/** Convert integer cents to a dollar number. */
export function centsToDollars(cents: number): number {
  if (!Number.isInteger(cents)) {
    throw new Error("Cents must be an integer");
  }
  return cents / 100;
}

/** Sum integer cent amounts safely. */
export function sumCents(...amounts: number[]): number {
  let total = 0;
  for (const amount of amounts) {
    if (!Number.isInteger(amount)) {
      throw new Error("All amounts must be integer cents");
    }
    total += amount;
  }
  return total;
}

/** Apply a basis-point rate to an amount in cents (1 bp = 0.01%). */
export function applyBasisPoints(cents: number, basisPoints: number): number {
  if (!Number.isInteger(cents) || !Number.isInteger(basisPoints)) {
    throw new Error("cents and basisPoints must be integers");
  }
  return Math.round((cents * basisPoints) / 10_000);
}

/** Clamp a cent amount to a non-negative integer. */
export function nonNegativeCents(cents: number): number {
  if (!Number.isInteger(cents)) {
    throw new Error("Cents must be an integer");
  }
  return Math.max(0, cents);
}
