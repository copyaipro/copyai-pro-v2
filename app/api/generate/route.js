import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { groqChat, groqConfigured } from "../../../lib/groq";
import { resolveTierFor, FREE_HEADLINES_PER_MONTH } from "../../../lib/data";

// Fallback: canned headline templates, used when Groq is unavailable.
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

// Pull a short subject line out of the brief for the fallback templates.
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

function fallbackHeadlines(brief) {
  const subject = subjectFromBrief(brief);
  return TEMPLATES.map((fn) => fn(subject));
}

async function groqHeadlines(brief) {
  const content = await groqChat(
    [
      {
        role: "system",
        content:
          'You are an expert direct-response copywriter. Given a client brief, write exactly 10 distinct, punchy marketing headlines. Mix angles: direct benefit, curiosity, social proof, urgency, contrarian. No numbering, no quotes, no explanations. Respond ONLY with JSON: {"headlines": ["...", ...]}',
      },
      { role: "user", content: `Client brief:\n${brief}` },
    ],
    { json: true, maxTokens: 800 }
  );

  const parsed = JSON.parse(content);
  const headlines = (parsed.headlines ?? [])
    .filter((h) => typeof h === "string" && h.trim())
    .slice(0, 10);
  if (headlines.length === 0) throw new Error("Groq returned no headlines");
  return headlines;
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

  // Enforce the free-tier monthly limit (10 generated headlines ≈ 1 batch).
  const tierInfo = await resolveTierFor(supabase, user);
  if (!tierInfo.unlimited && tierInfo.headlinesUsed >= FREE_HEADLINES_PER_MONTH) {
    return NextResponse.json(
      {
        error: `Free tier limit reached (${FREE_HEADLINES_PER_MONTH} headlines/month). Upgrade to Pro for unlimited generations.`,
        upgrade: true,
      },
      { status: 402 }
    );
  }

  let headlines;
  let source = "groq";
  if (groqConfigured()) {
    try {
      headlines = await groqHeadlines(brief.trim());
    } catch (err) {
      console.error("Groq headline generation failed, using fallback:", err.message);
      headlines = fallbackHeadlines(brief);
      source = "fallback";
    }
  } else {
    headlines = fallbackHeadlines(brief);
    source = "fallback";
  }

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

  return NextResponse.json({ headlines, source });
}
