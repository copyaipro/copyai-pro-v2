"use client";

import { useState } from "react";
import { INDUSTRIES, TONES } from "../lib/emailTemplates";

function EmailCard({ email }) {
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  async function handleSave() {
    setSaveState("saving");
    try {
      const res = await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email",
          title: `${email.label}: ${email.subject}`,
          content: email.body,
        }),
      });
      setSaveState(res.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">
            {email.label}
          </p>
          <h3 className="mt-1 font-semibold">Subject: {email.subject}</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saveState === "saving" || saveState === "saved"}
          className="btn-outline shrink-0 disabled:opacity-60"
        >
          {saveState === "saved"
            ? "Saved ✓"
            : saveState === "saving"
            ? "Saving…"
            : saveState === "error"
            ? "Retry save"
            : "Save to Swipe File"}
        </button>
      </div>
      <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-ink-800 px-4 py-3 font-sans text-sm leading-relaxed text-neutral-300">
        {email.body}
      </pre>
    </div>
  );
}

export default function EmailSequenceGenerator() {
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [sequence, setSequence] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genKey, setGenKey] = useState(0); // reset EmailCard save state per generation

  async function handleGenerate(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setSequence(data.sequence);
      setGenKey((k) => k + 1);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectClass = "input-dark mt-1 bg-ink-800";

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleGenerate}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold">Generate an email sequence</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-neutral-300">
              Industry
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={selectClass}
            >
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-neutral-300">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={selectClass}
            >
              {TONES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-gold mt-5"
        >
          {loading ? "Generating…" : "Generate Sequence"}
        </button>
      </form>

      {sequence && (
        <div className="space-y-6">
          {sequence.map((email) => (
            <EmailCard key={`${genKey}-${email.label}`} email={email} />
          ))}
        </div>
      )}
    </div>
  );
}
