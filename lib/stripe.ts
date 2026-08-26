import Stripe from "stripe";

let cached: Stripe | null | undefined;

/**
 * Returns a Stripe SDK client when STRIPE_SECRET_KEY is set; otherwise null.
 * Safe to call from server routes without crashing local demo environments.
 */
export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    cached = null;
    return cached;
  }
  cached = new Stripe(key, {
    apiVersion: "2025-08-27.basil",
    typescript: true,
  });
  return cached;
}

/** Reset cached client (tests). */
export function resetStripeClientForTests(): void {
  cached = undefined;
}

export type ConnectAccountLinkInput = {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
  type?: "account_onboarding" | "account_update";
};

/**
 * Shape for creating a Stripe Connect Account Link (test-mode ready).
 * Returns a stub payload when Stripe is not configured.
 */
export async function createConnectAccountLink(
  input: ConnectAccountLinkInput,
): Promise<{
  url: string;
  expiresAt: number | null;
  mode: "live" | "stub";
  accountId: string;
}> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      url: `${input.returnUrl}?connect=stub&account=${encodeURIComponent(input.accountId)}`,
      expiresAt: null,
      mode: "stub",
      accountId: input.accountId,
    };
  }

  const link = await stripe.accountLinks.create({
    account: input.accountId,
    refresh_url: input.refreshUrl,
    return_url: input.returnUrl,
    type: input.type ?? "account_onboarding",
  });

  return {
    url: link.url,
    expiresAt: link.expires_at,
    mode: "live",
    accountId: input.accountId,
  };
}

export type WeeklyPaymentIntentInput = {
  amountCents: number;
  currency?: string;
  customerId?: string;
  connectedAccountId?: string;
  applicationFeeCents?: number;
  metadata?: Record<string, string>;
  description?: string;
};

/**
 * Shape for a weekly rent PaymentIntent (optionally destination-charged to Connect).
 * Stub when Stripe key is missing — never invents card data.
 */
export async function createWeeklyPaymentIntent(
  input: WeeklyPaymentIntentInput,
): Promise<{
  id: string;
  clientSecret: string | null;
  amount: number;
  currency: string;
  status: string;
  mode: "live" | "stub";
}> {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 50) {
    throw new Error("amountCents must be an integer >= 50");
  }

  const currency = (input.currency ?? "usd").toLowerCase();
  const stripe = getStripe();

  if (!stripe) {
    const stubId = `pi_stub_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
    return {
      id: stubId,
      clientSecret: `${stubId}_secret_stub`,
      amount: input.amountCents,
      currency,
      status: "requires_payment_method",
      mode: "stub",
    };
  }

  const params: Stripe.PaymentIntentCreateParams = {
    amount: input.amountCents,
    currency,
    automatic_payment_methods: { enabled: true },
    description: input.description ?? "Permanence Mobility weekly rent",
    metadata: input.metadata,
    customer: input.customerId,
  };

  if (input.connectedAccountId) {
    params.transfer_data = { destination: input.connectedAccountId };
    if (
      input.applicationFeeCents !== undefined &&
      Number.isInteger(input.applicationFeeCents) &&
      input.applicationFeeCents >= 0
    ) {
      params.application_fee_amount = input.applicationFeeCents;
    }
  }

  const intent = await stripe.paymentIntents.create(params);
  return {
    id: intent.id,
    clientSecret: intent.client_secret,
    amount: intent.amount,
    currency: intent.currency,
    status: intent.status,
    mode: "live",
  };
}
