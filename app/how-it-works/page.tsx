import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { HOW_IT_WORKS_STEPS, QUALIFICATION_STEPS } from "@/lib/content";

export const metadata = {
  title: "How It Works",
  description: "How Permanence Mobility weekly rentals and approvals work.",
};

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <section className="section pb-10 pt-14">
        <div className="container-pm max-w-3xl">
          <p className="eyebrow">How it works</p>
          <h1 className="section-title mt-4">From application to your next earning week.</h1>
          <p className="mt-4 text-mist">
            Permanence is built around exact seven-day rental periods, approved renters, and
            reviewed vehicles—not open marketplace chaos.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-pm grid gap-10 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <article key={step.title} className="card-quiet">
              <span className="text-[11px] tracking-[0.2em] text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="display mt-4 text-3xl">{step.title}</h2>
              <p className="mt-3 text-mist">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section border-t border-line/40 bg-ink-soft/40">
        <div className="container-pm grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Qualification</p>
            <h2 className="section-title mt-4">What happens after you apply</h2>
            <ol className="mt-10 space-y-5">
              {QUALIFICATION_STEPS.map((step, i) => (
                <li key={step} className="flex gap-4 border-t border-line pt-5">
                  <span className="text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-cream">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-6 self-end">
            <p className="text-mist">
              Partners follow a parallel path: business review, then vehicle-by-vehicle approval
              before any listing goes live.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/apply" className="btn-gold">
                Apply as a renter
              </Link>
              <Link href="/partners/apply" className="btn-ghost">
                Apply as a partner
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
