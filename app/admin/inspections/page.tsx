import { DEMO_INSPECTIONS } from "@/lib/demo-data";

export const metadata = {
  title: "Admin Inspections",
};

export default function AdminInspectionsPage() {
  const pending = DEMO_INSPECTIONS.filter(
    (i) => i.status === "submitted" || i.status === "draft",
  );

  return (
    <>
      <p className="eyebrow">Operations</p>
      <h1 className="section-title mt-4">Inspection queue</h1>
      <p className="mt-3 max-w-xl text-mist">
        Pickup and return inspections awaiting review. Demo queue for ops walkthroughs.
      </p>

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <p className="text-mist">
          Open{" "}
          <span className="text-gold-bright">{pending.length}</span>
        </p>
        <p className="text-mist">
          Total{" "}
          <span className="text-cream">{DEMO_INSPECTIONS.length}</span>
        </p>
      </div>

      <ul className="mt-8 space-y-0 border border-line/60">
        {DEMO_INSPECTIONS.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-line/40 px-4 py-4 last:border-0 sm:px-6"
          >
            <div>
              <p className="text-cream">{item.vehicle}</p>
              <p className="mt-1 text-sm text-mist">
                {item.renter} · {item.type}
                {item.odometer != null
                  ? ` · ${item.odometer.toLocaleString()} mi`
                  : ""}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-mist">
                {new Date(item.scheduledAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p
                className={`mt-1 capitalize ${
                  item.status === "submitted"
                    ? "text-gold-bright"
                    : item.status === "draft"
                      ? "text-mist"
                      : "text-cream"
                }`}
              >
                {item.status.replace("_", " ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
