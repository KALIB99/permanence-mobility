import { NextResponse } from "next/server";
import { inspectionSchema } from "@/lib/validators";

function isDemoMode() {
  return !process.env.DATABASE_URL;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = inspectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const demo = isDemoMode();

  const gps =
    data.gpsConsent &&
    typeof data.latitude === "number" &&
    typeof data.longitude === "number"
      ? { latitude: data.latitude, longitude: data.longitude }
      : null;

  const record = {
    id: crypto.randomUUID(),
    status: "submitted" as const,
    vehicleId: data.vehicleId,
    reservationId: data.reservationId ?? null,
    inspectionType: data.inspectionType,
    odometer: data.odometer,
    fuelLevel: data.fuelLevel,
    notes: data.notes ?? null,
    checklist: data.damageChecklist ?? {},
    gps,
    submittedAt: new Date().toISOString(),
  };

  console.info("[inspections.create]", {
    mode: demo ? "demo" : "database",
    id: record.id,
    vehicleId: record.vehicleId,
    inspectionType: record.inspectionType,
  });

  return NextResponse.json(
    {
      ok: true,
      mode: demo ? "demo" : "database",
      message: demo
        ? "Inspection submitted in demo mode (no DATABASE_URL)."
        : "Inspection accepted; persistence wiring pending.",
      inspection: record,
    },
    { status: 201 },
  );
}

export async function GET() {
  const demo = isDemoMode();
  return NextResponse.json({
    ok: true,
    mode: demo ? "demo" : "database",
    message: "List endpoint returns empty until persistence is wired.",
    inspections: [],
  });
}
