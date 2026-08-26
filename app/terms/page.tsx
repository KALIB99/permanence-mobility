import { MarketingShell } from "@/components/MarketingShell";
import { BRAND } from "@/lib/content";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <section className="section pt-14">
        <div className="container-pm prose-pm">
          <p className="eyebrow !mb-0">Legal</p>
          <h1 className="section-title !mt-4">Terms of Service</h1>
          <p>
            These terms govern use of the {BRAND.name} website and platform. By accessing the site
            or submitting an application, you agree to these terms.
          </p>
          <h2>Accounts & eligibility</h2>
          <p>
            Renter and partner access is invitation- or approval-based. Providing accurate
            information is required. We may suspend or terminate access for fraud, policy
            violations, or safety concerns.
          </p>
          <h2>Weekly rentals</h2>
          <p>
            Rentals are offered in seven-day periods. Rates, deposits, and obligations are confirmed
            in your rental agreement at booking. Demo inventory on this marketing site is illustrative
            until live inventory is connected.
          </p>
          <h2>Fleet partners</h2>
          <p>
            Partners may not publish vehicles until both the organization and each vehicle are
            approved. Fee schedules and payout timing are defined in your partner agreement.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about these terms:{" "}
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
