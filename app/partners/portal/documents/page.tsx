import { DEMO_DOCUMENTS } from "@/lib/demo-data";

export const metadata = {
  title: "Partner Documents",
};

export default function PartnerDocumentsPage() {
  return (
    <>
      <p className="eyebrow">Compliance</p>
      <h1 className="section-title mt-4">Documents</h1>
      <p className="mt-3 max-w-xl text-mist">
        Insurance, registration, and tax forms on file for your partner organization.
      </p>

      <ul className="mt-10 space-y-0 border border-line/60">
        {DEMO_DOCUMENTS.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-line/40 px-4 py-4 last:border-0"
          >
            <div>
              <p className="text-cream">{doc.name}</p>
              <p className="mt-1 text-sm text-mist">Updated {doc.updatedAt}</p>
            </div>
            <p className="text-sm capitalize text-mist">{doc.status.replaceAll("_", " ")}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 border border-dashed border-line/60 bg-ink-soft p-6">
        <p className="text-sm text-mist">
          Upload UI connects to Supabase Storage with signed URLs in a later ops pass. For now,
          email documents to operations after partner approval.
        </p>
      </div>
    </>
  );
}
