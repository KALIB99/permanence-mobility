import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { PARTNER_REQUIREMENTS } from "@/lib/content";

export const metadata = {
  title: "Partner Requirements",
  description: "Requirements to list vehicles with Permanence Mobility.",
};

export default function PartnerRequirementsPage() {
  return (
    <MarketingShell>
      <section className="section pt-14">
        <div className="container-pm max-w-3xl">
          <p className="eyebrow">Partners</p>
          <h1 className="section-title mt-4">Partner requirements</h1>
          <p className="mt-4 text-mist">
            Fleet partnerships are earned. Prepare documentation before you apply.
          </p>
          <ul className="mt-12 space-y-4">
            {PARTNER_REQUIREMENTS.map((item) => (
              <li key={item} className="border-t border-line pt-4 text-cream">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/partners/apply" className="btn-gold">
              Partner application
            </Link>
            <Link href="/partners" className="btn-ghost">
              Partner overview
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
