import { DEFAULT_FEE_AGREEMENT, calculateFeeBreakdown } from "@/lib/fees";
import { formatCents } from "@/lib/money";

export const metadata = {
  title: "Admin Fees",
};

const FEE_ROWS = [
  {
    name: "Default hybrid management fee",
    value: "15% + $25 / week",
    note: "Platform-wide default; orgs may override via fee agreements.",
  },
  {
    name: "Processing (estimate)",
    value: "~2.9% + $0.30",
    note: "Passed through Stripe card processing; exact amounts settle in ledger.",
  },
  {
    name: "Late fee (daily)",
    value: "$25 / day",
    note: "After 1-day grace; capped at one weekly rate (see lib/booking.ts).",
  },
] as const;

const SAMPLE_GROSS = 34_900;

export default function AdminFeesPage() {
  const sample = calculateFeeBreakdown({
    grossCents: SAMPLE_GROSS,
    agreement: DEFAULT_FEE_AGREEMENT,
  });

  return (
    <>
      <p className="eyebrow">Finance</p>
      <h1 className="section-title mt-4">Fee schedule</h1>
      <p className="mt-3 max-w-xl text-mist">
        Platform defaults and a calculator sample. POST{" "}
        <span className="text-cream">/api/admin/fees/calculate</span> for live breakdowns.
      </p>

      <ul className="mt-10 space-y-0 border border-line/60">
        {FEE_ROWS.map((row) => (
          <li
            key={row.name}
            className="border-b border-line/40 px-4 py-5 last:border-0 sm:px-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-cream">{row.name}</p>
              <p className="text-gold-bright">{row.value}</p>
            </div>
            <p className="mt-2 text-sm text-mist">{row.note}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 border border-line/60 bg-ink-soft p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-gold">
          Sample week · {formatCents(SAMPLE_GROSS)} gross
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-mist">Management</dt>
            <dd className="mt-1 text-cream">{formatCents(sample.managementFeeCents)}</dd>
          </div>
          <div>
            <dt className="text-mist">Processing</dt>
            <dd className="mt-1 text-cream">{formatCents(sample.processingFeeCents)}</dd>
          </div>
          <div>
            <dt className="text-mist">Partner net</dt>
            <dd className="mt-1 text-gold-bright">{formatCents(sample.netPayoutCents)}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}
