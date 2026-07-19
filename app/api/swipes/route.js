import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { listSwipes, saveSwipe } from "../../../lib/data";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ swipes: await listSwipes(supabase, user) });
}

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

  try {
    const swipe = await saveSwipe(supabase, user, { type, title, content });
    return NextResponse.json({ swipe });
  } catch (err) {
    console.error("saveSwipe error:", err.message);
    return NextResponse.json({ error: "Could not save swipe." }, { status: 500 });
  }
}
