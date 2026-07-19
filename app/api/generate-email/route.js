import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { groqChat, groqConfigured } from "../../../lib/groq";
import { INDUSTRIES, TONES, generateSequence } from "../../../lib/emailTemplates";

const LABELS = ["Email 1 — Welcome", "Email 2 — Value", "Email 3 — CTA / Offer"];

async function groqSequence(industry, tone) {
  const content = await groqChat(
    [
      {
        role: "system",
        content:
          'You are an expert email copywriter. Write a 3-email onboarding sequence: (1) welcome, (2) value/nurture, (3) offer/CTA. Each email needs a subject line and a complete body (greeting, 2-3 short paragraphs, signoff, P.S.). Respond ONLY with JSON: {"emails": [{"subject": "...", "body": "..."}, ...]} with exactly 3 emails.',
      },
      {
        role: "user",
        content: `Industry: ${industry}\nTone: ${tone}\nWrite the 3-email sequence.`,
      },
    ],
    { json: true, maxTokens: 2048 }
  );

  const parsed = JSON.parse(content);
  const emails = (parsed.emails ?? [])
    .filter((e) => e && typeof e.subject === "string" && typeof e.body === "string")
    .slice(0, 3);
  if (emails.length !== 3) throw new Error("Groq returned an incomplete sequence");

  return emails.map((e, i) => ({ label: LABELS[i], subject: e.subject, body: e.body }));
}

export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { industry, tone } = await request.json();
  if (!INDUSTRIES.includes(industry) || !TONES.includes(tone)) {
    return NextResponse.json({ error: "Invalid industry or tone." }, { status: 400 });
  }

  let sequence;
  let source = "groq";
  if (groqConfigured()) {
    try {
      sequence = await groqSequence(industry, tone);
    } catch (err) {
      console.error("Groq email generation failed, using fallback:", err.message);
      sequence = generateSequence(industry, tone);
      source = "fallback";
    }
  } else {
    sequence = generateSequence(industry, tone);
    source = "fallback";
  }

  return NextResponse.json({ sequence, source });
}
