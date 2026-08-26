import { BRAND } from "@/lib/content";

export const metadata = {
  title: "Renter Support",
};

export default function RenterSupportPage() {
  return (
    <>
      <p className="eyebrow">Help</p>
      <h1 className="section-title mt-4">Support</h1>
      <p className="mt-3 max-w-xl text-mist">
        Operations stays close for pickups, mid-week issues, and renewal questions.
      </p>

      <div className="mt-10 border border-line/60 bg-ink-soft p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Contact</p>
        <p className="mt-3 text-cream">{BRAND.email}</p>
        <p className="mt-2 text-sm text-mist">{BRAND.location}</p>
        <p className="mt-6 text-sm text-mist">
          For roadside emergencies, call the number in your rental agreement first. For billing or
          document questions, email support with your reservation public ID.
        </p>
      </div>
    </>
  );
}
