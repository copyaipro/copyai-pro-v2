// Tier resolution for the current request's user.
// MOCK: reads the in-memory user registry; swap to Supabase queries later.
import {
  ensureUser,
  getTier,
  getUserCount,
  headlinesThisMonth,
  FREE_FOREVER_SEATS,
  FREE_HEADLINES_PER_MONTH,
} from "./mockDb";

export const PRO_PRICE = "$14/month";

// Registers the user (first-seen order = signup order) and returns tier info.
export function resolveTier(user) {
  ensureUser(user.id, user.email);
  const tier = getTier(user.id);
  const used = headlinesThisMonth(user.id);

  return {
    tier, // 'free_forever' | 'pro' | 'free'
    label:
      tier === "free_forever"
        ? "Free forever 🎉"
        : tier === "pro"
        ? "Pro"
        : "Free tier",
    unlimited: tier !== "free",
    headlinesUsed: used,
    headlinesLimit: tier === "free" ? FREE_HEADLINES_PER_MONTH : null,
    canSubscribe: tier === "free" && getUserCount() >= FREE_FOREVER_SEATS,
  };
}
