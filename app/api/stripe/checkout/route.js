import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createCheckoutSession, stripeConfigured } from "../../../../lib/stripe";

// Starts a Stripe Checkout session for the $14/mo Pro subscription.
export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Set STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  try {
    const session = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      successUrl: `${origin}/dashboard?upgraded=1`,
      cancelUrl: `${origin}/dashboard?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    return NextResponse.json(
      { error: "Could not start checkout. Try again later." },
      { status: 502 }
    );
  }
}
