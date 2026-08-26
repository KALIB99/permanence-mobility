import { MarketingShell } from "@/components/MarketingShell";
import { BRAND } from "@/lib/content";

export const metadata = {
  title: "Cancellation Policy",
};

export default function CancellationPage() {
  return (
    <MarketingShell>
      <section className="section pt-14">
        <div className="container-pm prose-pm">
          <p className="eyebrow !mb-0">Legal</p>
          <h1 className="section-title !mt-4">Cancellation Policy</h1>
          <p>
            Weekly reservations use short checkout holds and confirmed bookings. This policy
            summarizes how changes work; your rental agreement controls if terms differ.
          </p>
          <h2>Checkout holds</h2>
          <p>
            Unconfirmed holds expire automatically (default twenty minutes). Expired holds free the
            vehicle for other approved renters.
          </p>
          <h2>Confirmed weekly rentals</h2>
          <p>
            Changes or early returns may affect deposits, remaining weekly charges, and eligibility
            for future bookings. Contact operations as soon as circumstances change.
          </p>
          <h2>Partners</h2>
          <p>
            Removing availability for an active reservation requires Permanence coordination so
            renters are not stranded mid-week.
          </p>
          <h2>Questions</h2>
          <p>
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
