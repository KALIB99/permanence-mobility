import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  DEMO_EARNINGS_LEDGER,
  DEMO_PARTNER_RESERVATIONS,
  DEMO_PARTNER_VEHICLES,
} from "@/lib/demo-data";
import { formatCents } from "@/lib/money";

export const metadata = {
  title: "Partner Portal",
};

export default async function PartnerPortalPage() {
  let email: string | null = null;
  let note: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  } catch {
    note = "Supabase is not fully configured in this environment.";
  }

  const approved = DEMO_PARTNER_VEHICLES.filter((v) => v.status === "approved").length;
  const pending = DEMO_PARTNER_VEHICLES.filter((v) => v.status === "pending_approval").length;
  const activeRes = DEMO_PARTNER_RESERVATIONS.filter((r) => r.status === "confirmed").length;
  const netSample = DEMO_EARNINGS_LEDGER.reduce((sum, row) => sum + row.netCents, 0);

  return (
    <>
      <p className="eyebrow">Fleet partner</p>
      <h1 className="section-title mt-4">Portfolio overview</h1>
      <p className="mt-4 max-w-2xl text-mist">
        Track vehicles, weekly reservations, maintenance, and net earnings. Demo data is shown until
        your organization is synced from Supabase.
      </p>

      <div className="mt-8 border border-line/60 bg-ink-soft p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Signed in as</p>
        <p className="mt-2 text-cream">{email ?? "Unknown"}</p>
        {note ? <p className="mt-2 text-sm text-mist">{note}</p> : null}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Approved vehicles", value: String(approved) },
          { label: "Pending approval", value: String(pending) },
          { label: "Active reservations", value: String(activeRes) },
          { label: "Sample net", value: formatCents(netSample, { compact: true }) },
        ].map((metric) => (
          <div key={metric.label} className="border border-line/60 bg-ink-soft p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-mist">{metric.label}</p>
            <p className="display mt-3 text-3xl text-cream">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/partners/portal/vehicles/new" className="btn-gold">
          Add vehicle
        </Link>
        <Link href="/partners/portal/reservations" className="btn-ghost">
          View reservations
        </Link>
        <Link href="/partners/portal/earnings" className="btn-ghost">
          Earnings ledger
        </Link>
      </div>
    </>
  );
}
