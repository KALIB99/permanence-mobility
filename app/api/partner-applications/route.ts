import { NextResponse } from "next/server";
import { persistPartnerApplication } from "@/lib/applications";
import { partnerApplicationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = partnerApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const saved = await persistPartnerApplication(parsed.data);
    return NextResponse.json(
      {
        ok: true,
        stored: true,
        id: saved.id,
        status: saved.status,
        message: "Partner application submitted. Permanence will review your fleet details.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[partner-application] persist failed", error);
    return NextResponse.json(
      {
        ok: false,
        stored: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to store partner application. Please try again.",
      },
      { status: 500 },
    );
  }
}
