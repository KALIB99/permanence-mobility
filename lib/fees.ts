/**
 * Pure fee calculation helpers for weekly rentals.
 * All amounts are integer USD cents. Basis points: 1 bp = 0.01%.
 */

import { applyBasisPoints, sumCents } from "@/lib/money";

export type FeeAgreementType = "percentage" | "fixed" | "hybrid";

export type FeeAgreement = {
  type: FeeAgreementType;
  /** Management fee rate in basis points (e.g. 1500 = 15%). */
  percentBps?: number;
  /** Flat management fee per weekly period. */
  fixedWeeklyCents?: number;
  /** Floor on the computed management fee. */
  minimumCents?: number;
};

export type ManagementFeeResult = {
  managementFeeCents: number;
  percentComponentCents: number;
  fixedComponentCents: number;
  appliedMinimum: boolean;
  agreementType: FeeAgreementType;
};

export type NetPayoutInput = {
  grossCents: number;
  managementFeeCents: number;
  processingFeeCents: number;
  deductionsCents?: number[];
  refundsCents?: number;
};

export type NetPayoutResult = {
  grossCents: number;
  managementFeeCents: number;
  processingFeeCents: number;
  deductionsTotalCents: number;
  refundsCents: number;
  netPayoutCents: number;
};

export type WeeklyLedgerPeriodInput = {
  organizationId: string;
  reservationId?: string;
  rentalPeriodId?: string;
  vehicleLabel?: string;
  periodStart: string;
  periodEnd: string;
  grossCents: number;
  agreement: FeeAgreement;
  /** Override processing fee; otherwise estimated from gross. */
  processingFeeCents?: number;
  deductionsCents?: number[];
  refundsCents?: number;
  currency?: string;
};

export type LedgerLineDraft = {
  entryType:
    | "rental_charge"
    | "platform_fee"
    | "processing_fee"
    | "partner_debit"
    | "partner_credit"
    | "refund"
    | "adjustment";
  direction: "debit" | "credit";
  amountCents: number;
  currency: string;
  description: string;
  metadata: Record<string, unknown>;
};

function assertNonNegativeInt(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
}

function assertOptionalNonNegInt(name: string, value: number | undefined): void {
  if (value === undefined) return;
  assertNonNegativeInt(name, value);
}

/**
 * Estimate card processing fee (~2.9% + $0.30) in cents.
 * Used when Stripe has not yet settled the exact amount.
 */
export function estimateProcessingFeeCents(grossCents: number): number {
  assertNonNegativeInt("grossCents", grossCents);
  return applyBasisPoints(grossCents, 290) + 30;
}

/**
 * Compute platform management fee from a fee agreement.
 *
 * - percentage: percent of gross
 * - fixed: fixedWeeklyCents
 * - hybrid: percent + fixed, then optional minimum floor
 */
export function calculateManagementFee(input: {
  grossCents: number;
  agreement: FeeAgreement;
}): ManagementFeeResult {
  const { grossCents, agreement } = input;
  assertNonNegativeInt("grossCents", grossCents);
  assertOptionalNonNegInt("percentBps", agreement.percentBps);
  assertOptionalNonNegInt("fixedWeeklyCents", agreement.fixedWeeklyCents);
  assertOptionalNonNegInt("minimumCents", agreement.minimumCents);

  let percentComponentCents = 0;
  let fixedComponentCents = 0;

  switch (agreement.type) {
    case "percentage": {
      if (agreement.percentBps === undefined) {
        throw new Error("percentBps is required for percentage agreements");
      }
      percentComponentCents = applyBasisPoints(grossCents, agreement.percentBps);
      break;
    }
    case "fixed": {
      if (agreement.fixedWeeklyCents === undefined) {
        throw new Error("fixedWeeklyCents is required for fixed agreements");
      }
      fixedComponentCents = agreement.fixedWeeklyCents;
      break;
    }
    case "hybrid": {
      if (
        agreement.percentBps === undefined &&
        agreement.fixedWeeklyCents === undefined
      ) {
        throw new Error(
          "hybrid agreements require percentBps and/or fixedWeeklyCents",
        );
      }
      percentComponentCents =
        agreement.percentBps !== undefined
          ? applyBasisPoints(grossCents, agreement.percentBps)
          : 0;
      fixedComponentCents = agreement.fixedWeeklyCents ?? 0;
      break;
    }
    default: {
      const _exhaustive: never = agreement.type;
      throw new Error(`Unknown agreement type: ${_exhaustive}`);
    }
  }

  let managementFeeCents = percentComponentCents + fixedComponentCents;
  let appliedMinimum = false;
  const minimum = agreement.minimumCents ?? 0;
  if (managementFeeCents < minimum) {
    managementFeeCents = minimum;
    appliedMinimum = true;
  }

  return {
    managementFeeCents,
    percentComponentCents,
    fixedComponentCents,
    appliedMinimum,
    agreementType: agreement.type,
  };
}

