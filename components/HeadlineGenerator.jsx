"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeadlineGenerator() {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [headlines, setHeadlines] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setHeadlines(data.headlines);
      router.refresh(); // refresh the server-rendered history list
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Generate headlines</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={4}
          required
          minLength={10}
          placeholder="Paste your client brief — product, audience, key benefit, tone…"
          className="input-dark"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-gold"
        >
          {loading ? "Generating…" : "Generate 10 headlines"}
        </button>
      </form>

      {headlines.length > 0 && (
        <ul className="mt-6 space-y-2">
          {headlines.map((h, i) => (
            <li
              key={i}
              className="rounded-lg border border-ink-600 bg-ink-800 px-4 py-3 text-sm text-neutral-200"
            >
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
