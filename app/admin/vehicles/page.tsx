import { VehicleApprovalActions } from "@/components/VehicleApprovalActions";
import { loadAdminVehicleApprovals } from "@/lib/admin-data";

export const metadata = {
  title: "Admin Vehicles",
};

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}

export default async function AdminVehiclesPage() {
  const { vehicles, usingDemoFallback } = await loadAdminVehicleApprovals();

  return (
    <>
      <p className="eyebrow">Approvals</p>
      <h1 className="section-title mt-4">Vehicle approval queue</h1>
      <p className="mt-3 max-w-xl text-mist">
        Partner vehicles awaiting Permanence review before marketplace listing.
        {usingDemoFallback
          ? " Showing sample queue until live pending vehicles exist."
          : " Live pending vehicles from Supabase."}
      </p>

      {vehicles.length === 0 ? (
        <p className="mt-10 text-mist">Queue is empty.</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {vehicles.map((v) => (
            <li key={v.id} className="border border-line/60 bg-ink-soft p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="display text-2xl text-cream">{v.label}</p>
                  <p className="mt-2 text-sm text-mist">
                    {v.partner} · {v.location} · {v.weeklyRate}/week
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-gold">
                    {formatStatus(v.status)}
                    {v.isDemo ? " · sample" : ""}
                  </p>
                </div>
                <VehicleApprovalActions id={v.id} status={v.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
