"use client";

import { useState } from "react";

export default function UpgradeButton() {
  const [state, setState] = useState("idle"); // idle | loading | error
  const [error, setError] = useState(null);

  async function handleUpgrade() {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start checkout.");
        setState("error");
        return;
      }
      window.location.href = data.url; // off to Stripe Checkout
    } catch {
      setError("Network error. Try again.");
      setState("error");
    }
  }

  return (
    <div>
      <button onClick={handleUpgrade} disabled={state === "loading"} className="btn-gold">
        {state === "loading" ? "Redirecting…" : "Upgrade to Pro — $14/mo"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
