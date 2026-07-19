// Server-side Supabase client. Real @supabase/ssr client when configured;
// cookie-based mock otherwise (local dev without a backend).
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "./config";
import { getHeadlines, insertHeadlines } from "../mockDb";

const SESSION_COOKIE = "mock_session";

export { supabaseConfigured };

// --- real client ---------------------------------------------------------

function createRealClient(cookieStore) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — middleware refreshes sessions.
          }
        },
      },
    }
  );
}

// Service-role client for webhook writes (bypasses RLS). Server-only.
export function createServiceClient() {
  if (!supabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

// --- mock client ---------------------------------------------------------

function userFromCookie(cookieStore) {
  const email = cookieStore.get(SESSION_COOKIE)?.value;
  if (!email) return null;
  return { id: `mock-${email}`, email };
}

function createMockClient(cookieStore) {
  const user = userFromCookie(cookieStore);

  return {
    auth: {
      async getUser() {
        return { data: { user } };
      },
      async signOut() {
        try {
          cookieStore.delete(SESSION_COOKIE);
        } catch {
          // Called from a Server Component — ignore.
        }
        return { error: null };
      },
      async verifyOtp() {
        // Mock: every confirmation link "succeeds".
        return { error: null };
      },
    },
    from(table) {
      if (table !== "headlines") throw new Error(`Mock DB has no table "${table}"`);
      return {
        select() {
          const rows = user ? getHeadlines(user.id) : [];
          const builder = {
            _rows: [...rows],
            order(column, { ascending } = {}) {
              this._rows.sort((a, b) =>
                ascending
                  ? String(a[column]).localeCompare(String(b[column]))
                  : String(b[column]).localeCompare(String(a[column]))
              );
              return this;
            },
            limit(n) {
              this._rows = this._rows.slice(0, n);
              return this;
            },
            then(resolve, reject) {
              return Promise.resolve({ data: this._rows, error: null }).then(resolve, reject);
            },
          };
          return builder;
        },
        async insert(rows) {
          insertHeadlines(rows);
          return { error: null };
        },
      };
    },
  };
}

// --- entry point ---------------------------------------------------------

export function createClient() {
  const cookieStore = cookies();
  return supabaseConfigured() ? createRealClient(cookieStore) : createMockClient(cookieStore);
}
