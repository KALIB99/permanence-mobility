import Link from "next/link";
import { DEMO_PARTNER_VEHICLES } from "@/lib/demo-data";
import { formatCents } from "@/lib/money";

export const metadata = {
  title: "Partner Vehicles",
};

export default function PartnerVehiclesPage() {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fleet</p>
          <h1 className="section-title mt-4">Vehicles</h1>
          <p className="mt-3 max-w-xl text-mist">
            Listings stay draft or pending until Permanence approves each vehicle.
          </p>
        </div>
        <Link href="/partners/portal/vehicles/new" className="btn-gold">
          Add vehicle
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto border border-line/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line/60 bg-ink-soft text-xs uppercase tracking-[0.14em] text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Weekly</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_PARTNER_VEHICLES.map((v) => (
              <tr key={v.id} className="border-b border-line/40 last:border-0">
                <td className="px-4 py-4 text-cream">
                  {v.year} {v.make} {v.model}
                  <p className="mt-1 text-xs text-mist">{v.plate}</p>
                </td>
                <td className="px-4 py-4 text-mist">{v.location}</td>
                <td className="px-4 py-4 text-gold-bright">
                  {formatCents(v.weeklyRateCents, { compact: true })}
                </td>
                <td className="px-4 py-4 capitalize text-mist">
                  {v.status.replaceAll("_", " ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
