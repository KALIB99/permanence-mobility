import { NextResponse } from "next/server";
import {
  assertNoOverlap,
  buildHoldRecord,
  safeCreateHoldInput,
} from "@/lib/booking";
import { FEATURED_VEHICLES } from "@/lib/content";
import { DEMO_BOOKINGS, demoDepositCents } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";

function isDemoMode() {
  return !process.env.DATABASE_URL;
}

function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function optionalUser() {
  if (!supabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await optionalUser();
  const demo = isDemoMode();

  if (demo) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      userId: user?.id ?? null,
      bookings: DEMO_BOOKINGS,
    });
  }

  // DB path not wired yet — return empty structured list.
  return NextResponse.json({
    ok: true,
    mode: "database",
    userId: user?.id ?? null,
    bookings: [],
  });
}

export async function POST(request: Request) {
  const user = await optionalUser();

  // When Supabase is configured, require a signed-in user for holds.
  if (supabaseConfigured() && !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = safeCreateHoldInput(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const hold = parsed.data;
  const vehicle = FEATURED_VEHICLES.find((v) => v.id === hold.vehicleId);
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  try {
    assertNoOverlap(
      DEMO_BOOKINGS.filter((b) => b.vehicleId === hold.vehicleId).map((b) => ({
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status,
      })),
      hold.startDate,
      hold.endDate,
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Overlap conflict" },
      { status: 409 },
    );
  }

  const depositCents = hold.depositCents ?? demoDepositCents(vehicle.weeklyRateCents);
  const record = buildHoldRecord({
    hold,
    weeklyPriceCents: vehicle.weeklyRateCents,
    depositCents,
  });

  const demo = isDemoMode();

  console.info("[bookings.createHold]", {
    mode: demo ? "demo" : "database",
    userId: user?.id ?? null,
    vehicleId: record.vehicleId,
    publicId: record.publicId,
    startDate: record.startDate,
    weeks: record.weeks,
  });

  return NextResponse.json(
    {
      ok: true,
      mode: demo ? "demo" : "database",
      message: demo
        ? "Hold created in demo mode (no DATABASE_URL)."
        : "Hold accepted; persistence wiring pending.",
      booking: record,
    },
    { status: 201 },
  );
}
