// MOCK: cookie-based stand-in for the Supabase server client.
// Implements only the API surface the app uses. Swap back to
// @supabase/ssr's createServerClient when the real backend lands.
import { cookies } from "next/headers";
import { getHeadlines, insertHeadlines } from "../mockDb";

const SESSION_COOKIE = "mock_session";

function userFromCookie(cookieStore) {
  const email = cookieStore.get(SESSION_COOKIE)?.value;
  if (!email) return null;
  return { id: `mock-${email}`, email };
}

export function createClient() {
  const cookieStore = cookies();
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
