import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditLogInput = {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  organizationId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
};

/** Append-only audit trail for privileged actions. Failures are logged, not thrown. */
export async function writeAuditLog(
  supabase: SupabaseClient,
  input: AuditLogInput,
): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    organization_id: input.organizationId ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("[audit] write failed", error);
  }
}
