import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { MarketingShell } from "@/components/MarketingShell";
import { VehicleCard } from "@/components/VehicleCard";
import {
  BRAND,
  FAQS,
  FEATURED_VEHICLES,
  GIG_USES,
  HOW_IT_WORKS_STEPS,
  PARTNER_BENEFITS,
  QUALIFICATION_STEPS,
  RENTER_BENEFITS,
  TESTIMONIALS,
} from "@/lib/content";

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="relative min-h-[100svh] overflow-hidden border-b border-line/40">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/og.png)" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-ink via-ink/88 to-ink/35"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50"
          aria-hidden
        />

        <div className="container-pm relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 sm:justify-center sm:pb-24">
          <p className="eyebrow reveal">Weekly vehicles for gig work</p>
          <h1 className="display reveal reveal-delay-1 mt-5 max-w-3xl text-5xl leading-[1.05] text-cream sm:text-6xl lg:text-7xl">
            Permanence Mobility
          </h1>
          <p className="reveal reveal-delay-2 mt-5 max-w-xl text-lg text-mist sm:text-xl">
            {BRAND.tagline} — premium weekly rentals for approved drivers, and a managed home for
            fleet partners who demand excellence.
          </p>
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-3">
            <Link href="/vehicles" className="btn-gold">
              Find a Gig Car
            </Link>
            <Link href="/partners" className="btn-ghost">
              List Your Vehicles
            </Link>
          </div>
        </div>
      </section>

      <section className="section border-b border-line/40">
        <div className="container-pm grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="eyebrow">Weekly search</p>
            <h2 className="section-title mt-4">Find a car for your next earning week.</h2>
            <p className="mt-4 max-w-xl text-mist">
              Browse approved vehicles by category and weekly rate. Full eligibility unlocks after
              renter approval.
            </p>
          </div>
          <form
            action="/vehicles"
            method="get"
            className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
          >
            <div>
              <label className="label" htmlFor="home-category">
                Category
              </label>
              <select id="home-category" name="category" className="field" defaultValue="">
                <option value="">Any category</option>
                <option value="Sedan">Sedan</option>
                <option value="Hybrid">Hybrid</option>
                <option value="SUV">SUV</option>
                <option value="Van">Van</option>
              </select>
            </div>
            <button type="submit" className="btn-gold sm:mb-0">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container-pm">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Featured fleet</p>
              <h2 className="section-title mt-4">Vehicles ready for the week.</h2>
            </div>
            <Link href="/vehicles" className="btn-link">
              View all vehicles →
            </Link>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_VEHICLES.slice(0, 3).map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                make={vehicle.make}
                model={vehicle.model}
                year={vehicle.year}
                weeklyRateCents={vehicle.weeklyRateCents}
                category={vehicle.category}
                location={vehicle.location}
                imageUrl={vehicle.imageUrl}
                href={`/vehicles/${vehicle.id}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section border-y border-line/40 bg-ink-soft/40">
        <div className="container-pm">
          <p className="eyebrow">How weekly rentals work</p>
          <h2 className="section-title mt-4 max-w-2xl">Four steps. One clear path.</h2>
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <li key={step.title} className="card-quiet">
                <span className="text-[11px] tracking-[0.2em] text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="display mt-4 text-2xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{step.body}</p>
              </li>
            ))}
          </ol>
          <Link href="/how-it-works" className="btn-link mt-10 inline-flex">
            Full process →
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container-pm">
          <p className="eyebrow">Built for gig work</p>
          <h2 className="section-title mt-4">Rideshare. Delivery. Courier.</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {GIG_USES.map((use) => (
              <article key={use.title} className="card-quiet">
                <h3 className="display text-2xl text-gold-bright">{use.title}</h3>
                <p className="mt-3 text-mist">{use.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-t border-line/40">
        <div className="container-pm grid gap-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow">For renters</p>
            <h2 className="section-title mt-4">A stronger week behind the wheel.</h2>
            <ul className="mt-10 space-y-8">
              {RENTER_BENEFITS.map((item) => (
                <li key={item.title} className="card-quiet">
                  <h3 className="text-lg text-cream">{item.title}</h3>
                  <p className="mt-2 text-mist">{item.body}</p>
                </li>
              ))}
            </ul>
            <Link href="/apply" className="btn-gold mt-10 inline-flex">
              Apply to rent
            </Link>
          </div>
          <div>
            <p className="eyebrow">For partners</p>
            <h2 className="section-title mt-4">List with standards intact.</h2>
            <ul className="mt-10 space-y-8">
              {PARTNER_BENEFITS.map((item) => (
                <li key={item.title} className="card-quiet">
                  <h3 className="text-lg text-cream">{item.title}</h3>
                  <p className="mt-2 text-mist">{item.body}</p>
                </li>
              ))}
            </ul>
            <Link href="/partners/apply" className="btn-ghost mt-10 inline-flex">
              Apply as a partner
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-ink-soft/50">
        <div className="container-pm grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow">Qualification</p>
            <h2 className="section-title mt-4">Approval before the keys.</h2>
            <p className="mt-4 text-mist">
              We review applications so every renter and every vehicle meets Permanence standards.
            </p>
            <Link href="/renter-requirements" className="btn-link mt-8 inline-flex">
              Renter requirements →
            </Link>
          </div>
          <ol className="space-y-6">
            {QUALIFICATION_STEPS.map((step, index) => (
              <li key={step} className="flex gap-5 border-t border-line pt-6">
                <span className="text-gold">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-cream">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container-pm overflow-hidden border border-line/50 bg-[linear-gradient(135deg,rgba(212,175,55,0.08),transparent_45%),#121212]">
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="eyebrow">Fleet partners</p>
              <h2 className="section-title mt-4">Put your vehicles to work—without lowering the bar.</h2>
              <p className="mt-4 max-w-xl text-mist">
                Permanence hosts independent fleet partners alongside our own fleet. Access is earned
                through review, not an open upload form.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/partners" className="btn-gold">
                Partner overview
              </Link>
              <Link href="/partner-requirements" className="btn-ghost">
                Partner requirements
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section border-t border-line/40">
        <div className="container-pm">
          <p className="eyebrow">Voices</p>
          <h2 className="section-title mt-4">Excellence, from both sides of the keys.</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <blockquote key={item.name} className="card-quiet">
                <p className="display text-2xl leading-snug text-cream">“{item.quote}”</p>
                <footer className="mt-6 text-sm text-mist">
                  <span className="text-gold">{item.name}</span>
                  <span className="mx-2 text-line">·</span>
                  {item.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-t border-line/40">
        <div className="container-pm grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="section-title mt-4">Questions, answered.</h2>
            <Link href="/faq" className="btn-link mt-8 inline-flex">
              See all FAQs →
            </Link>
          </div>
          <FaqAccordion items={FAQS.slice(0, 5)} />
        </div>
      </section>
    </MarketingShell>
  );
}
