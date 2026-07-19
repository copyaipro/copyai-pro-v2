import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getSwipes, insertSwipe } from "../../../lib/mockDb";

// MOCK: reads from the in-memory swipe store instead of Supabase.
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ swipes: getSwipes(user.id) });
}

// MOCK: saves to the in-memory swipe store instead of Supabase.
export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { type, title, content } = await request.json();
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  }

  const swipe = insertSwipe({
    user_id: user.id,
    type: type || "email",
    title: title || "Untitled",
    content,
  });

  return NextResponse.json({ swipe });
}
