import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/MarketingShell";
import { FEATURED_VEHICLES } from "@/lib/content";
import { formatCents } from "@/lib/money";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return FEATURED_VEHICLES.map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const vehicle = FEATURED_VEHICLES.find((v) => v.id === id);
  if (!vehicle) return { title: "Vehicle" };
  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    description: vehicle.description,
  };
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const vehicle = FEATURED_VEHICLES.find((v) => v.id === id);
  if (!vehicle) notFound();

  return (
    <MarketingShell>
      <section className="relative min-h-[42vh] overflow-hidden border-b border-line/40">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/og.png)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" aria-hidden />
        <div className="container-pm relative flex min-h-[42vh] flex-col justify-end pb-12 pt-24">
          <p className="eyebrow">{vehicle.category}</p>
          <h1 className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="mt-4 text-gold-bright">
            {formatCents(vehicle.weeklyRateCents, { compact: true })}
            <span className="text-mist"> / week</span>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-pm grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="prose-pm">
            <p>{vehicle.description}</p>
            <h2>Details</h2>
            <ul className="list-none space-y-3 p-0 text-mist">
              <li>
                <span className="text-cream">Location:</span> {vehicle.location}
              </li>
              {vehicle.seats ? (
                <li>
                  <span className="text-cream">Seats:</span> {vehicle.seats}
                </li>
              ) : null}
              {vehicle.transmission ? (
                <li>
                  <span className="text-cream">Transmission:</span> {vehicle.transmission}
                </li>
              ) : null}
              {vehicle.eligibility?.length ? (
                <li>
                  <span className="text-cream">Typical uses:</span>{" "}
                  {vehicle.eligibility.join(", ")}
                </li>
              ) : null}
            </ul>
            <h2>Before you book</h2>
            <p>
              Booking requires an approved renter profile. Apply first, then return to reserve a
              weekly start date once your eligibility is confirmed.
            </p>
          </div>

          <aside className="h-fit border border-line/60 bg-ink-soft p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-gold">Next step</p>
            <h2 className="display mt-3 text-3xl">Ready for this week?</h2>
            <p className="mt-3 text-sm text-mist">
              Approved renters can place a twenty-minute weekly hold. Apply first if you are new.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link href={`/book/${vehicle.id}`} className="btn-gold">
                Book weekly rental
              </Link>
              <Link href="/apply" className="btn-ghost">
                Apply to rent
              </Link>
              <Link href="/vehicles" className="btn-ghost">
                Back to search
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </MarketingShell>
  );
}
