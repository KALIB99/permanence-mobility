"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isPersistedId } from "@/lib/id";

type PartnerApplicationActionsProps = {
  id: string;
  status: string;
};

const ACTIONABLE = new Set(["submitted", "in_review", "draft"]);

export function PartnerApplicationActions({ id, status }: PartnerApplicationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!ACTIONABLE.has(status)) {
    return <p className="text-sm text-mist">No action needed</p>;
  }

  async function runAction(action: "approve" | "request_docs" | "decline") {
    if (!isPersistedId(id)) {
      setError("Sample application only. Submit a real partner application to review live records.");
      return;
    }

    setLoading(action);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/partner-applications/${id}`, {
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
          {loading === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          className="btn-ghost cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          disabled={Boolean(loading)}
          onClick={() => runAction("request_docs")}
        >
          {loading === "request_docs" ? "Saving…" : "Request docs"}
        </button>
        <button
          type="button"
          className="btn-ghost cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          disabled={Boolean(loading)}
          onClick={() => runAction("decline")}
        >
          {loading === "decline" ? "Declining…" : "Decline"}
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
