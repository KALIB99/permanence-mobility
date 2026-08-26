import {
  DEMO_EARNINGS_LEDGER,
  DEMO_OUTSTANDING_BALANCES,
  DEMO_UTILIZATION,
} from "@/lib/demo-data";
import { formatCents } from "@/lib/money";
import {
  averageUtilizationRate,
  outstandingBalances,
  revenueByVehicle,
  totalOutstandingCents,
} from "@/lib/reporting";

export const metadata = {
  title: "Admin Reports",
};

export default function AdminReportsPage() {
  const utilization = averageUtilizationRate([...DEMO_UTILIZATION]);
  const revenue = revenueByVehicle(
    DEMO_EARNINGS_LEDGER.map((row) => ({
      vehicleId: row.vehicle,
      vehicleLabel: row.vehicle,
      grossCents: row.grossCents,
    })),
  );
  const outstanding = outstandingBalances([...DEMO_OUTSTANDING_BALANCES]);
  const outstandingTotal = totalOutstandingCents([...DEMO_OUTSTANDING_BALANCES]);

  const gross = DEMO_EARNINGS_LEDGER.reduce((s, r) => s + r.grossCents, 0);
  const fees = DEMO_EARNINGS_LEDGER.reduce(
    (s, r) => s + r.managementFeeCents + r.processingFeeCents,
    0,
  );
  const net = DEMO_EARNINGS_LEDGER.reduce((s, r) => s + r.netCents, 0);

  return (
    <>
      <p className="eyebrow">Insights</p>
      <h1 className="section-title mt-4">Reports</h1>
      <p className="mt-3 max-w-xl text-mist">
        Platform KPIs from demo data via pure reporting helpers. Export and live warehouse queries
        come later.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Fleet utilization",
            value: `${Math.round(utilization * 100)}%`,
          },
          { label: "Gross volume", value: formatCents(gross) },
          { label: "Platform + processing", value: formatCents(fees) },
          { label: "Partner net", value: formatCents(net) },
        ].map((m) => (
          <div key={m.label} className="border border-line/60 bg-ink-soft p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-mist">{m.label}</p>
            <p className="display mt-3 text-3xl text-cream">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm uppercase tracking-[0.16em] text-gold">
            Revenue by vehicle
          </h2>
          <ul className="mt-4 space-y-0 border border-line/60">
            {revenue.map((row) => (
              <li
                key={row.vehicleId}
                className="flex items-center justify-between gap-3 border-b border-line/40 px-4 py-3 last:border-0"
              >
                <div>
                  <p className="text-cream">{row.vehicleLabel ?? row.vehicleId}</p>
                  <p className="mt-1 text-xs text-mist">
                    {Math.round(row.share * 100)}% of gross
                  </p>
                </div>
                <p className="text-gold-bright">{formatCents(row.grossCents)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-[0.16em] text-gold">
            Outstanding balances
          </h2>
          <p className="mt-2 text-sm text-mist">
            Total receivable{" "}
            <span className="text-cream">{formatCents(outstandingTotal)}</span>
          </p>
          <ul className="mt-4 space-y-0 border border-line/60">
            {outstanding.length === 0 ? (
              <li className="px-4 py-4 text-sm text-mist">No outstanding balances.</li>
            ) : (
              outstanding.map((row) => (
                <li
                  key={row.partyId}
                  className="flex items-center justify-between gap-3 border-b border-line/40 px-4 py-3 last:border-0"
                >
                  <p className="text-cream">{row.partyLabel ?? row.partyId}</p>
                  <p className="text-gold-bright">{formatCents(row.balanceCents)}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </>
  );
}
