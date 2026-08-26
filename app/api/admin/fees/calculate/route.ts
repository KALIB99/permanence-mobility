import { NextResponse } from "next/server";
import { calculateFeeBreakdown } from "@/lib/fees";
import { feeCalculateSchema } from "@/lib/validators";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = feeCalculateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const breakdown = calculateFeeBreakdown({
      grossCents: parsed.data.grossCents,
      agreement: parsed.data.agreement,
      processingFeeCents: parsed.data.processingFeeCents,
      deductionsCents: parsed.data.deductionsCents,
      refundsCents: parsed.data.refundsCents,
    });

    return NextResponse.json({
      ok: true,
      mode: process.env.DATABASE_URL ? "database" : "demo",
      breakdown,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fee calculation failed" },
      { status: 400 },
    );
  }
}
