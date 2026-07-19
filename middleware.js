import { NextResponse } from "next/server";

// MOCK: session is a plain cookie set by the mock Supabase client.
// Swap back to @supabase/ssr's createServerClient when the real backend lands.
const SESSION_COOKIE = "mock_session";

export async function middleware(request) {
  const isLoggedIn = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // Protect app pages; redirect signed-in users away from auth pages.
  const path = request.nextUrl.pathname;
  const isProtected = ["/dashboard", "/headlines", "/emails", "/swipes"].some((p) =>
    path.startsWith(p)
  );
  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isLoggedIn && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/headlines/:path*",
    "/emails/:path*",
    "/swipes/:path*",
    "/login",
    "/signup",
  ],
};
