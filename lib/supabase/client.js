// MOCK: browser-side stand-in for the Supabase client.
// Any email/password is accepted; the "session" is a plain cookie the
// mock server client reads. Swap back to createBrowserClient later.

const SESSION_COOKIE = "mock_session";

export function createClient() {
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
