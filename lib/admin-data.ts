import {
  DEMO_AUDIT_EVENTS,
  DEMO_PARTNER_APPLICATIONS,
  DEMO_RENTERS,
  DEMO_VEHICLE_APPROVALS,
} from "@/lib/demo-data";
import { formatCents } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export type AdminMetric = {
  label: string;
  value: string;
  hint: string;
};

export type AdminRenterView = {
  id: string;
  name: string;
  email: string;
  city: string;
  status: string;
  isDemo?: boolean;
};

export type AdminRenterApplicationView = {
  id: string;
  renterProfileId: string;
  name: string;
  email: string;
  city: string;
  status: string;
  submittedAt: string;
  isDemo?: boolean;
};

export type AdminAuditEventView = {
  id: string;
  at: string;
  actor: string;
  action: string;
  subject: string;
  isDemo?: boolean;
};

export type AdminVehicleApprovalView = {
  id: string;
  label: string;
  partner: string;
  location: string;
  weeklyRate: string;
  status: string;
  isDemo?: boolean;
};

function cityFromAddress(address: unknown, fallbackCity?: string | null): string {
  if (typeof fallbackCity === "string" && fallbackCity.trim()) return fallbackCity;
  if (address && typeof address === "object") {
    const record = address as Record<string, unknown>;
    const city = String(record.city ?? "").trim();
    const state = String(record.state ?? "").trim();
    const joined = [city, state].filter(Boolean).join(", ");
    if (joined) return joined;
  }
  return "—";
}

export async function loadAdminMetrics(): Promise<{
  metrics: AdminMetric[];
  usingDemoFallback: boolean;
}> {
  try {
    const supabase = await createClient();
    const [
      { count: partnerPending, error: partnerError },
      { count: vehiclePending, error: vehicleError },
      { count: activeReservations, error: reservationError },
    ] = await Promise.all([
      supabase
        .from("partner_applications")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .in("status", ["submitted", "in_review"]),
      supabase
        .from("vehicles")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("approval_status", "pending"),
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .in("status", ["confirmed", "active"]),
    ]);

    if (partnerError || vehicleError || reservationError) {
      throw partnerError ?? vehicleError ?? reservationError;
    }

    const hasLiveCounts =
      (partnerPending ?? 0) > 0 ||
      (vehiclePending ?? 0) > 0 ||
      (activeReservations ?? 0) > 0;

    if (hasLiveCounts) {
      return {
        usingDemoFallback: false,
        metrics: [
          {
            label: "Partner applications",
            value: String(partnerPending ?? 0),
            hint: "Awaiting review",
          },
          {
            label: "Vehicle approvals",
            value: String(vehiclePending ?? 0),
            hint: "In queue",
          },
          {
            label: "Active reservations",
            value: String(activeReservations ?? 0),
            hint: "Confirmed or active",
          },
          {
            label: "Gross volume",
            value: "—",
            hint: "Ledger wiring pending",
          },
        ],
      };
    }
  } catch (error) {
    console.warn("[admin/metrics] live fetch failed, using demo figures", error);
  }

  return {
    usingDemoFallback: true,
    metrics: [
      {
        label: "Partner applications",
        value: String(
          DEMO_PARTNER_APPLICATIONS.filter((app) => app.status === "pending_review").length,
        ),
        hint: "Awaiting review",
      },
      {
        label: "Vehicle approvals",
        value: String(DEMO_VEHICLE_APPROVALS.length),
        hint: "In queue",
      },
      {
        label: "Active reservations",
        value: "14",
        hint: "This week",
      },
      {
        label: "Gross volume (demo)",
        value: "$48.2k",
        hint: "Last 30 days",
      },
    ],
  };
}

