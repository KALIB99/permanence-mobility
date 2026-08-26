"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MarketingShell } from "@/components/MarketingShell";
import { BRAND } from "@/lib/content";
import { contactSchema, type ContactInput } from "@/lib/validators";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(values: ContactInput) {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <MarketingShell>
      <section className="section pt-14">
        <div className="container-pm grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className="section-title mt-4">Talk with Permanence.</h1>
            <p className="mt-4 text-mist">
              For applications, use the dedicated forms. For everything else, send a message below.
            </p>
            <p className="mt-8 text-sm text-mist">
              <a href={`mailto:${BRAND.email}`} className="text-gold hover:text-gold-bright">
                {BRAND.email}
              </a>
              <br />
              {BRAND.location}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label className="label" htmlFor="name">
                Name
              </label>
              <input id="name" className="field" {...register("name")} />
              {errors.name ? (
                <p className="mt-1 text-sm text-red-300">{errors.name.message}</p>
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
              <label className="label" htmlFor="subject">
                Subject
              </label>
              <input id="subject" className="field" {...register("subject")} />
              {errors.subject ? (
                <p className="mt-1 text-sm text-red-300">{errors.subject.message}</p>
              ) : null}
            </div>
            <div>
              <label className="label" htmlFor="message">
                Message
              </label>
              <textarea id="message" rows={6} className="field" {...register("message")} />
              {errors.message ? (
                <p className="mt-1 text-sm text-red-300">{errors.message.message}</p>
              ) : null}
            </div>
            <button type="submit" className="btn-gold" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
            {status === "sent" ? (
              <p className="text-sm text-gold-bright" role="status">
                Message received. We’ll reply by email.
              </p>
            ) : null}
            {status === "error" ? (
              <p className="text-sm text-red-300" role="alert">
                Could not send. Please try again or email us directly.
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </MarketingShell>
  );
}
