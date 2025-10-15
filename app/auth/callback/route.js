// app/auth/callback/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/";

    if (!code) {
      // Nothing to exchange; just go where the user intended.
      return NextResponse.redirect(new URL(next, url.origin));
    }

    // Build a route-safe Supabase client that CAN mutate cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: (name, value, options) =>
            cookieStore.set({ name, value, ...options }),
          remove: (name, options) =>
            cookieStore.set({ name, value: "", ...options, maxAge: 0 }),
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url.origin)
      );
    }

    return NextResponse.redirect(new URL(next, url.origin));
  } catch (e) {
    return new NextResponse(`Auth callback error: ${e.message}`, { status: 500 });
  }
}