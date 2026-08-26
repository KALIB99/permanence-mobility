import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DEMO_RENTER_RENTALS } from "@/lib/demo-data";

export const metadata = {
  title: "Renter Portal",
};

export default async function RenterPortalPage() {
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

  const active = DEMO_RENTER_RENTALS.filter((r) => r.status === "confirmed");

  return (
    <>
      <p className="eyebrow">Renter</p>
      <h1 className="section-title mt-4">Your weeks</h1>
      <p className="mt-4 max-w-2xl text-mist">
        Active reservations, renewals, documents, and support — unlock fully after approval.
      </p>

      <div className="mt-8 border border-line/60 bg-ink-soft p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Signed in as</p>
        <p className="mt-2 text-cream">{email ?? "Unknown"}</p>
        {note ? <p className="mt-2 text-sm text-mist">{note}</p> : null}
      </div>

      <div className="mt-10">
        <h2 className="display text-2xl">Upcoming</h2>
        {active.length === 0 ? (
          <p className="mt-4 text-mist">No confirmed rentals yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {active.map((r) => (
              <li key={r.id} className="border border-line/60 bg-ink-soft px-4 py-4">
                <p className="text-cream">{r.vehicle}</p>
                <p className="mt-1 text-sm text-mist">
                  {r.startDate} → {r.endDate}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/vehicles" className="btn-gold">
          Browse vehicles
        </Link>
        <Link href="/renter/application" className="btn-ghost">
          Application status
        </Link>
        <Link href="/apply" className="btn-ghost">
          Complete application
        </Link>
      </div>
    </>
  );
}
