"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MarketingShell } from "@/components/MarketingShell";
import {
  partnerApplicationSchema,
  type PartnerApplicationInput,
} from "@/lib/validators";

export default function PartnerApplyPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PartnerApplicationInput>({
    resolver: zodResolver(partnerApplicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      businessName: "",
      entityType: "",
      city: "",
      state: "",
      vehicleCount: "",
      fleetDescription: "",
      website: "",
      agreeTerms: false,
    },
  });

  async function onSubmit(values: PartnerApplicationInput) {
    setStatus("sending");
    setServerMessage(null);
    try {
      const res = await fetch("/api/partner-applications", {
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
            "Partner application received. We review every fleet before activating a portal.",
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
          <p className="eyebrow">Fleet partner application</p>
          <h1 className="section-title mt-4">Request partner access.</h1>
          <p className="mt-4 text-mist">
            Submitting does not create portal access. Permanence reviews your business and vehicles
            first.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-pm max-w-3xl">
          {status === "sent" ? (
            <div className="border border-line/60 bg-ink-soft p-8">
              <p className="eyebrow">Submitted</p>
              <h2 className="display mt-3 text-3xl">Request received.</h2>
              <p className="mt-3 text-mist">{serverMessage}</p>
              <Link href="/partners" className="btn-gold mt-8 inline-flex">
                Back to partners
              </Link>
            </div>
          ) : (
            <form className="space-y-12" onSubmit={handleSubmit(onSubmit)} noValidate>
              <fieldset className="space-y-5">
                <legend className="display text-2xl">Primary contact</legend>
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
                </div>
              </fieldset>

              <fieldset className="space-y-5 border-t border-line/50 pt-10">
                <legend className="display text-2xl">Business</legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="businessName">
                      Business name
                    </label>
                    <input id="businessName" className="field" {...register("businessName")} />
                    {errors.businessName ? (
                      <p className="mt-1 text-sm text-red-300">{errors.businessName.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="entityType">
                      Entity type
                    </label>
                    <select id="entityType" className="field" {...register("entityType")}>
                      <option value="">Select</option>
                      <option value="sole_prop">Sole proprietor</option>
                      <option value="llc">LLC</option>
                      <option value="corp">Corporation</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.entityType ? (
                      <p className="mt-1 text-sm text-red-300">{errors.entityType.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="vehicleCount">
                      Fleet size
                    </label>
                    <select id="vehicleCount" className="field" {...register("vehicleCount")}>
                      <option value="">Select</option>
                      <option value="1">1 vehicle</option>
                      <option value="2-5">2–5 vehicles</option>
                      <option value="6-20">6–20 vehicles</option>
                      <option value="21+">21+ vehicles</option>
                    </select>
                    {errors.vehicleCount ? (
                      <p className="mt-1 text-sm text-red-300">{errors.vehicleCount.message}</p>
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
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="website">
                      Website (optional)
                    </label>
                    <input id="website" className="field" placeholder="https://" {...register("website")} />
                    {errors.website ? (
                      <p className="mt-1 text-sm text-red-300">{errors.website.message}</p>
                    ) : null}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="fleetDescription">
                      Tell us about your fleet
                    </label>
                    <textarea
                      id="fleetDescription"
                      rows={5}
                      className="field"
                      {...register("fleetDescription")}
                    />
                    {errors.fleetDescription ? (
                      <p className="mt-1 text-sm text-red-300">{errors.fleetDescription.message}</p>
                    ) : null}
                  </div>
                </div>
                <label className="flex items-start gap-3 text-sm text-mist">
                  <input type="checkbox" className="mt-1" {...register("agreeTerms")} />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" className="text-gold hover:text-gold-bright">
                      Terms
                    </Link>{" "}
                    and understand listings require vehicle-level approval.
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
                {status === "sending" ? "Submitting…" : "Submit partner application"}
              </button>
            </form>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
