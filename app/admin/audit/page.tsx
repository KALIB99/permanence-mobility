import { loadAdminAuditEvents } from "@/lib/admin-data";

export const metadata = {
  title: "Admin Audit",
};

export default async function AdminAuditPage() {
  const { events, usingDemoFallback } = await loadAdminAuditEvents();

  return (
    <>
      <p className="eyebrow">Security</p>
      <h1 className="section-title mt-4">Audit log</h1>
      <p className="mt-3 max-w-xl text-mist">
        Privileged actions recorded for review.
        {usingDemoFallback
          ? " Showing sample events until live audit entries exist."
          : " Live entries from Supabase."}
      </p>

      <ul className="mt-10 space-y-0 border border-line/60">
        {events.map((ev) => (
          <li
            key={ev.id}
            className="border-b border-line/40 px-4 py-4 last:border-0 sm:px-6"
          >
            <p className="font-mono text-xs text-mist">
              {ev.at}
              {ev.isDemo ? " · sample" : ""}
            </p>
            <p className="mt-2 text-cream">{ev.action}</p>
            <p className="mt-1 text-sm text-mist">
              {ev.actor} · {ev.subject}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
