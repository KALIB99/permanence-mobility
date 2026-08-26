"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCents } from "@/lib/money";
import { futureDailyStartDates } from "@/lib/domain";

type VehicleSummary = {
  id: string;
  label: string;
  weeklyRateCents: number;
  depositCents: number;
  location: string;
};

type BookFormProps = {
  vehicle: VehicleSummary;
};

export function BookForm({ vehicle }: BookFormProps) {
  const startOptions = useMemo(() => futureDailyStartDates(21), []);
  const [startDate, setStartDate] = useState(startOptions[0] ?? "");
  const [weeks, setWeeks] = useState(1);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [holdId, setHoldId] = useState<string | null>(null);

  const rentTotal = vehicle.weeklyRateCents * weeks;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          startDate,
          weeks,
          depositCents: vehicle.depositCents,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        booking?: { publicId?: string };
      };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Unable to create hold.");
        return;
      }
      setStatus("done");
      setHoldId(data.booking?.publicId ?? null);
      setMessage(data.message ?? "Hold created.");
    } catch {
      setStatus("error");
      setMessage("Unable to create hold. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="border border-line/60 bg-ink-soft p-6 sm:p-8">
        <p className="eyebrow">Hold placed</p>
          <h2 className="display mt-3 text-3xl">You have 20 minutes</h2>
        <p className="mt-3 text-mist">{message}</p>
        {holdId ? (
          <p className="mt-4 font-mono text-sm text-gold-bright">{holdId}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/renter/rentals" className="btn-gold">
            Go to rentals
          </Link>
          <Link href={`/vehicles/${vehicle.id}`} className="btn-ghost">
            Back to vehicle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 border border-line/60 bg-ink-soft p-6 sm:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Weekly booking</p>
        <h2 className="display mt-3 text-3xl">{vehicle.label}</h2>
        <p className="mt-2 text-sm text-mist">{vehicle.location}</p>
      </div>

      <div>
        <label className="label" htmlFor="startDate">
          Start date
        </label>
        <select
          id="startDate"
          className="field"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        >
          {startOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="weeks">
          Weeks
        </label>
        <select
          id="weeks"
          className="field"
          value={weeks}
          onChange={(e) => setWeeks(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 6, 8].map((w) => (
            <option key={w} value={w}>
              {w} week{w === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>

      <dl className="space-y-3 border-t border-line/40 pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-mist">Weekly rate</dt>
          <dd className="text-cream">{formatCents(vehicle.weeklyRateCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-mist">Rent total</dt>
          <dd className="text-cream">{formatCents(rentTotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-mist">Security deposit (authorized)</dt>
          <dd className="text-gold-bright">{formatCents(vehicle.depositCents)}</dd>
        </div>
      </dl>

      {status === "error" && message ? (
        <p className="text-sm text-gold-bright">{message}</p>
      ) : null}

      <button type="submit" className="btn-gold w-full" disabled={status === "sending"}>
        {status === "sending" ? "Placing hold…" : "Place 20-minute hold"}
      </button>
      <p className="text-xs text-mist">
        Demo holds validate through the booking API. Checkout confirmation connects in Phase 4.
      </p>
    </form>
  );
}
