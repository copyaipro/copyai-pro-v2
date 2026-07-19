import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

// Handles the email confirmation link from Supabase signup emails.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && type) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  return NextResponse.redirect(new URL("/login", request.url));
}
