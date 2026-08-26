"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { VEHICLE_CATEGORIES } from "@/lib/content";
import {
  vehicleCreateSchema,
  type VehicleCreateInput,
} from "@/lib/validators";

export default function PartnerVehicleNewPage() {
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleCreateInput>({
    resolver: zodResolver(vehicleCreateSchema),
    defaultValues: {
      make: "",
      model: "",
      year: 2024,
      category: "Sedan",
      weeklyRateCents: 34900,
      depositCents: 34900,
      location: "Phoenix, AZ",
      vin: "",
      plateNumber: "",
      eligibility: "Rideshare, Delivery",
      notes: "",
    },
  });

  function onSubmit(_values: VehicleCreateInput) {
    void _values;
    // Demo-only: persistence lands when DATABASE_URL + partner org are wired.
    setStatus("saved");
    reset();
  }

  return (
    <>
      <p className="eyebrow">Fleet</p>
      <h1 className="section-title mt-4">Add vehicle</h1>
      <p className="mt-3 max-w-xl text-mist">
        Submit listing details for review. Vehicles do not go live until Permanence approval.
      </p>

      {status === "saved" ? (
        <div className="mt-10 border border-line/60 bg-ink-soft p-8">
          <p className="eyebrow">Queued</p>
          <h2 className="display mt-3 text-3xl">Vehicle draft saved (demo)</h2>
          <p className="mt-3 text-mist">
            In production this creates a draft row and notifies operations for approval.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/partners/portal/vehicles" className="btn-gold">
              Back to vehicles
            </Link>
            <button type="button" className="btn-ghost" onClick={() => setStatus("idle")}>
              Add another
            </button>
          </div>
        </div>
      ) : (
        <form
          className="mt-10 max-w-2xl space-y-6"
          onSubmit={handleSubmit(onSubmit, () => setStatus("error"))}
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="make">
                Make
              </label>
              <input id="make" className="field" {...register("make")} />
              {errors.make ? <p className="mt-2 text-sm text-gold-bright">{errors.make.message}</p> : null}
            </div>
            <div>
              <label className="label" htmlFor="model">
                Model
              </label>
              <input id="model" className="field" {...register("model")} />
              {errors.model ? (
                <p className="mt-2 text-sm text-gold-bright">{errors.model.message}</p>
              ) : null}
            </div>
            <div>
              <label className="label" htmlFor="year">
                Year
              </label>
              <input
                id="year"
                type="number"
                className="field"
                {...register("year", { valueAsNumber: true })}
              />
              {errors.year ? <p className="mt-2 text-sm text-gold-bright">{errors.year.message}</p> : null}
            </div>
            <div>
              <label className="label" htmlFor="category">
                Category
              </label>
              <select id="category" className="field" {...register("category")}>
                {VEHICLE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="weeklyRateCents">
                Weekly rate (cents)
              </label>
              <input
                id="weeklyRateCents"
                type="number"
                className="field"
                {...register("weeklyRateCents", { valueAsNumber: true })}
              />
              {errors.weeklyRateCents ? (
                <p className="mt-2 text-sm text-gold-bright">{errors.weeklyRateCents.message}</p>
              ) : null}
            </div>
            <div>
              <label className="label" htmlFor="depositCents">
                Deposit (cents)
              </label>
              <input
                id="depositCents"
                type="number"
                className="field"
                {...register("depositCents", { valueAsNumber: true })}
              />
              {errors.depositCents ? (
                <p className="mt-2 text-sm text-gold-bright">{errors.depositCents.message}</p>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="location">
                Location
              </label>
              <input id="location" className="field" {...register("location")} />
              {errors.location ? (
                <p className="mt-2 text-sm text-gold-bright">{errors.location.message}</p>
              ) : null}
            </div>
            <div>
              <label className="label" htmlFor="vin">
                VIN (optional)
              </label>
              <input id="vin" className="field" {...register("vin")} />
            </div>
            <div>
              <label className="label" htmlFor="plateNumber">
                Plate (optional)
              </label>
              <input id="plateNumber" className="field" {...register("plateNumber")} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="eligibility">
                Typical uses
              </label>
              <input id="eligibility" className="field" {...register("eligibility")} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="notes">
                Notes
              </label>
              <textarea id="notes" rows={4} className="field" {...register("notes")} />
            </div>
          </div>

          {status === "error" ? (
            <p className="text-sm text-gold-bright">Please fix the highlighted fields.</p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-gold">
              Submit for review
            </button>
            <Link href="/partners/portal/vehicles" className="btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
