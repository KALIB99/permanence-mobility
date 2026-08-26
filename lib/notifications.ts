/**
 * Notification adapters for Resend (email) and Twilio-ready SMS.
 * Missing credentials never throw — intent is recorded and returned as pending.
 */

export type NotificationChannel = "email" | "sms";

export type NotificationIntent = {
  channel: NotificationChannel;
  to: string;
  subject?: string;
  body: string;
  html?: string;
  eventType: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
};

export type NotificationDeliveryResult = {
  channel: NotificationChannel;
  to: string;
  eventType: string;
  status: "sent" | "failed" | "pending_configuration" | "skipped";
  provider?: "resend" | "twilio" | "none";
  providerId?: string;
  detail: string;
  recordedAt: string;
};

export type EmailAdapter = {
  send(input: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    idempotencyKey?: string;
  }): Promise<{ ok: boolean; id?: string; detail: string }>;
};

export type SmsAdapter = {
  send(input: {
    to: string;
    body: string;
  }): Promise<{ ok: boolean; id?: string; detail: string }>;
};

export type NotificationRecorder = {
  record(result: NotificationDeliveryResult): void | Promise<void>;
};

const recordedIntents: NotificationDeliveryResult[] = [];

/** In-memory intent log (useful for tests and local runs without DB). */
export function getRecordedNotificationIntents(): readonly NotificationDeliveryResult[] {
  return recordedIntents;
}

export function clearRecordedNotificationIntents(): void {
  recordedIntents.length = 0;
}

