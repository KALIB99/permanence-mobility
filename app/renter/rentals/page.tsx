import { DEMO_RENTER_RENTALS } from "@/lib/demo-data";
import { formatCents } from "@/lib/money";

export const metadata = {
  title: "Renter Rentals",
};

export default function RenterRentalsPage() {
  return (
    <>
      <p className="eyebrow">History</p>
      <h1 className="section-title mt-4">Rentals</h1>
      <p className="mt-3 max-w-xl text-mist">Past and current weekly reservations.</p>

      <div className="mt-10 overflow-x-auto border border-line/60">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line/60 bg-ink-soft text-xs uppercase tracking-[0.14em] text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Rate</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_RENTER_RENTALS.map((r) => (
              <tr key={r.id} className="border-b border-line/40 last:border-0">
                <td className="px-4 py-4 text-cream">{r.vehicle}</td>
                <td className="px-4 py-4 text-mist">
                  {r.startDate} → {r.endDate}
                </td>
                <td className="px-4 py-4 text-gold-bright">
                  {formatCents(r.weeklyRateCents, { compact: true })}
                </td>
                <td className="px-4 py-4 capitalize text-mist">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
