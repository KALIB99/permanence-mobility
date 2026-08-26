import { DEMO_RENTER_DOCUMENTS } from "@/lib/demo-data";
import { loadRenterSessionContext } from "@/lib/renter-session";

export const metadata = {
  title: "Renter Documents",
};

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}

export default async function RenterDocumentsPage() {
  const session = await loadRenterSessionContext();
  const documents =
    session.documents.length > 0
      ? session.documents
      : session.userId
        ? []
        : DEMO_RENTER_DOCUMENTS.map((doc) => ({ ...doc, updatedAt: "" }));

  return (
    <>
      <p className="eyebrow">Compliance</p>
      <h1 className="section-title mt-4">Documents</h1>
      <p className="mt-3 max-w-xl text-mist">
        License, residence proof, and gig-platform confirmations on file for your account.
        {session.documents.length > 0
          ? " Live documents from Supabase."
          : session.userId
            ? " No documents uploaded yet."
            : " Sign in to view your documents, or browse the sample list below."}
      </p>

      {documents.length === 0 ? (
        <p className="mt-10 text-mist">
          No documents on file yet. Complete your application and upload required files when prompted.
        </p>
      ) : (
        <ul className="mt-10 space-y-0 border border-line/60">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-line/40 px-4 py-4 last:border-0"
            >
              <p className="text-cream">{doc.name}</p>
              <p className="text-sm capitalize text-mist">
                {formatStatus(doc.status)}
                {"updatedAt" in doc && doc.updatedAt ? ` · ${doc.updatedAt}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
