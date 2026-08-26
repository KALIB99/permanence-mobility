import { NextResponse } from "next/server";
import { persistRenterApplication } from "@/lib/applications";
import { renterApplicationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = renterApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const saved = await persistRenterApplication(parsed.data);
    return NextResponse.json(
      {
        ok: true,
        stored: true,
        id: saved.id,
        status: saved.status,
        message: "Application submitted. Our team will review and follow up by email.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[renter-application] persist failed", error);
    return NextResponse.json(
      {
        ok: false,
        stored: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to store application. Please try again.",
      },
      { status: 500 },
    );
  }
}
