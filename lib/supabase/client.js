// Browser-side Supabase client. Uses the real @supabase/ssr client when
// NEXT_PUBLIC_SUPABASE_* env vars are set; otherwise falls back to the
// cookie-based mock so local dev works without a backend.
import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfigured } from "./config";

const SESSION_COOKIE = "mock_session";

function createMockClient() {
  return {
    auth: {
      async signUp({ email }) {
        // Mock: no confirmation email — sign straight in.
        document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(email)}; path=/`;
        return { error: null };
      },
      async signInWithPassword({ email }) {
        document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(email)}; path=/`;
        return { error: null };
      },
    },
  };
}

export function createClient() {
  if (!supabaseConfigured()) return createMockClient();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
