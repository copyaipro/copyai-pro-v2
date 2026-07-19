import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

// MOCK: canned headline templates instead of an OpenAI call.
// TODO: restore the chat-completions request when the real backend lands.
const TEMPLATES = [
  (t) => `The ${t} Playbook Your Competitors Hope You Never Read`,
  (t) => `Why Most Advice About ${t} Quietly Fails Freelancers`,
  (t) => `${t}, Minus the Guesswork: A 5-Step Shortcut`,
  (t) => `How Top Studios Turn ${t} Into Repeat Clients`,
  (t) => `Stop Overthinking ${t} — Start Shipping It`,
  (t) => `The Hidden Cost of Getting ${t} Wrong`,
  (t) => `${t} in Half the Time (Without Cutting Corners)`,
  (t) => `What Nobody Tells You About ${t} Until It's Too Late`,
  (t) => `From Blank Page to ${t} in One Sitting`,
  (t) => `Proof That Better ${t} Wins More Projects`,
];

// Pull a short subject line out of the brief for the templates.
// Handles "Client: Name" / "Brand: Name" style briefs; falls back to first words.
function subjectFromBrief(brief) {
  const labeled = brief.match(/(?:client|brand|company|product)\s*:\s*([^\n.,;]+?)(?=\s*(?:background|brief|goal|about)\s*:|[\n.,;]|$)/i);
  const raw = labeled ? labeled[1] : brief;
  const words = raw
    .trim()
    .split(/\s+/)
    .filter((w) => !/^[a-z]+:$/i.test(w)) // drop stray "Label:" tokens
    .slice(0, 4)
    .join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { brief } = await request.json();
  if (!brief || typeof brief !== "string" || brief.trim().length < 10) {
    return NextResponse.json(
      { error: "Please provide a brief of at least 10 characters." },
      { status: 400 }
    );
  }

  // Mimic real API latency so loading states get exercised.
  await new Promise((r) => setTimeout(r, 800));
  const subject = subjectFromBrief(brief);
  const headlines = TEMPLATES.map((fn) => fn(subject));

  const rows = headlines.map((text) => ({
    user_id: user.id,
    brief: brief.trim(),
    text,
  }));
  const { error: dbError } = await supabase.from("headlines").insert(rows);
  if (dbError) {
    console.error("Supabase insert error:", dbError);
    // Headlines were generated — return them even if saving failed.
  }

  return NextResponse.json({ headlines });
}
