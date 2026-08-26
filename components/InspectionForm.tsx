"use client";

import { useState } from "react";
import { DAMAGE_CHECKLIST_KEYS } from "@/lib/validators";

const CHECKLIST_LABELS: Record<(typeof DAMAGE_CHECKLIST_KEYS)[number], string> = {
  exterior_scratches: "Exterior scratches",
  dents: "Dents / body damage",
  windshield: "Windshield cracks/chips",
  tires: "Tire wear / damage",
  interior_stains: "Interior stains",
  lights: "Lights not working",
  mirrors: "Mirror damage",
};

export type InspectionFormVehicle = {
  id: string;
  label: string;
};

export type InspectionFormProps = {
  vehicles: InspectionFormVehicle[];
  defaultVehicleId?: string;
  defaultType?: "pickup" | "return";
  reservationId?: string;
};

export function InspectionForm({
  vehicles,
  defaultVehicleId,
  defaultType = "pickup",
  reservationId,
}: InspectionFormProps) {
  const [vehicleId, setVehicleId] = useState(
    defaultVehicleId ?? vehicles[0]?.id ?? "",
  );
  const [inspectionType, setInspectionType] = useState<"pickup" | "return">(
    defaultType,
  );
  const [odometer, setOdometer] = useState("");
  const [fuelLevel, setFuelLevel] = useState("75");
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DAMAGE_CHECKLIST_KEYS.map((k) => [k, false])),
  );
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [inspectionId, setInspectionId] = useState<string | null>(null);

  function toggleCheck(key: string) {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setMessage(null);

    const odometerNum = Number.parseInt(odometer, 10);
    const fuelNum = Number.parseFloat(fuelLevel);
    if (!Number.isFinite(odometerNum) || odometerNum < 0) {
      setStatus("error");
      setMessage("Enter a valid odometer reading.");
      return;
    }
    if (!Number.isFinite(fuelNum) || fuelNum < 0 || fuelNum > 100) {
      setStatus("error");
      setMessage("Fuel level must be between 0 and 100.");
      return;
    }

    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          reservationId,
          inspectionType,
          odometer: odometerNum,
          fuelLevel: fuelNum,
          notes: notes.trim() || undefined,
          damageChecklist: checklist,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        inspection?: { id?: string };
      };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Unable to submit inspection.");
        return;
      }
      setStatus("done");
      setInspectionId(data.inspection?.id ?? null);
      setMessage(data.message ?? "Inspection submitted.");
    } catch {
      setStatus("error");
      setMessage("Unable to submit inspection. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="border border-line/60 bg-ink-soft p-6 sm:p-8">
        <p className="eyebrow">Submitted</p>
        <h2 className="display mt-3 text-3xl">Inspection recorded</h2>
        <p className="mt-3 text-mist">{message}</p>
        {inspectionId ? (
          <p className="mt-4 font-mono text-sm text-gold-bright">{inspectionId}</p>
        ) : null}
        <button
          type="button"
          className="btn-ghost mt-8"
          onClick={() => {
            setStatus("idle");
            setMessage(null);
            setInspectionId(null);
            setNotes("");
            setOdometer("");
            setChecklist(
              Object.fromEntries(DAMAGE_CHECKLIST_KEYS.map((k) => [k, false])),
            );
          }}
        >
          Start another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 border border-line/60 bg-ink-soft p-6 sm:p-8"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-gold">
          Vehicle condition
        </p>
        <h2 className="display mt-3 text-3xl">
          {inspectionType === "pickup" ? "Pickup inspection" : "Return inspection"}
        </h2>
        <p className="mt-2 text-sm text-mist">
          Capture odometer, fuel, and any damage before confirming.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="inspectionType">
            Type
          </label>
          <select
            id="inspectionType"
            className="field"
            value={inspectionType}
            onChange={(e) =>
              setInspectionType(e.target.value as "pickup" | "return")
            }
          >
            <option value="pickup">Pickup</option>
            <option value="return">Return</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="vehicleId">
            Vehicle
          </label>
          <select
            id="vehicleId"
            className="field"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            required
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="odometer">
            Odometer (mi)
          </label>
          <input
            id="odometer"
            className="field"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            required
            placeholder="e.g. 48210"
          />
        </div>

        <div>
          <label className="label" htmlFor="fuelLevel">
            Fuel level (%)
          </label>
          <input
            id="fuelLevel"
            className="field"
            type="number"
            min={0}
            max={100}
            step={1}
            value={fuelLevel}
            onChange={(e) => setFuelLevel(e.target.value)}
            required
          />
        </div>
      </div>

      <fieldset>
        <legend className="label">Damage checklist</legend>
        <p className="mt-1 text-xs text-mist">
          Check any issues present at this inspection.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {DAMAGE_CHECKLIST_KEYS.map((key) => (
            <li key={key}>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-cream">
                <input
                  type="checkbox"
                  className="mt-1 accent-gold"
                  checked={Boolean(checklist[key])}
                  onChange={() => toggleCheck(key)}
                />
                <span>{CHECKLIST_LABELS[key]}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div>
        <label className="label" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          className="field min-h-[100px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={4000}
          placeholder="Optional details for ops review"
        />
      </div>

      {status === "error" && message ? (
        <p className="text-sm text-gold-bright">{message}</p>
      ) : null}

      <button
        type="submit"
        className="btn-gold w-full"
        disabled={status === "sending" || !vehicleId}
      >
        {status === "sending" ? "Submitting…" : "Submit inspection"}
      </button>
    </form>
  );
}
