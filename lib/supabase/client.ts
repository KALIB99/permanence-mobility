import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon key). Safe for Client Components.
 *
 * IMPORTANT: Next.js only inlines `process.env.NEXT_PUBLIC_*` with static
 * property access. Dynamic `process.env[name]` is undefined in the browser.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Check .env.local and restart `npm run dev`.",
    );
  }

  return createBrowserClient(url, anonKey);
}
