import { DEMO_PARTNER_RESERVATIONS } from "@/lib/demo-data";
import { formatCents } from "@/lib/money";

export const metadata = {
  title: "Admin Reservations",
};

export default function AdminReservationsPage() {
  return (
    <>
      <p className="eyebrow">Bookings</p>
      <h1 className="section-title mt-4">Reservations</h1>
      <p className="mt-3 max-w-xl text-mist">
        Cross-tenant view of holds and confirmed weekly rentals (demo sample).
      </p>

      <div className="mt-10 overflow-x-auto border border-line/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line/60 bg-ink-soft text-xs uppercase tracking-[0.14em] text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Renter</th>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Rate</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_PARTNER_RESERVATIONS.map((r) => (
              <tr key={r.id} className="border-b border-line/40 last:border-0">
                <td className="px-4 py-4 font-mono text-xs text-mist">{r.id}</td>
                <td className="px-4 py-4 text-cream">{r.vehicle}</td>
                <td className="px-4 py-4 text-mist">{r.renter}</td>
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