const defaultRecorder: NotificationRecorder = {
  record(result) {
    recordedIntents.push(result);
    if (process.env.NODE_ENV !== "production") {
      console.info("[notifications]", result.status, result.channel, result.to, result.detail);
    }
  },
};

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function createResendEmailAdapter(options?: {
  apiKey?: string;
  from?: string;
}): EmailAdapter {
  const apiKey = options?.apiKey ?? env("RESEND_API_KEY");
  const from =
    options?.from ??
    env("NOTIFICATION_FROM_EMAIL") ??
    "Permanence Mobility <notifications@permanence.mobility>";

  return {
    async send({ to, subject, html, text, idempotencyKey }) {
      if (!apiKey) {
        return {
          ok: false,
          detail: `Email pending configuration (to=${to}; subject=${subject})`,
        };
      }

      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        };
        if (idempotencyKey) {
          headers["Idempotency-Key"] = idempotencyKey;
        }

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers,
          body: JSON.stringify({
            from,
            to: [to],
            subject,
            html,
            text,
          }),
        });

        const body = (await response.json()) as { id?: string; message?: string };
        if (!response.ok) {
          return {
            ok: false,
            id: body.id,
            detail: body.message ?? `Resend HTTP ${response.status}`,
          };
        }
        return {
          ok: true,
          id: body.id,
          detail: subject,
        };
      } catch (error) {
        return {
          ok: false,
          detail: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

export function createTwilioSmsAdapter(options?: {
  accountSid?: string;
  authToken?: string;
  from?: string;
}): SmsAdapter {
  const accountSid = options?.accountSid ?? env("TWILIO_ACCOUNT_SID");
  const authToken = options?.authToken ?? env("TWILIO_AUTH_TOKEN");
  const from = options?.from ?? env("TWILIO_FROM_NUMBER");

  return {
    async send({ to, body }) {
      if (!accountSid || !authToken || !from) {
        return {
          ok: false,
          detail: `SMS pending configuration (to=${to})`,
        };
      }

      try {
        const form = new URLSearchParams({
          To: to,
          From: from,
          Body: body,
        });
        const credentials = Buffer.from(`${accountSid}:${authToken}`).toString(
          "base64",
        );
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${credentials}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: form.toString(),
          },
        );
        const payload = (await response.json()) as {
          sid?: string;
          message?: string;
        };
        if (!response.ok) {
          return {
            ok: false,
            id: payload.sid,
            detail: payload.message ?? `Twilio HTTP ${response.status}`,
          };
        }
        return {
          ok: true,
          id: payload.sid,
          detail: body.slice(0, 160),
        };
      } catch (error) {
        return {
          ok: false,
          detail: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

function isEmailConfigured(): boolean {
  return Boolean(env("RESEND_API_KEY") && env("NOTIFICATION_FROM_EMAIL"));
}

function isSmsConfigured(): boolean {
  return Boolean(
    env("TWILIO_ACCOUNT_SID") &&
      env("TWILIO_AUTH_TOKEN") &&
      env("TWILIO_FROM_NUMBER"),
  );
}

export async function deliverNotification(
  intent: NotificationIntent,
  adapters?: {
    email?: EmailAdapter;
    sms?: SmsAdapter;
    recorder?: NotificationRecorder;
  },
): Promise<NotificationDeliveryResult> {
  const recorder = adapters?.recorder ?? defaultRecorder;
  const recordedAt = new Date().toISOString();

  if (intent.channel === "email") {
    const configured = isEmailConfigured() || Boolean(adapters?.email);
    if (!configured) {
      const result: NotificationDeliveryResult = {
        channel: "email",
        to: intent.to,
        eventType: intent.eventType,
        status: "pending_configuration",
        provider: "none",
        detail: intent.subject ?? intent.body,
        recordedAt,
      };
      await recorder.record(result);
      return result;
    }

    const email = adapters?.email ?? createResendEmailAdapter();
    const response = await email.send({
      to: intent.to,
      subject: intent.subject ?? "Permanence Mobility",
      html: intent.html ?? `<p>${escapeHtml(intent.body)}</p>`,
      text: intent.body,
      idempotencyKey: intent.idempotencyKey,
    });

    const result: NotificationDeliveryResult = {
      channel: "email",
      to: intent.to,
      eventType: intent.eventType,
      status: response.ok
        ? "sent"
        : response.detail.includes("pending configuration")
          ? "pending_configuration"
          : "failed",
      provider: "resend",
      providerId: response.id,
      detail: response.detail,
      recordedAt,
    };
    await recorder.record(result);
    return result;
  }

  const configured = isSmsConfigured() || Boolean(adapters?.sms);
  if (!configured) {
    const result: NotificationDeliveryResult = {
      channel: "sms",
      to: intent.to,
      eventType: intent.eventType,
      status: "pending_configuration",
      provider: "none",
      detail: intent.body,
      recordedAt,
    };
    await recorder.record(result);
    return result;
  }

  const sms = adapters?.sms ?? createTwilioSmsAdapter();
  const response = await sms.send({ to: intent.to, body: intent.body });
  const result: NotificationDeliveryResult = {
    channel: "sms",
    to: intent.to,
    eventType: intent.eventType,
    status: response.ok
      ? "sent"
      : response.detail.includes("pending configuration")
        ? "pending_configuration"
        : "failed",
    provider: "twilio",
    providerId: response.id,
    detail: response.detail,
    recordedAt,
  };
  await recorder.record(result);
  return result;
}

export async function notifyEmailAndSms(input: {
  email?: string;
  mobile?: string;
  subject: string;
  html: string;
  text: string;
  eventType: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}): Promise<NotificationDeliveryResult[]> {
  const results: NotificationDeliveryResult[] = [];

  if (input.email) {
    results.push(
      await deliverNotification({
        channel: "email",
        to: input.email,
        subject: input.subject,
        html: input.html,
        body: input.text,
        eventType: input.eventType,
        idempotencyKey: input.idempotencyKey
          ? `${input.idempotencyKey}-email`
          : undefined,
        metadata: input.metadata,
      }),
    );
  }

  if (input.mobile) {
    results.push(
      await deliverNotification({
        channel: "sms",
        to: input.mobile,
        body: input.text,
        eventType: input.eventType,
        idempotencyKey: input.idempotencyKey
          ? `${input.idempotencyKey}-sms`
          : undefined,
        metadata: input.metadata,
      }),
    );
  }

  return results;
}

/** Compatibility helper used by legacy offer flows. */
export async function sendOfferNotifications(delivery: {
  offerId: number;
  waitingListId: number;
  name: string;
  email: string;
  mobile: string;
  vehicleLabel: string;
  token: string;
  deadline: string;
}): Promise<void> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const offerUrl = `${siteUrl}/offers/${delivery.token}`;
  const subject = `${delivery.vehicleLabel} is available`;
  const html = `<div style="background:#0b0b0b;color:#f7f2e7;padding:32px;font-family:Arial,sans-serif">
    <p style="color:#c7a25a;letter-spacing:2px">PERMANENCE MOBILITY</p>
    <h1 style="font-family:Georgia,serif;font-weight:400">Your vehicle is ready.</h1>
    <p>Hello ${escapeHtml(delivery.name)}, the ${escapeHtml(delivery.vehicleLabel)} is available for you.</p>
    <p>This private offer expires ${escapeHtml(new Date(delivery.deadline).toLocaleString("en-US", { timeZone: "America/Phoenix" }))} Arizona time.</p>
    <p><a href="${offerUrl}" style="background:#c7a25a;color:#090909;padding:14px 20px;text-decoration:none">Review your offer</a></p>
  </div>`;
  const text = `Permanence Mobility: ${delivery.vehicleLabel} is available. Review your private offer before the deadline: ${offerUrl}`;

  await notifyEmailAndSms({
    email: delivery.email,
    mobile: delivery.mobile,
    subject,
    html,
    text,
    eventType: "vehicle_offer",
    idempotencyKey: `offer-${delivery.offerId}`,
    metadata: {
      offerId: delivery.offerId,
      waitingListId: delivery.waitingListId,
    },
  });
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) =>
    (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      } as Record<string, string>
    )[character] ?? character,
  );
}