/** Net to partner after platform fee, processing, deductions, and refunds. */
export function calculateNetPayout(input: NetPayoutInput): NetPayoutResult {
  assertNonNegativeInt("grossCents", input.grossCents);
  assertNonNegativeInt("managementFeeCents", input.managementFeeCents);
  assertNonNegativeInt("processingFeeCents", input.processingFeeCents);
  const refundsCents = input.refundsCents ?? 0;
  assertNonNegativeInt("refundsCents", refundsCents);

  const deductions = input.deductionsCents ?? [];
  for (const d of deductions) {
    assertNonNegativeInt("deductionsCents[]", d);
  }
  const deductionsTotalCents = deductions.length ? sumCents(...deductions) : 0;

  const netPayoutCents =
    input.grossCents -
    input.managementFeeCents -
    input.processingFeeCents -
    deductionsTotalCents -
    refundsCents;

  return {
    grossCents: input.grossCents,
    managementFeeCents: input.managementFeeCents,
    processingFeeCents: input.processingFeeCents,
    deductionsTotalCents,
    refundsCents,
    netPayoutCents,
  };
}

/**
 * Build draft ledger lines for one weekly rental period.
 * Does not persist — payloads are ready for append-only insert.
 */
export function buildLedgerLines(
  input: WeeklyLedgerPeriodInput,
): LedgerLineDraft[] {
  const currency = input.currency ?? "usd";
  const fee = calculateManagementFee({
    grossCents: input.grossCents,
    agreement: input.agreement,
  });
  const processingFeeCents =
    input.processingFeeCents ?? estimateProcessingFeeCents(input.grossCents);
  const payout = calculateNetPayout({
    grossCents: input.grossCents,
    managementFeeCents: fee.managementFeeCents,
    processingFeeCents,
    deductionsCents: input.deductionsCents,
    refundsCents: input.refundsCents,
  });

  const periodLabel = `${input.periodStart}→${input.periodEnd}`;
  const vehicleBit = input.vehicleLabel ? ` · ${input.vehicleLabel}` : "";
  const metaBase = {
    organizationId: input.organizationId,
    reservationId: input.reservationId ?? null,
    rentalPeriodId: input.rentalPeriodId ?? null,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    agreementType: fee.agreementType,
  };

  const lines: LedgerLineDraft[] = [
    {
      entryType: "rental_charge",
      direction: "credit",
      amountCents: payout.grossCents,
      currency,
      description: `Weekly rent ${periodLabel}${vehicleBit}`,
      metadata: { ...metaBase, role: "gross" },
    },
    {
      entryType: "platform_fee",
      direction: "debit",
      amountCents: payout.managementFeeCents,
      currency,
      description: `Management fee ${periodLabel}`,
      metadata: {
        ...metaBase,
        percentComponentCents: fee.percentComponentCents,
        fixedComponentCents: fee.fixedComponentCents,
        appliedMinimum: fee.appliedMinimum,
      },
    },
    {
      entryType: "processing_fee",
      direction: "debit",
      amountCents: payout.processingFeeCents,
      currency,
      description: `Processing fee ${periodLabel}`,
      metadata: { ...metaBase },
    },
  ];

  if (payout.deductionsTotalCents > 0) {
    lines.push({
      entryType: "partner_debit",
      direction: "debit",
      amountCents: payout.deductionsTotalCents,
      currency,
      description: `Deductions ${periodLabel}`,
      metadata: {
        ...metaBase,
        deductionsCents: input.deductionsCents ?? [],
      },
    });
  }

  if (payout.refundsCents > 0) {
    lines.push({
      entryType: "refund",
      direction: "debit",
      amountCents: payout.refundsCents,
      currency,
      description: `Refunds ${periodLabel}`,
      metadata: { ...metaBase },
    });
  }

  lines.push({
    entryType: "partner_credit",
    direction: "credit",
    amountCents: Math.max(0, payout.netPayoutCents),
    currency,
    description: `Partner net ${periodLabel}${vehicleBit}`,
    metadata: {
      ...metaBase,
      netPayoutCents: payout.netPayoutCents,
    },
  });

  return lines;
}

/** Full breakdown used by admin fee calculator and partner earnings. */
export function calculateFeeBreakdown(input: {
  grossCents: number;
  agreement: FeeAgreement;
  processingFeeCents?: number;
  deductionsCents?: number[];
  refundsCents?: number;
}) {
  const management = calculateManagementFee({
    grossCents: input.grossCents,
    agreement: input.agreement,
  });
  const processingFeeCents =
    input.processingFeeCents ?? estimateProcessingFeeCents(input.grossCents);
  const payout = calculateNetPayout({
    grossCents: input.grossCents,
    managementFeeCents: management.managementFeeCents,
    processingFeeCents,
    deductionsCents: input.deductionsCents,
    refundsCents: input.refundsCents,
  });

  return {
    ...management,
    ...payout,
    processingFeeCents,
  };
}

/** Platform default hybrid schedule (matches seeded fee_agreements). */
export const DEFAULT_FEE_AGREEMENT: FeeAgreement = {
  type: "hybrid",
  percentBps: 1500,
  fixedWeeklyCents: 2500,
  minimumCents: 0,
};

/** Demo partner display agreement used by earnings samples (15% only). */
export const DEMO_PERCENT_FEE_AGREEMENT: FeeAgreement = {
  type: "percentage",
  percentBps: 1500,
};