export async function loadAdminRenters(): Promise<{
  renters: AdminRenterView[];
  applications: AdminRenterApplicationView[];
  usingDemoFallback: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data: renterRows, error: renterError } = await supabase
      .from("renter_profiles")
      .select(
        `
        id,
        status,
        address,
        profiles!renter_profiles_user_id_fkey (
          full_name,
          email
        )
      `,
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (renterError) throw renterError;

    const { data: applicationRows, error: applicationError } = await supabase
      .from("renter_applications")
      .select(
        `
        id,
        renter_profile_id,
        status,
        city,
        payload,
        created_at,
        renter_profiles!inner (
          id,
          address,
          profiles!renter_profiles_user_id_fkey (
            full_name,
            email
          )
        )
      `,
      )
      .is("deleted_at", null)
      .in("status", ["submitted", "in_review", "draft"])
      .order("created_at", { ascending: false });

    if (applicationError) throw applicationError;

    const renters = (renterRows ?? []).map((row) => {
      const profile = row.profiles as
        | { full_name?: string | null; email?: string | null }
        | { full_name?: string | null; email?: string | null }[]
        | null;
      const profileRow = Array.isArray(profile) ? profile[0] : profile;

      return {
        id: row.id as string,
        name: profileRow?.full_name ?? "—",
        email: profileRow?.email ?? "—",
        city: cityFromAddress(row.address),
        status: row.status as string,
      };
    });

    const applications = (applicationRows ?? []).map((row) => {
      const payload = (row.payload ?? {}) as Record<string, unknown>;
      const renterProfile = row.renter_profiles as
        | {
            id: string;
            address: unknown;
            profiles?:
              | { full_name?: string | null; email?: string | null }
              | { full_name?: string | null; email?: string | null }[];
          }
        | {
            id: string;
            address: unknown;
            profiles?:
              | { full_name?: string | null; email?: string | null }
              | { full_name?: string | null; email?: string | null }[];
          }[];
      const renterRow = Array.isArray(renterProfile) ? renterProfile[0] : renterProfile;
      const profile = renterRow?.profiles;
      const profileRow = Array.isArray(profile) ? profile[0] : profile;

      return {
        id: row.id as string,
        renterProfileId: row.renter_profile_id as string,
        name: String(payload.fullName ?? profileRow?.full_name ?? "—"),
        email: String(payload.email ?? profileRow?.email ?? "—"),
        city: cityFromAddress(renterRow?.address, row.city as string | null),
        status: row.status as string,
        submittedAt: String(row.created_at).slice(0, 10),
      };
    });

    if (renters.length || applications.length) {
      return { usingDemoFallback: false, renters, applications };
    }
  } catch (error) {
    console.warn("[admin/renters] live fetch failed, using demo roster", error);
  }

  return {
    usingDemoFallback: true,
    renters: DEMO_RENTERS.map((renter) => ({ ...renter, isDemo: true })),
    applications: [],
  };
}

export async function loadAdminAuditEvents(): Promise<{
  events: AdminAuditEventView[];
  usingDemoFallback: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select(
        `
        id,
        action,
        entity_type,
        entity_id,
        metadata,
        created_at,
        profiles!audit_logs_actor_id_fkey (
          email
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    if (data?.length) {
      return {
        usingDemoFallback: false,
        events: data.map((row) => {
          const profile = row.profiles as
            | { email?: string | null }
            | { email?: string | null }[]
            | null;
          const profileRow = Array.isArray(profile) ? profile[0] : profile;
          const metadata = (row.metadata ?? {}) as Record<string, unknown>;
          const subject =
            String(metadata.subject ?? metadata.label ?? row.entity_id ?? row.entity_type);

          return {
            id: row.id as string,
            at: String(row.created_at),
            actor: profileRow?.email ?? "system",
            action: row.action as string,
            subject,
          };
        }),
      };
    }
  } catch (error) {
    console.warn("[admin/audit] live fetch failed, using demo events", error);
  }

  return {
    usingDemoFallback: true,
    events: DEMO_AUDIT_EVENTS.map((event) => ({ ...event, isDemo: true })),
  };
}

export async function loadAdminVehicleApprovals(): Promise<{
  vehicles: AdminVehicleApprovalView[];
  usingDemoFallback: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select(
        `
        id,
        make,
        model,
        year,
        location,
        weekly_rate_cents,
        approval_status,
        organizations!inner (
          name
        )
      `,
      )
      .is("deleted_at", null)
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (data?.length) {
      return {
        usingDemoFallback: false,
        vehicles: data.map((row) => {
          const org = row.organizations as { name?: string } | { name?: string }[] | null;
          const orgRow = Array.isArray(org) ? org[0] : org;

          return {
            id: row.id as string,
            label: `${row.year} ${row.make} ${row.model}`,
            partner: orgRow?.name ?? "—",
            location: (row.location as string | null) ?? "—",
            weeklyRate: formatCents(row.weekly_rate_cents as number, { compact: true }),
            status: row.approval_status as string,
          };
        }),
      };
    }
  } catch (error) {
    console.warn("[admin/vehicles] live fetch failed, using demo queue", error);
  }

  return {
    usingDemoFallback: true,
    vehicles: DEMO_VEHICLE_APPROVALS.map((vehicle) => ({
      ...vehicle,
      status: vehicle.status === "pending_approval" ? "pending" : vehicle.status,
      isDemo: true,
    })),
  };
}
