// Thin Groq chat-completions client (OpenAI-compatible API).
// Uses fetch directly — no SDK dependency needed.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export function groqConfigured() {
  return Boolean(process.env.GROQ_API_KEY);
}

// Returns the assistant message content as a string, or throws.
export async function groqChat(messages, { json = false, maxTokens = 1024, temperature = 0.8 } = {}) {
  if (!groqConfigured()) throw new Error("GROQ_API_KEY is not set");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq API ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response");
  return content;
}
