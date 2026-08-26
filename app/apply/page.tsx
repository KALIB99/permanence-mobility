"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MarketingShell } from "@/components/MarketingShell";
import {
  renterApplicationSchema,
  type RenterApplicationInput,
} from "@/lib/validators";

export default function RenterApplyPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RenterApplicationInput>({
    resolver: zodResolver(renterApplicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      licenseNumber: "",
      licenseState: "",
      gigPlatforms: "",
      yearsDriving: 1,
      preferredStart: "",
      notes: "",
      agreeTerms: false,
    },
  });

  async function onSubmit(values: RenterApplicationInput) {
    setStatus("sending");
    setServerMessage(null);
    try {
      const res = await fetch("/api/renter-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      if (res.ok) {
        setStatus("sent");
        setServerMessage(
          data.message ??
            "Application received. Our team will review and follow up by email.",
        );
        reset();
        return;
      }
      setStatus("error");
      setServerMessage(data.error ?? "Unable to submit. Please try again.");
    } catch {
      setStatus("error");
      setServerMessage("Unable to submit. Please try again.");
    }
  }

  return (
    <MarketingShell>
      <section className="section pb-8 pt-14">
        <div className="container-pm max-w-3xl">
          <p className="eyebrow">Renter application</p>
          <h1 className="section-title mt-4">Apply to drive with Permanence.</h1>
          <p className="mt-4 text-mist">
            Complete each section carefully. Approval is required before weekly bookings.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-pm max-w-3xl">
          {status === "sent" ? (
            <div className="border border-line/60 bg-ink-soft p-8">
              <p className="eyebrow">Submitted</p>
              <h2 className="display mt-3 text-3xl">Thank you.</h2>
              <p className="mt-3 text-mist">{serverMessage}</p>
              <Link href="/vehicles" className="btn-gold mt-8 inline-flex">
                Browse vehicles
              </Link>
            </div>
          ) : (
            <form className="space-y-12" onSubmit={handleSubmit(onSubmit)} noValidate>
              <fieldset className="space-y-5">
                <legend className="display text-2xl text-cream">Contact</legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="fullName">
                      Full name
                    </label>
                    <input id="fullName" className="field" {...register("fullName")} />
                    {errors.fullName ? (
                      <p className="mt-1 text-sm text-red-300">{errors.fullName.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="email">
                      Email
                    </label>
                    <input id="email" type="email" className="field" {...register("email")} />
                    {errors.email ? (
                      <p className="mt-1 text-sm text-red-300">{errors.email.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="phone">
                      Phone
                    </label>
                    <input id="phone" type="tel" className="field" {...register("phone")} />
                    {errors.phone ? (
                      <p className="mt-1 text-sm text-red-300">{errors.phone.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="city">
                      City
                    </label>
                    <input id="city" className="field" {...register("city")} />
                    {errors.city ? (
                      <p className="mt-1 text-sm text-red-300">{errors.city.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="state">
                      State
                    </label>
                    <input id="state" className="field" {...register("state")} />
                    {errors.state ? (
                      <p className="mt-1 text-sm text-red-300">{errors.state.message}</p>
                    ) : null}
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-5 border-t border-line/50 pt-10">
                <legend className="display text-2xl text-cream">License & driving</legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="licenseNumber">
                      License number
                    </label>
                    <input id="licenseNumber" className="field" {...register("licenseNumber")} />
                    {errors.licenseNumber ? (
                      <p className="mt-1 text-sm text-red-300">{errors.licenseNumber.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="licenseState">
                      License state
                    </label>
                    <input id="licenseState" className="field" {...register("licenseState")} />
                    {errors.licenseState ? (
                      <p className="mt-1 text-sm text-red-300">{errors.licenseState.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="yearsDriving">
                      Years driving
                    </label>
                    <input
                      id="yearsDriving"
                      type="number"
                      min={0}
                      className="field"
                      {...register("yearsDriving", { valueAsNumber: true })}
                    />
                    {errors.yearsDriving ? (
                      <p className="mt-1 text-sm text-red-300">{errors.yearsDriving.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="preferredStart">
                      Preferred start window
                    </label>
                    <input
                      id="preferredStart"
                      className="field"
                      placeholder="e.g. Next Monday"
                      {...register("preferredStart")}
                    />
                    {errors.preferredStart ? (
                      <p className="mt-1 text-sm text-red-300">{errors.preferredStart.message}</p>
                    ) : null}
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-5 border-t border-line/50 pt-10">
                <legend className="display text-2xl text-cream">Gig work</legend>
                <div>
                  <label className="label" htmlFor="gigPlatforms">
                    Platforms you drive for
                  </label>
                  <input
                    id="gigPlatforms"
                    className="field"
                    placeholder="Uber, DoorDash, …"
                    {...register("gigPlatforms")}
                  />
                  {errors.gigPlatforms ? (
                    <p className="mt-1 text-sm text-red-300">{errors.gigPlatforms.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="label" htmlFor="notes">
                    Notes (optional)
                  </label>
                  <textarea id="notes" rows={4} className="field" {...register("notes")} />
                </div>
                <label className="flex items-start gap-3 text-sm text-mist">
                  <input
                    type="checkbox"
                    className="mt-1"
                    {...register("agreeTerms")}
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" className="text-gold hover:text-gold-bright">
                      Terms
                    </Link>{" "}
                    and authorize a driving-history review.
                  </span>
                </label>
                {errors.agreeTerms ? (
                  <p className="text-sm text-red-300">{errors.agreeTerms.message}</p>
                ) : null}
              </fieldset>

              {status === "error" && serverMessage ? (
                <p className="text-sm text-red-300" role="alert">
                  {serverMessage}
                </p>
              ) : null}

              <button type="submit" className="btn-gold" disabled={status === "sending"}>
                {status === "sending" ? "Submitting…" : "Submit application"}
              </button>
            </form>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
