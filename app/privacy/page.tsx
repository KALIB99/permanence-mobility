import { MarketingShell } from "@/components/MarketingShell";
import { BRAND } from "@/lib/content";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <section className="section pt-14">
        <div className="container-pm prose-pm">
          <p className="eyebrow !mb-0">Legal</p>
          <h1 className="section-title !mt-4">Privacy Policy</h1>
          <p>
            {BRAND.name} collects information you submit through applications, contact forms, and
            account registration to evaluate eligibility, operate rentals, and communicate with you.
          </p>
          <h2>What we collect</h2>
          <p>
            Contact details, license and driving-history information, business documentation for
            partners, payment-related identifiers via Stripe, and usage data needed to secure the
            platform.
          </p>
          <h2>How we use it</h2>
          <p>
            To review applications, manage reservations, process payments and payouts, prevent fraud,
            and improve operations. We do not sell personal information.
          </p>
          <h2>Sharing</h2>
          <p>
            We share data with service providers (e.g. Supabase, Stripe, email/SMS vendors) under
            contractual safeguards, and when required by law.
          </p>
          <h2>Contact</h2>
          <p>
            Privacy questions: <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
