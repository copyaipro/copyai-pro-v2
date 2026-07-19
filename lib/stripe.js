// Thin Stripe REST client — no SDK dependency.
// Configure via env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID (optional).
import crypto from "crypto";

const STRIPE_API = "https://api.stripe.com/v1";

export const PRO_PRICE_USD = 14; // $14/mo

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// Stripe's API takes application/x-www-form-urlencoded bodies.
function encodeForm(obj, prefix = "") {
  const parts = [];
  for (const [key, value] of Object.entries(obj)) {
    const name = prefix ? `${prefix}[${key}]` : key;
    if (value === null || value === undefined) continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      parts.push(encodeForm(value, name));
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === "object") parts.push(encodeForm(v, `${name}[${i}]`));
        else parts.push(`${name}[${i}]=${encodeURIComponent(v)}`);
      });
    } else {
      parts.push(`${name}=${encodeURIComponent(value)}`);
    }
  }
  return parts.filter(Boolean).join("&");
}

export async function stripeRequest(path, body) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeForm(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe ${res.status}: ${data.error?.message ?? "unknown error"}`);
  }
  return data;
}

// Creates a subscription Checkout Session for the $14/mo Pro plan.
// Uses STRIPE_PRICE_ID if set; otherwise creates the price inline.
export async function createCheckoutSession({ userId, email, successUrl, cancelUrl }) {
  const priceId = process.env.STRIPE_PRICE_ID;
  const lineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PRO_PRICE_USD * 100,
          recurring: { interval: "month" },
          product_data: { name: "CopyAI Pro — Freelancer Plan" },
        },
      };

  return stripeRequest("/checkout/sessions", {
    mode: "subscription",
    customer_email: email,
    client_reference_id: userId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [lineItem],
  });
}

// Verifies a Stripe webhook signature (Stripe-Signature header).
export function verifyWebhookSignature(payload, sigHeader, secret, toleranceSec = 300) {
  if (!sigHeader || !secret) return false;
  const parts = Object.fromEntries(
    sigHeader.split(",").map((kv) => kv.split("=").map((s) => s.trim()))
  );
  const timestamp = Number(parts.t);
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSec) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
