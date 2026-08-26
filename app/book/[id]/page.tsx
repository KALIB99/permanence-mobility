import Link from "next/link";
import { notFound } from "next/navigation";
import { BookForm } from "@/components/BookForm";
import { MarketingShell } from "@/components/MarketingShell";
import { FEATURED_VEHICLES } from "@/lib/content";
import { demoDepositCents } from "@/lib/demo-data";
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
  if (!vehicle) return { title: "Book" };
  return {
    title: `Book ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    description: `Reserve weekly periods for the ${vehicle.year} ${vehicle.make} ${vehicle.model}.`,
  };
}

export default async function BookVehiclePage({ params }: PageProps) {
  const { id } = await params;
  const vehicle = FEATURED_VEHICLES.find((v) => v.id === id);
  if (!vehicle) notFound();

  const depositCents = demoDepositCents(vehicle.weeklyRateCents);

  return (
    <MarketingShell>
      <section className="section pb-8 pt-14">
        <div className="container-pm max-w-3xl">
          <p className="eyebrow">Weekly rental</p>
          <h1 className="section-title mt-4">Book your weeks</h1>
          <p className="mt-4 text-mist">
            Choose a start date and length. We authorize a deposit hold and reserve the vehicle for
            twenty minutes while you confirm.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-pm grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="prose-pm">
            <h2>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
            <p>{vehicle.description}</p>
            <ul className="list-none space-y-3 p-0 text-mist">
              <li>
                <span className="text-cream">Location:</span> {vehicle.location}
              </li>
              <li>
                <span className="text-cream">Weekly rate:</span>{" "}
                {formatCents(vehicle.weeklyRateCents)}
              </li>
              <li>
                <span className="text-cream">Deposit:</span> {formatCents(depositCents)}
              </li>
            </ul>
            <p>
              Need approval first?{" "}
              <Link href="/apply" className="text-gold hover:text-gold-bright">
                Apply to rent
              </Link>
              .
            </p>
          </div>

          <BookForm
            vehicle={{
              id: vehicle.id,
              label: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              weeklyRateCents: vehicle.weeklyRateCents,
              depositCents,
              location: vehicle.location,
            }}
          />
        </div>
      </section>
    </MarketingShell>
  );
}
