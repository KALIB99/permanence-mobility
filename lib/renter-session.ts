import { createClient } from "@/lib/supabase/server";

export type RenterApplicationView = {
  id: string;
  status: string;
  submittedAt: string;
  reviewNotes: string | null;
};

export type RenterDocumentView = {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
};

export type RenterSessionContext = {
  userId: string | null;
  email: string | null;
  renterProfileId: string | null;
  renterStatus: string | null;
  application: RenterApplicationView | null;
  documents: RenterDocumentView[];
};

function formatDocumentType(type: string): string {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function loadRenterSessionContext(): Promise<RenterSessionContext> {
  const empty: RenterSessionContext = {
    userId: null,
    email: null,
    renterProfileId: null,
    renterStatus: null,
    application: null,
    documents: [],
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return empty;

    const { data: renterProfile, error: profileError } = await supabase
      .from("renter_profiles")
      .select("id, status")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!renterProfile?.id) {
      return {
        ...empty,
        userId: user.id,
        email: user.email ?? null,
      };
    }

    const renterProfileId = renterProfile.id as string;

    const [{ data: application, error: applicationError }, { data: documents, error: documentsError }] =
      await Promise.all([
        supabase
          .from("renter_applications")
          .select("id, status, review_notes, created_at")
          .eq("renter_profile_id", renterProfileId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("driver_documents")
          .select("id, document_type, status, updated_at")
          .eq("renter_profile_id", renterProfileId)
          .is("deleted_at", null)
          .order("updated_at", { ascending: false }),
      ]);

    if (applicationError) throw applicationError;
    if (documentsError) throw documentsError;

    return {
      userId: user.id,
      email: user.email ?? null,
      renterProfileId,
      renterStatus: renterProfile.status as string,
      application: application
        ? {
            id: application.id as string,
            status: application.status as string,
            submittedAt: String(application.created_at).slice(0, 10),
            reviewNotes: (application.review_notes as string | null) ?? null,
          }
        : null,
      documents: (documents ?? []).map((doc) => ({
        id: doc.id as string,
        name: formatDocumentType(doc.document_type as string),
        status: doc.status as string,
        updatedAt: String(doc.updated_at).slice(0, 10),
      })),
    };
  } catch (error) {
    console.warn("[renter-session] load failed", error);
    return empty;
  }
}
