import { DEMO_EARNINGS_LEDGER } from "@/lib/demo-data";
import {
  DEMO_PERCENT_FEE_AGREEMENT,
  calculateFeeBreakdown,
  estimateProcessingFeeCents,
} from "@/lib/fees";
import { formatCents } from "@/lib/money";

export const metadata = {
  title: "Partner Earnings",
};

export default function PartnerEarningsPage() {
  const rows = DEMO_EARNINGS_LEDGER.map((row) => {
    const breakdown = calculateFeeBreakdown({
      grossCents: row.grossCents,
      agreement: DEMO_PERCENT_FEE_AGREEMENT,
      processingFeeCents: estimateProcessingFeeCents(row.grossCents),
    });
    return {
      ...row,
      // Prefer live fee math; fall back to stored demo columns if needed for display.
      managementFeeCents: breakdown.managementFeeCents,
      processingFeeCents: breakdown.processingFeeCents,
      netCents: breakdown.netPayoutCents,
    };
  });

  const totals = rows.reduce(
    (acc, row) => ({
      gross: acc.gross + row.grossCents,
      management: acc.management + row.managementFeeCents,
      processing: acc.processing + row.processingFeeCents,
      net: acc.net + row.netCents,
    }),
    { gross: 0, management: 0, processing: 0, net: 0 },
  );

  return (
    <>
      <p className="eyebrow">Payouts</p>
      <h1 className="section-title mt-4">Earnings</h1>
      <p className="mt-3 max-w-xl text-mist">
        Weekly gross rent with management and processing fees from{" "}
        <span className="text-cream">lib/fees</span>, and net to Connect.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Gross", value: formatCents(totals.gross) },
          { label: "Management fee", value: formatCents(totals.management) },
          { label: "Processing", value: formatCents(totals.processing) },
          { label: "Net", value: formatCents(totals.net) },
        ].map((m) => (
          <div key={m.label} className="border border-line/60 bg-ink-soft p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-mist">{m.label}</p>
            <p className="display mt-3 text-3xl text-cream">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 overflow-x-auto border border-line/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line/60 bg-ink-soft text-xs uppercase tracking-[0.14em] text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Gross</th>
              <th className="px-4 py-3 font-medium">Mgmt fee (15%)</th>
              <th className="px-4 py-3 font-medium">Processing</th>
              <th className="px-4 py-3 font-medium">Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line/40 last:border-0">
                <td className="px-4 py-4 text-cream">{row.period}</td>
                <td className="px-4 py-4 text-mist">{row.vehicle}</td>
                <td className="px-4 py-4 text-mist">{formatCents(row.grossCents)}</td>
                <td className="px-4 py-4 text-mist">
                  {formatCents(row.managementFeeCents)}
                </td>
                <td className="px-4 py-4 text-mist">
                  {formatCents(row.processingFeeCents)}
                </td>
                <td className="px-4 py-4 text-gold-bright">
                  {formatCents(row.netCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
