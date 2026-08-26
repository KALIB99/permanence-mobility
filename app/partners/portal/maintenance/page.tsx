import { DEMO_MAINTENANCE } from "@/lib/demo-data";

export const metadata = {
  title: "Partner Maintenance",
};

export default function PartnerMaintenancePage() {
  return (
    <>
      <p className="eyebrow">Operations</p>
      <h1 className="section-title mt-4">Maintenance</h1>
      <p className="mt-3 max-w-xl text-mist">
        Upcoming service work and overdue items for vehicles in your portfolio.
      </p>

      <ul className="mt-10 space-y-0 border border-line/60">
        {DEMO_MAINTENANCE.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-line/40 px-4 py-4 last:border-0"
          >
            <div>
              <p className="text-cream">{item.type}</p>
              <p className="mt-1 text-sm text-mist">{item.vehicle}</p>
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
