"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isPersistedId } from "@/lib/id";

type VehicleApprovalActionsProps = {
  id: string;
  status: string;
};

const ACTIONABLE = new Set(["pending", "changes_requested"]);

export function VehicleApprovalActions({ id, status }: VehicleApprovalActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!ACTIONABLE.has(status)) {
    return <p className="text-sm text-mist">No action needed</p>;
  }

  async function runAction(action: "approve" | "request_changes" | "reject") {
    if (!isPersistedId(id)) {
      setError("Sample vehicle only. Add a real fleet unit to review live records.");
      return;
    }

    setLoading(action);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/vehicle-approvals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Action failed. Try again.");
        return;
      }

      setMessage(data.message ?? "Updated.");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="btn-gold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          disabled={Boolean(loading)}
          onClick={() => runAction("approve")}
        >
          {loading === "approve" ? "Approving…" : "Approve listing"}
        </button>
        <button
          type="button"
          className="btn-ghost cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          disabled={Boolean(loading)}
          onClick={() => runAction("request_changes")}
        >
          {loading === "request_changes" ? "Saving…" : "Request changes"}
        </button>
        <button
          type="button"
          className="btn-ghost cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          disabled={Boolean(loading)}
          onClick={() => runAction("reject")}
        >
          {loading === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
      {message ? (
        <p className="text-sm text-gold-bright" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="max-w-xs text-right text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
