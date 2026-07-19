import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "../../../../lib/stripe";
import { createServiceClient } from "../../../../lib/supabase/server";
import { setSubscribed as mockSetSubscribed } from "../../../../lib/mockDb";

// Stripe webhook: persists subscription state. Writes to Supabase profiles
// via the service-role key when configured; falls back to the mock store.
// Configure the endpoint in the Stripe dashboard → /api/stripe/webhook,
// with STRIPE_WEBHOOK_SECRET set.
async function setSubscribed(userId, subscribed, extra = {}) {
  const admin = createServiceClient();
  if (!admin) {
    mockSetSubscribed(userId, subscribed);
    return;
  }
  const { error } = await admin
    .from("profiles")
    .update({ subscribed, updated_at: new Date().toISOString(), ...extra })
    .eq("id", userId);
  if (error) console.error("profiles update error:", error.message);
}

export async function POST(request) {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!verifyWebhookSignature(payload, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const obj = event.data.object;
      const userId = obj.client_reference_id;
      if (userId) {
        await setSubscribed(userId, true, {
          stripe_customer_id: obj.customer ?? null,
          stripe_subscription_id: obj.subscription ?? null,
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const userId = event.data.object.metadata?.user_id;
      if (userId) await setSubscribed(userId, false);
      break;
    }
    default:
      break; // Unhandled event types are acknowledged silently.
  }

  return NextResponse.json({ received: true });
}
