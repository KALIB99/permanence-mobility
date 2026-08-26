import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type HandledEvent = {
  id: string;
  type: string;
  handled: boolean;
  note: string;
};

/**
 * Stripe webhook endpoint.
 * Requires STRIPE_WEBHOOK_SECRET — returns 400 when unset or signature invalid.
 * Handlers for checkout.session.completed / invoice.paid / account.updated are
 * structured no-ops (log + ack) until Phase 4 ledger wiring.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured" },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured" },
      { status: 400 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const payload = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const result: HandledEvent = {
    id: event.id,
    type: event.type,
    handled: false,
    note: "unhandled",
  };

  switch (event.type) {
    case "checkout.session.completed":
      result.handled = true;
      result.note = "noop: checkout.session.completed acknowledged";
      console.info("[stripe.webhook]", {
        type: event.type,
        id: event.id,
        action: "noop_log",
      });
      break;
    case "invoice.paid":
      result.handled = true;
      result.note = "noop: invoice.paid acknowledged";
      console.info("[stripe.webhook]", {
        type: event.type,
        id: event.id,
        action: "noop_log",
      });
      break;
    case "account.updated":
      result.handled = true;
      result.note = "noop: account.updated acknowledged";
      console.info("[stripe.webhook]", {
        type: event.type,
        id: event.id,
        action: "noop_log",
      });
      break;
    default:
      console.info("[stripe.webhook]", {
        type: event.type,
        id: event.id,
        action: "ignored",
      });
      result.note = "ignored";
  }

  return NextResponse.json({ received: true, event: result });
}
