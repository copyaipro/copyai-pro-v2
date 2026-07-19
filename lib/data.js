// Data access layer: swipes, profile/tier, usage.
// Routes real Supabase queries when configured, in-memory mock otherwise.
import { supabaseConfigured } from "./supabase/config";
import {
  ensureUser,
  getTier as mockGetTier,
  getUserCount,
  headlinesThisMonth as mockHeadlinesThisMonth,
  getSwipes as mockGetSwipes,
  insertSwipe as mockInsertSwipe,
  FREE_FOREVER_SEATS,
  FREE_HEADLINES_PER_MONTH,
} from "./mockDb";

export { FREE_HEADLINES_PER_MONTH };

// --- swipes --------------------------------------------------------------

export async function listSwipes(supabase, user) {
  if (!supabaseConfigured()) {
    return mockGetSwipes(user.id).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }
  const { data, error } = await supabase
    .from("swipes")
    .select("id, type, title, content, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listSwipes error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function saveSwipe(supabase, user, { type, title, content }) {
  const row = {
    user_id: user.id,
    type: type || "email",
    title: title || "Untitled",
    content,
  };
  if (!supabaseConfigured()) return mockInsertSwipe(row);

  const { data, error } = await supabase.from("swipes").insert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// --- profile / tier ------------------------------------------------------

// Returns { tier, label, unlimited, headlinesUsed, headlinesLimit, canSubscribe }
export async function resolveTierFor(supabase, user) {
  if (!supabaseConfigured()) {
    ensureUser(user.id, user.email);
    const tier = mockGetTier(user.id);
    const used = mockHeadlinesThisMonth(user.id);
    return shape(tier, used, mockGetTier(user.id) === "free" && getUserCount() >= FREE_FOREVER_SEATS);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscribed")
    .eq("id", user.id)
    .maybeSingle();

  const tier = profile?.subscribed ? "pro" : "free";

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("headlines")
    .select("id", { count: "exact", head: true })
    .gte("created_at", monthStart.toISOString());

  return shape(tier, count ?? 0, tier === "free");
}

function shape(tier, used, canSubscribe) {
  return {
    tier,
    label: tier === "free_forever" ? "Free forever 🎉" : tier === "pro" ? "Pro" : "Free tier",
    unlimited: tier !== "free",
    headlinesUsed: used,
    headlinesLimit: tier === "free" ? FREE_HEADLINES_PER_MONTH : null,
    canSubscribe,
  };
}
