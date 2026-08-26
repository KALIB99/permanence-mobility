import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { RENTER_REQUIREMENTS } from "@/lib/content";

export const metadata = {
  title: "Renter Requirements",
  description: "What you need to qualify as a Permanence Mobility renter.",
};

export default function RenterRequirementsPage() {
  return (
    <MarketingShell>
      <section className="section pt-14">
        <div className="container-pm max-w-3xl">
          <p className="eyebrow">Renters</p>
          <h1 className="section-title mt-4">Renter requirements</h1>
          <p className="mt-4 text-mist">
            We approve people, not just accounts. Bring the following so review can move quickly.
          </p>
          <ul className="mt-12 space-y-4">
            {RENTER_REQUIREMENTS.map((item) => (
              <li key={item} className="border-t border-line pt-4 text-cream">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/apply" className="btn-gold">
              Start application
            </Link>
            <Link href="/how-it-works" className="btn-ghost">
              How it works
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
