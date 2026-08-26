import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  console.info("[contact]", {
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    messageLength: parsed.data.message.length,
  });

  return NextResponse.json({ ok: true, message: "Message received" });
}
