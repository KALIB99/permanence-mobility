import { RenterApplicationActions } from "@/components/RenterApplicationActions";
import { loadAdminRenters } from "@/lib/admin-data";

export const metadata = {
  title: "Admin Renters",
};

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}

export default async function AdminRentersPage() {
  const { renters, applications, usingDemoFallback } = await loadAdminRenters();

  return (
    <>
      <p className="eyebrow">People</p>
      <h1 className="section-title mt-4">Renters</h1>
      <p className="mt-3 max-w-xl text-mist">
        Application lifecycle from applicant through active weekly driver.
        {usingDemoFallback
          ? " Showing sample roster until live renter profiles exist."
          : " Live renter profiles from Supabase."}
      </p>

      {applications.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xs uppercase tracking-[0.16em] text-gold">Pending applications</h2>
          <ul className="mt-4 space-y-4">
            {applications.map((app) => (
              <li key={app.id} className="border border-line/60 bg-ink-soft p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="display text-2xl text-cream">{app.name}</p>
                    <p className="mt-2 text-sm text-mist">
                      {app.email} · {app.city} · Submitted {app.submittedAt}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-gold">
                      {formatStatus(app.status)}
                      {app.isDemo ? " · sample" : ""}
                    </p>
                  </div>
                  <RenterApplicationActions id={app.id} status={app.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 overflow-x-auto border border-line/60">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line/60 bg-ink-soft text-xs uppercase tracking-[0.14em] text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {renters.map((r) => (
              <tr key={r.id} className="border-b border-line/40 last:border-0">
                <td className="px-4 py-4 text-cream">
                  {r.name}
                  {r.isDemo ? <span className="ml-2 text-xs text-mist">(sample)</span> : null}
                </td>
                <td className="px-4 py-4 text-mist">{r.email}</td>
                <td className="px-4 py-4 text-mist">{r.city}</td>
                <td className="px-4 py-4 capitalize text-mist">{formatStatus(r.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
