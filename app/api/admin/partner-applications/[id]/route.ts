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
  approve: "Partner application approved.",
  request_docs: "Additional documents requested.",
  decline: "Partner application declined.",
} as const;

const AUDIT_BY_ACTION = {
  approve: "partner.application.approved",
  request_docs: "partner.application.docs_requested",
  decline: "partner.application.declined",
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
      ? "Additional ownership, insurance, or banking documents requested."
      : null;

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("partner_applications")
    .select("id, status, company_name, organization_id")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError) {
    console.error("[admin/partner-applications] fetch failed", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("partner_applications")
    .update({
      status: nextStatus,
      reviewed_by: admin.userId,
      reviewed_at: new Date().toISOString(),
      review_notes: parsed.data.notes ?? defaultNotes,
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id, status")
    .maybeSingle();

  if (error) {
    console.error("[admin/partner-applications] update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  await writeAuditLog(supabase, {
    actorId: admin.userId,
    action: AUDIT_BY_ACTION[parsed.data.action],
    entityType: "partner_application",
    entityId: data.id as string,
    organizationId: (existing.organization_id as string | null) ?? null,
    before: { status: existing.status },
    after: { status: data.status },
    metadata: {
      subject: existing.company_name as string,
    },
  });

  return NextResponse.json({
    ok: true,
    id: data.id,
    status: data.status,
    message: MESSAGE_BY_ACTION[parsed.data.action],
  });
}
