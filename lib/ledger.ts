/**
 * Append-only ledger entry payload helpers (no DB I/O).
 * Aligns with public.ledger_entries + ledger_entry_type enum.
 */

import {
  buildLedgerLines,
  type FeeAgreement,
  type LedgerLineDraft,
  type WeeklyLedgerPeriodInput,
} from "@/lib/fees";

export type LedgerEntryType =
  | "rental_charge"
  | "platform_fee"
  | "processing_fee"
  | "partner_credit"
  | "partner_debit"
  | "deposit_hold"
  | "deposit_capture"
  | "deposit_release"
  | "refund"
  | "chargeback"
  | "payout"
  | "adjustment"
  | "tax"
  | "other";

export type LedgerDirection = "debit" | "credit";

/** Payload shape ready for insert into ledger_entries (id assigned by DB). */
export type LedgerEntryPayload = {
  organizationId: string;
  entryType: LedgerEntryType;
  amountCents: number;
  currency: string;
  direction: LedgerDirection;
  reservationId?: string | null;
  paymentId?: string | null;
  payoutId?: string | null;
  rentalPeriodId?: string | null;
  feeCalculationId?: string | null;
  externalRef?: string | null;
  description?: string | null;
  metadata: Record<string, unknown>;
  idempotencyKey?: string;
};

export type AssembleWeeklyLedgerInput = WeeklyLedgerPeriodInput & {
  paymentId?: string;
  feeCalculationId?: string;
  /** Prefix for deterministic idempotency keys. */
  idempotencyPrefix?: string;
};

function lineToPayload(
  line: LedgerLineDraft,
  ctx: {
    organizationId: string;
    reservationId?: string;
    rentalPeriodId?: string;
    paymentId?: string;
    feeCalculationId?: string;
    idempotencyPrefix?: string;
    index: number;
  },
): LedgerEntryPayload {
  const idempotencyKey = ctx.idempotencyPrefix
    ? `${ctx.idempotencyPrefix}:${line.entryType}:${ctx.index}`
    : undefined;

  return {
    organizationId: ctx.organizationId,
    entryType: line.entryType,
    amountCents: line.amountCents,
    currency: line.currency,
    direction: line.direction,
    reservationId: ctx.reservationId ?? null,
    paymentId: ctx.paymentId ?? null,
    rentalPeriodId: ctx.rentalPeriodId ?? null,
    feeCalculationId: ctx.feeCalculationId ?? null,
    description: line.description,
    metadata: line.metadata,
    idempotencyKey,
  };
}

/**
 * Assemble immutable ledger entry payloads for a weekly period settlement.
 * Callers persist via service-role append; never update/delete after insert.
 */
export function assembleWeeklyLedgerEntries(
  input: AssembleWeeklyLedgerInput,
): LedgerEntryPayload[] {
  const lines = buildLedgerLines(input);
  return lines.map((line, index) =>
    lineToPayload(line, {
      organizationId: input.organizationId,
      reservationId: input.reservationId,
      rentalPeriodId: input.rentalPeriodId,
      paymentId: input.paymentId,
      feeCalculationId: input.feeCalculationId,
      idempotencyPrefix: input.idempotencyPrefix,
      index,
    }),
  );
}

/** Build a single ad-hoc ledger payload (e.g. manual adjustment). */
export function buildLedgerEntryPayload(input: {
  organizationId: string;
  entryType: LedgerEntryType;
  direction: LedgerDirection;
  amountCents: number;
  currency?: string;
  description?: string;
  reservationId?: string;
  paymentId?: string;
  payoutId?: string;
  rentalPeriodId?: string;
  externalRef?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}): LedgerEntryPayload {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 0) {
    throw new Error("amountCents must be a non-negative integer");
  }
  return {
    organizationId: input.organizationId,
    entryType: input.entryType,
    amountCents: input.amountCents,
    currency: input.currency ?? "usd",
    direction: input.direction,
    reservationId: input.reservationId ?? null,
    paymentId: input.paymentId ?? null,
    payoutId: input.payoutId ?? null,
    rentalPeriodId: input.rentalPeriodId ?? null,
    externalRef: input.externalRef ?? null,
    description: input.description ?? null,
    metadata: input.metadata ?? {},
    idempotencyKey: input.idempotencyKey,
  };
}

export type { FeeAgreement, LedgerLineDraft };
