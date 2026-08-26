import Link from "next/link";
import { loadRenterSessionContext } from "@/lib/renter-session";

export const metadata = {
  title: "Application Status",
};

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}

function displayStatus(applicationStatus: string | null, renterStatus: string | null): string {
  if (applicationStatus) return formatStatus(applicationStatus);
  if (renterStatus) return formatStatus(renterStatus);
  return "Not submitted";
}

function statusMessage(applicationStatus: string | null, renterStatus: string | null): string {
  const status = applicationStatus ?? renterStatus;
  switch (status) {
    case "approved":
    case "active":
      return "You can browse eligible vehicles and place weekly holds. Keep documents current to avoid booking interruptions.";
    case "in_review":
      return "Our team is reviewing your application. We may request additional documents before approval.";
    case "rejected":
      return "Your application was not approved. Contact support if you believe this is an error.";
    case "submitted":
      return "Your application is in the queue. We typically review new applicants within one business day.";
    default:
      return "Submit an application to begin the renter onboarding process.";
  }
}

function stepComplete(step: number, applicationStatus: string | null, renterStatus: string | null): boolean {
  const status = applicationStatus ?? renterStatus;
  if (step === 1) return Boolean(status && status !== "draft");
  if (step === 2) return status === "in_review" || status === "approved" || status === "active";
  if (step === 3) return status === "approved" || status === "active";
  return false;
}

export default async function RenterApplicationPage() {
  const session = await loadRenterSessionContext();
  const applicationStatus = session.application?.status ?? null;
  const renterStatus = session.renterStatus;
  const headline = displayStatus(applicationStatus, renterStatus);
  const effectiveStatus = applicationStatus ?? renterStatus;
  const canBook = effectiveStatus === "approved" || effectiveStatus === "active";

  return (
    <>
      <p className="eyebrow">Onboarding</p>
      <h1 className="section-title mt-4">Application status</h1>
      <p className="mt-3 max-w-xl text-mist">
        {session.userId
          ? "Your current renter onboarding status from Supabase."
          : "Sign in to view your live application status."}
      </p>

      <div className="mt-10 border border-line/60 bg-ink-soft p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Current status</p>
        <p className="display mt-3 text-3xl">{headline}</p>
        <p className="mt-3 text-mist">{statusMessage(applicationStatus, renterStatus)}</p>
        {session.application?.reviewNotes ? (
          <p className="mt-4 rounded-sm border border-line/60 bg-ink px-4 py-3 text-sm text-mist">
            <span className="text-gold">Review note:</span> {session.application.reviewNotes}
          </p>
        ) : null}
        <ol className="mt-8 space-y-3 text-sm text-mist">
          <li className={stepComplete(1, applicationStatus, renterStatus) ? "text-cream" : ""}>
            1. Application submitted
          </li>
          <li className={stepComplete(2, applicationStatus, renterStatus) ? "text-cream" : ""}>
            2. Documents reviewed
          </li>
          <li className={stepComplete(3, applicationStatus, renterStatus) ? "text-cream" : ""}>
            3. Approved for weekly bookings
          </li>
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          {canBook ? (
            <Link href="/vehicles" className="btn-gold">
              Find a Gig Car
            </Link>
          ) : (
            <Link href="/apply" className="btn-gold">
              Apply to rent
            </Link>
          )}
          <Link href="/renter/documents" className="btn-ghost">
            View documents
          </Link>
          {!session.userId ? (
            <Link href="/login" className="btn-ghost">
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}
