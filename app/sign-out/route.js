import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  await supabase.auth.signOut(); // clears the Supabase auth cookie

  // Redirect wherever you like after sign-out
  const url = new URL("/", request.url); // or "/sign-in"
  return NextResponse.redirect(url, { status: 303 });
}