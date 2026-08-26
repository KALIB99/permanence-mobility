"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "");

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      setMessage("Account created. If email confirmation is enabled, check your inbox, then sign in.");
      setLoading(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign-up is unavailable. Confirm Supabase environment variables are configured.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Account</p>
      <h1 className="display mt-3 text-4xl">Create account</h1>
      <p className="mt-3 text-sm text-mist">
        After signup, complete a renter or partner application for platform access.
      </p>
      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input id="fullName" name="fullName" required className="field" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className="field" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="field"
            autoComplete="new-password"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-gold-bright" role="status">
            {message}
          </p>
        ) : null}
        <button type="submit" className="btn-gold w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-mist">
        Already registered?{" "}
        <Link href="/login" className="text-gold hover:text-gold-bright">
          Sign in
        </Link>
      </p>
    </div>
  );
}
