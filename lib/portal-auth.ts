import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Redirect unauthenticated users to /login. Use in protected portal layouts. */
export async function requireSignedIn(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
}
