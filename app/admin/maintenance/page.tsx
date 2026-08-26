import { DEMO_MAINTENANCE } from "@/lib/demo-data";

export const metadata = {
  title: "Admin Maintenance",
};

export default function AdminMaintenancePage() {
  const overdue = DEMO_MAINTENANCE.filter((m) => m.status === "overdue");
  const due = DEMO_MAINTENANCE.filter((m) => m.status !== "overdue");
  const ordered = [...overdue, ...due];

  return (
    <>
      <p className="eyebrow">Fleet health</p>
      <h1 className="section-title mt-4">Maintenance</h1>
      <p className="mt-3 max-w-xl text-mist">
        Due and overdue service across partner and Permanence-owned fleets.
      </p>

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <p className="text-mist">
          Overdue{" "}
          <span className="text-gold-bright">{overdue.length}</span>
        </p>
        <p className="text-mist">
          Scheduled{" "}
          <span className="text-cream">{due.length}</span>
        </p>
      </div>

      <ul className="mt-8 space-y-0 border border-line/60">
        {ordered.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-line/40 px-4 py-4 last:border-0 sm:px-6"
          >
            <div>
              <p className="text-cream">{item.type}</p>
              <p className="mt-1 text-sm text-mist">
                {item.vehicle} · {item.partner}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-mist">Due {item.dueDate}</p>
              <p
                className={`mt-1 capitalize ${
                  item.status === "overdue" ? "text-gold-bright" : "text-mist"
                }`}
              >
                {item.status}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
