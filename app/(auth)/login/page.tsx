"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/renter";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign-in is unavailable. Confirm Supabase environment variables are configured.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Account</p>
      <h1 className="display mt-3 text-4xl">Sign in</h1>
      <p className="mt-3 text-sm text-mist">
        Access your renter, partner, or admin workspace.
      </p>
      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
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
            className="field"
            autoComplete="current-password"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn-gold w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-mist">
        Need an account?{" "}
        <Link href="/signup" className="text-gold hover:text-gold-bright">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-mist">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
