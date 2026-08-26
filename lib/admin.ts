import { headers } from "next/headers";

const OWNER_EMAIL = "marshmatimba9@gmail.com";

export async function requireOwner(): Promise<void> {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email")?.toLowerCase();
  const localDevelopment = process.env.NODE_ENV !== "production" && !email;
  if (!localDevelopment && email !== OWNER_EMAIL) {
    throw new Response("Owner access required", { status: 403 });
  }
}

export async function isOwner(): Promise<boolean> {
  try {
    await requireOwner();
    return true;
  } catch {
    return false;
  }
}
