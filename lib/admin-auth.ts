import { createClient } from "@/lib/supabase/server";

export type AdminSession =
  | { ok: true; userId: string; email: string; platformRole: string }
  | { ok: false; status: 401 | 403; message: string };

export async function requirePlatformAdmin(): Promise<AdminSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, message: "Sign in required." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("platform_role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile?.platform_role) {
    return { ok: false, status: 403, message: "Platform admin access required." };
  }

  return {
    ok: true,
    userId: user.id,
    email: profile.email ?? user.email ?? "",
    platformRole: profile.platform_role as string,
  };
}
