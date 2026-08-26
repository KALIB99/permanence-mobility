import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { PRICING_PARTNER, PRICING_RENTER } from "@/lib/content";

export const metadata = {
  title: "Pricing",
  description: "Weekly renter rates and fleet partner economics.",
};

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="section pb-10 pt-14">
        <div className="container-pm max-w-3xl">
          <p className="eyebrow">Pricing</p>
          <h1 className="section-title mt-4">Clear weeks. Clear economics.</h1>
          <p className="mt-4 text-mist">
            Vehicle pages show weekly rates in USD. Partner fees follow your agreement after
            approval.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-pm grid gap-16 lg:grid-cols-2">
          <div>
            <h2 className="display text-3xl text-gold-bright">For renters</h2>
            <ul className="mt-8 space-y-8">
              {PRICING_RENTER.map((item) => (
                <li key={item.title} className="card-quiet">
                  <h3 className="text-lg text-cream">{item.title}</h3>
                  <p className="mt-2 text-mist">{item.body}</p>
                </li>
              ))}
            </ul>
            <Link href="/vehicles" className="btn-gold mt-10 inline-flex">
              Browse weekly rates
            </Link>
          </div>
          <div>
            <h2 className="display text-3xl text-gold-bright">For partners</h2>
            <ul className="mt-8 space-y-8">
              {PRICING_PARTNER.map((item) => (
                <li key={item.title} className="card-quiet">
                  <h3 className="text-lg text-cream">{item.title}</h3>
                  <p className="mt-2 text-mist">{item.body}</p>
                </li>
              ))}
            </ul>
            <Link href="/partners/apply" className="btn-ghost mt-10 inline-flex">
              Discuss partnership
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
