"use client";

import { useState } from "react";

export default function EmailCapture({ compact = false }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    // TODO(day 2): POST to /api/waitlist — backend lands tomorrow.
    // For now, stash locally so no signup is ever lost during demos.
    try {
      const saved = JSON.parse(localStorage.getItem("waitlist") || "[]");
      localStorage.setItem("waitlist", JSON.stringify([...saved, { email, at: new Date().toISOString() }]));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
        You&apos;re on the list! We&apos;ll email you when early access opens. 🎉
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={compact ? "email-footer" : "email-hero"} className="sr-only">
          Email address
        </label>
        <input
          id={compact ? "email-footer" : "email-hero"}
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="you@yourstudio.com"
          className="w-full rounded-lg border border-ink-500 bg-ink-800 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-900 transition hover:bg-gold-400 disabled:opacity-60"
        >
          {status === "submitting" ? "Joining..." : "Get Early Access"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-400">Please enter a valid email address.</p>
      )}
      {!compact && (
        <p className="mt-2 text-xs text-neutral-500">
          Free tier included. No credit card required. Unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
