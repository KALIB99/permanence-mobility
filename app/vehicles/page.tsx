"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketingShell } from "@/components/MarketingShell";
import { VehicleCard } from "@/components/VehicleCard";
import { FEATURED_VEHICLES, VEHICLE_CATEGORIES } from "@/lib/content";
import { Suspense } from "react";

function VehiclesSearch() {
  const searchParams = useSearchParams();
  const [make, setMake] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [maxWeekly, setMaxWeekly] = useState("");

  const makes = useMemo(
    () => Array.from(new Set(FEATURED_VEHICLES.map((v) => v.make))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const maxCents = maxWeekly ? Math.round(Number(maxWeekly) * 100) : null;
    return FEATURED_VEHICLES.filter((v) => {
      if (make && v.make !== make) return false;
      if (category && v.category !== category) return false;
      if (maxCents !== null && Number.isFinite(maxCents) && v.weeklyRateCents > maxCents) {
        return false;
      }
      return true;
    });
  }, [make, category, maxWeekly]);

  return (
    <>
      <section className="section pb-8 pt-14">
        <div className="container-pm">
          <p className="eyebrow">Find a Gig Car</p>
          <h1 className="section-title mt-4">Weekly vehicles for approved drivers.</h1>
          <p className="mt-4 max-w-2xl text-mist">
            Demo inventory for marketing. Live availability and eligibility filtering arrive once
            your application is approved.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-pm">
          <form
            className="grid gap-4 border-y border-line/60 py-8 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label className="label" htmlFor="filter-make">
                Make
              </label>
              <select
                id="filter-make"
                className="field"
                value={make}
                onChange={(e) => setMake(e.target.value)}
              >
                <option value="">Any make</option>
                {makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="filter-category">
                Category
              </label>
              <select
                id="filter-category"
                className="field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Any category</option>
                {VEHICLE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="filter-max">
                Max weekly ($)
              </label>
              <input
                id="filter-max"
                className="field"
                type="number"
                min={0}
                step={10}
                placeholder="e.g. 400"
                value={maxWeekly}
                onChange={(e) => setMaxWeekly(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                className="btn-ghost w-full"
                onClick={() => {
                  setMake("");
                  setCategory("");
                  setMaxWeekly("");
                }}
              >
                Reset filters
              </button>
            </div>
          </form>

          <p className="mt-8 text-sm text-mist">
            Showing {filtered.length} vehicle{filtered.length === 1 ? "" : "s"}
          </p>

          <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                make={vehicle.make}
                model={vehicle.model}
                year={vehicle.year}
                weeklyRateCents={vehicle.weeklyRateCents}
                category={vehicle.category}
                location={vehicle.location}
                imageUrl={vehicle.imageUrl}
                href={`/vehicles/${vehicle.id}`}
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="mt-12 text-mist">No vehicles match these filters. Try widening your search.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}

export default function VehiclesPage() {
  return (
    <MarketingShell>
      <Suspense
        fallback={
          <div className="container-pm section">
            <p className="text-mist">Loading vehicles…</p>
          </div>
        }
      >
        <VehiclesSearch />
      </Suspense>
    </MarketingShell>
  );
}
