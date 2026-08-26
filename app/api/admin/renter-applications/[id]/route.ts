import { NextResponse } from "next/server";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

const actionSchema = z.object({
  action: z.enum(["approve", "request_docs", "decline"]),
  notes: z.string().trim().max(2000).optional(),
});

const STATUS_BY_ACTION = {
  approve: "approved",
  request_docs: "in_review",
  decline: "rejected",
} as const;

const MESSAGE_BY_ACTION = {
  approve: "Renter application approved.",
  request_docs: "Additional documents requested.",
  decline: "Renter application declined.",
} as const;

const AUDIT_BY_ACTION = {
  approve: "renter.application.approved",
  request_docs: "renter.application.docs_requested",
  decline: "renter.application.declined",
} as const;

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: admin.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const nextStatus = STATUS_BY_ACTION[parsed.data.action];
  const defaultNotes =
    parsed.data.action === "request_docs"
      ? "Additional license, residence, or gig-platform documents requested."
      : null;

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("renter_applications")
    .select("id, status, renter_profile_id, payload")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError) {
    console.error("[admin/renter-applications] fetch failed", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("renter_applications")
    .update({
      status: nextStatus,
      reviewed_by: admin.userId,
      reviewed_at: new Date().toISOString(),
      review_notes: parsed.data.notes ?? defaultNotes,
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id, status, renter_profile_id")
    .maybeSingle();

  if (error) {
    console.error("[admin/renter-applications] update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  if (parsed.data.action === "approve") {
    const { error: profileError } = await supabase
      .from("renter_profiles")
      .update({ status: "approved" })
      .eq("id", data.renter_profile_id)
      .is("deleted_at", null);

    if (profileError) {
      console.error("[admin/renter-applications] profile update failed", profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }

  const payload = (existing.payload ?? {}) as Record<string, unknown>;
  await writeAuditLog(supabase, {
    actorId: admin.userId,
    action: AUDIT_BY_ACTION[parsed.data.action],
    entityType: "renter_application",
    entityId: data.id as string,
    before: { status: existing.status },
    after: { status: data.status },
    metadata: {
      subject: String(payload.fullName ?? payload.email ?? data.id),
    },
  });

  return NextResponse.json({
    ok: true,
    id: data.id,
    status: data.status,
    message: MESSAGE_BY_ACTION[parsed.data.action],
  });
}
