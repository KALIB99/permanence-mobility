import { PartnerApplicationActions } from "@/components/PartnerApplicationActions";
import { DEMO_PARTNER_APPLICATIONS } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin Partners",
};

export type PartnerApplicationView = {
  id: string;
  businessName: string;
  contact: string;
  city: string;
  vehicles: number;
  status: string;
  submittedAt: string;
  isDemo?: boolean;
};

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}

async function loadPartnerApplications(): Promise<{
  applications: PartnerApplicationView[];
  usingDemoFallback: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("partner_applications")
      .select(
        "id, company_name, contact_email, fleet_size_estimate, status, payload, created_at",
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (data?.length) {
      return {
        usingDemoFallback: false,
        applications: data.map((row) => {
          const payload = (row.payload ?? {}) as Record<string, unknown>;
          const city = String(payload.city ?? "");
          const state = String(payload.state ?? "");
          const location = [city, state].filter(Boolean).join(", ") || "—";

          return {
            id: row.id as string,
            businessName: row.company_name as string,
            contact: String(payload.fullName ?? row.contact_email ?? "—"),
            city: location,
            vehicles: (row.fleet_size_estimate as number | null) ?? 0,
            status: row.status as string,
            submittedAt: String(row.created_at).slice(0, 10),
          };
        }),
      };
    }
  } catch (error) {
    console.warn("[admin/partners] live fetch failed, using demo queue", error);
  }

  return {
    usingDemoFallback: true,
    applications: DEMO_PARTNER_APPLICATIONS.map((app) => ({
      ...app,
      status: app.status === "pending_review" ? "submitted" : app.status,
      isDemo: true,
    })),
  };
}

export default async function AdminPartnersPage() {
  const { applications, usingDemoFallback } = await loadPartnerApplications();

  return (
    <>
      <p className="eyebrow">Approvals</p>
      <h1 className="section-title mt-4">Partner applications</h1>
      <p className="mt-3 max-w-xl text-mist">
        Review business details, then approve or request more documents.
        {usingDemoFallback
          ? " Showing sample queue until live applications exist."
          : " Live applications from Supabase."}
      </p>

      <ul className="mt-10 space-y-4">
        {applications.map((app) => (
          <li key={app.id} className="border border-line/60 bg-ink-soft p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="display text-2xl text-cream">{app.businessName}</p>
                <p className="mt-2 text-sm text-mist">
                  {app.contact} · {app.city} · {app.vehicles} vehicles · Submitted{" "}
                  {app.submittedAt}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-gold">
                  {formatStatus(app.status)}
                  {app.isDemo ? " · sample" : ""}
                </p>
              </div>
              <PartnerApplicationActions id={app.id} status={app.status} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
