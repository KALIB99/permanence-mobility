import { DEMO_RENTER_PAYMENTS } from "@/lib/demo-data";
import { formatCents } from "@/lib/money";

export const metadata = {
  title: "Renter Payments",
};

export default function RenterPaymentsPage() {
  return (
    <>
      <p className="eyebrow">Billing</p>
      <h1 className="section-title mt-4">Payments</h1>
      <p className="mt-3 max-w-xl text-mist">
        Weekly charges and deposit authorizations. Card details are never stored on Permanence
        servers.
      </p>

      <ul className="mt-10 space-y-0 border border-line/60">
        {DEMO_RENTER_PAYMENTS.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-line/40 px-4 py-4 last:border-0"
          >
            <div>
              <p className="text-cream">{p.label}</p>
              <p className="mt-1 text-sm text-mist">{p.paidAt}</p>
            </div>
            <div className="text-right">
              <p className="text-gold-bright">{formatCents(p.amountCents)}</p>
              <p className="mt-1 text-sm capitalize text-mist">{p.status}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
