import { FaqAccordion } from "@/components/FaqAccordion";
import { MarketingShell } from "@/components/MarketingShell";
import { FAQS } from "@/lib/content";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Permanence Mobility.",
};

export default function FaqPage() {
  return (
    <MarketingShell>
      <section className="section pt-14">
        <div className="container-pm grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Support</p>
            <h1 className="section-title mt-4">FAQ</h1>
            <p className="mt-4 text-mist">
              Still need a human? Reach us through the contact page—we respond to serious inquiries.
            </p>
          </div>
          <FaqAccordion items={FAQS} />
        </div>
      </section>
    </MarketingShell>
  );
}
