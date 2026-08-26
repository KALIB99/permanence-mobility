import Link from "next/link";
import { loadAdminMetrics } from "@/lib/admin-data";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  let email: string | null = null;
  let platformRole: string | null = null;
  let authNote: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("platform_role")
        .eq("id", user.id)
        .maybeSingle();
      platformRole = (profile as { platform_role?: string | null } | null)?.platform_role ?? null;
    }
  } catch {
    authNote = "Supabase is not fully configured in this environment.";
  }

  const { metrics, usingDemoFallback } = await loadAdminMetrics();
  const isStaff = Boolean(platformRole);

  return (
    <>
      <p className="eyebrow">Operations</p>
      <h1 className="section-title mt-4">Admin dashboard</h1>
      <p className="mt-4 max-w-2xl text-mist">
        Approvals, fleet ops, fees, and audit.
        {usingDemoFallback
          ? " Metrics below use demo figures until live counts exist."
          : " Metrics below reflect live Supabase counts."}
      </p>

      <div className="mt-8 border border-line/60 bg-ink-soft p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Session</p>
        <p className="mt-2 text-cream">{email ?? "No authenticated user"}</p>
        <p className="mt-2 text-sm text-mist">
          Platform role: {platformRole ?? (isStaff ? "—" : "none assigned")}
        </p>
        {authNote ? <p className="mt-2 text-sm text-mist">{authNote}</p> : null}
        {!isStaff && email ? (
          <p className="mt-3 text-sm text-gold-bright">
            Your account is signed in but does not have a platform role yet.
          </p>
        ) : null}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="border border-line/60 bg-ink-soft p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-mist">{m.label}</p>
            <p className="display mt-3 text-3xl text-cream">{m.value}</p>
            <p className="mt-2 text-sm text-mist">{m.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/admin/partners" className="btn-gold">
          Review partners
        </Link>
        <Link href="/admin/vehicles" className="btn-ghost">
          Vehicle queue
        </Link>
        <Link href="/admin/audit" className="btn-ghost">
          Audit log
        </Link>
      </div>
    </>
  );
}
