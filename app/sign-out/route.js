// app/sign-out/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(request) {
  // ✅ Must await cookies() in Next.js 15+
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // ✅ Clears Supabase auth cookies server-side
  await supabase.auth.signOut();

  // ✅ Redirect wherever you like after sign-out
  const redirectUrl = new URL("/", request.url);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}