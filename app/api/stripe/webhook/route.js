import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "../../../../lib/stripe";
import { setSubscribed } from "../../../../lib/mockDb";

// Stripe webhook: flips the user's subscription flag on checkout completion
// and subscription cancellation. Configure the endpoint in the Stripe
// dashboard pointing at /api/stripe/webhook with STRIPE_WEBHOOK_SECRET set.
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
      const userId = event.data.object.client_reference_id;
      if (userId) setSubscribed(userId, true);
      break;
    }
    case "customer.subscription.deleted": {
      // We stored the user id in checkout's client_reference_id; subscription
      // events carry metadata instead. Read it if present.
      const userId = event.data.object.metadata?.user_id;
      if (userId) setSubscribed(userId, false);
      break;
    }
    default:
      break; // Unhandled event types are acknowledged silently.
  }

  return NextResponse.json({ received: true });
}
