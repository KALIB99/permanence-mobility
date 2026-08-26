"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DEMO_TEAM } from "@/lib/demo-data";
import { partnerInviteSchema, type PartnerInviteInput } from "@/lib/validators";

export default function PartnerTeamPage() {
  const [inviteStatus, setInviteStatus] = useState<"idle" | "sent">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PartnerInviteInput>({
    resolver: zodResolver(partnerInviteSchema),
    defaultValues: {
      email: "",
      role: "partner_staff",
      message: "",
    },
  });

  function onSubmit(_values: PartnerInviteInput) {
    void _values;
    setInviteStatus("sent");
    reset();
  }

  return (
    <>
      <p className="eyebrow">Organization</p>
      <h1 className="section-title mt-4">Team</h1>
      <p className="mt-3 max-w-xl text-mist">
        Invite managers and staff with role-scoped access to your partner portal.
      </p>

      <div className="mt-10 overflow-x-auto border border-line/60">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line/60 bg-ink-soft text-xs uppercase tracking-[0.14em] text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_TEAM.map((m) => (
              <tr key={m.id} className="border-b border-line/40 last:border-0">
                <td className="px-4 py-4 text-cream">{m.name}</td>
                <td className="px-4 py-4 text-mist">{m.email}</td>
                <td className="px-4 py-4 text-mist">{m.role.replaceAll("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 max-w-xl border border-line/60 bg-ink-soft p-6 sm:p-8">
        <h2 className="display text-2xl">Invite teammate</h2>
        {inviteStatus === "sent" ? (
          <p className="mt-4 text-mist">
            Invite queued (demo). Email delivery connects when notification providers are configured.
          </p>
        ) : null}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" type="email" className="field" {...register("email")} />
            {errors.email ? (
              <p className="mt-2 text-sm text-gold-bright">{errors.email.message}</p>
            ) : null}
          </div>
          <div>
            <label className="label" htmlFor="role">
              Role
            </label>
            <select id="role" className="field" {...register("role")}>
              <option value="partner_manager">Manager</option>
              <option value="partner_staff">Staff</option>
              <option value="partner_accountant">Accountant</option>
              <option value="partner_read_only">Read only</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="message">
              Message (optional)
            </label>
            <textarea id="message" rows={3} className="field" {...register("message")} />
          </div>
          <button type="submit" className="btn-gold">
            Send invite
          </button>
        </form>
      </div>
    </>
  );
}
