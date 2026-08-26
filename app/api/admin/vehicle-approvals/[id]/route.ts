import { NextResponse } from "next/server";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

const actionSchema = z.object({
  action: z.enum(["approve", "request_changes", "reject"]),
  notes: z.string().trim().max(2000).optional(),
});

const STATUS_BY_ACTION = {
  approve: "approved",
  request_changes: "changes_requested",
  reject: "rejected",
} as const;

const MESSAGE_BY_ACTION = {
  approve: "Vehicle approved for marketplace listing.",
  request_changes: "Changes requested before listing.",
  reject: "Vehicle listing rejected.",
} as const;

const AUDIT_BY_ACTION = {
  approve: "vehicle.approval.approved",
  request_changes: "vehicle.approval.changes_requested",
  reject: "vehicle.approval.rejected",
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
    parsed.data.action === "request_changes"
      ? "Update photos, insurance, or listing details before approval."
      : null;

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("vehicles")
    .select("id, approval_status, organization_id, make, model, year")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError) {
    console.error("[admin/vehicle-approvals] fetch failed", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("vehicles")
    .update({ approval_status: nextStatus })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id, approval_status, organization_id, make, model, year")
    .maybeSingle();

  if (error) {
    console.error("[admin/vehicle-approvals] update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  }

  const reviewedAt = new Date().toISOString();
  const { error: approvalError } = await supabase.from("vehicle_approvals").insert({
    organization_id: data.organization_id,
    vehicle_id: data.id,
    status: nextStatus,
    reviewed_by: admin.userId,
    reviewed_at: reviewedAt,
    notes: parsed.data.notes ?? defaultNotes,
  });

  if (approvalError) {
    console.warn("[admin/vehicle-approvals] approval record write failed", approvalError);
  }

  await writeAuditLog(supabase, {
    actorId: admin.userId,
    action: AUDIT_BY_ACTION[parsed.data.action],
    entityType: "vehicle",
    entityId: data.id as string,
    organizationId: data.organization_id as string,
    before: { approval_status: existing.approval_status },
    after: { approval_status: data.approval_status },
    metadata: {
      subject: `${data.year} ${data.make} ${data.model}`,
    },
  });

  return NextResponse.json({
    ok: true,
    id: data.id,
    status: data.approval_status,
    message: MESSAGE_BY_ACTION[parsed.data.action],
  });
}
