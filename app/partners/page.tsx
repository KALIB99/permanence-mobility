import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { PARTNER_BENEFITS, PARTNER_REQUIREMENTS } from "@/lib/content";

export const metadata = {
  title: "List Your Vehicles",
  description: "Become a Permanence Mobility fleet partner.",
};

export default function PartnersPage() {
  return (
    <MarketingShell>
      <section className="relative min-h-[70vh] overflow-hidden border-b border-line/40">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/og.png)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/45" aria-hidden />
        <div className="container-pm relative flex min-h-[70vh] flex-col justify-end pb-16 pt-28">
          <p className="eyebrow reveal">Fleet partners</p>
          <h1 className="display reveal reveal-delay-1 mt-4 max-w-3xl text-5xl sm:text-6xl">
            Permanence Mobility
          </h1>
          <p className="reveal reveal-delay-2 mt-5 max-w-xl text-lg text-mist">
            List your vehicles with a platform that screens renters, reviews every unit, and protects
            the standard your fleet deserves.
          </p>
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-3">
            <Link href="/partners/apply" className="btn-gold">
              Apply as a partner
            </Link>
            <Link href="/partner-requirements" className="btn-ghost">
              Requirements
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-pm">
          <p className="eyebrow">Why partner</p>
          <h2 className="section-title mt-4">Demand with discipline.</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {PARTNER_BENEFITS.map((item) => (
              <article key={item.title} className="card-quiet">
                <h3 className="display text-2xl text-gold-bright">{item.title}</h3>
                <p className="mt-3 text-mist">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-t border-line/40 bg-ink-soft/40">
        <div className="container-pm grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">At a glance</p>
            <h2 className="section-title mt-4">What we look for</h2>
            <ul className="mt-8 space-y-4">
              {PARTNER_REQUIREMENTS.slice(0, 4).map((item) => (
                <li key={item} className="border-t border-line pt-4 text-cream">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="self-end">
            <p className="text-mist">
              Portal tools for portfolio, vehicles, and team invites unlock only after your
              organization is approved.
            </p>
            <Link href="/partners/apply" className="btn-gold mt-8 inline-flex">
              Start partner application
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
