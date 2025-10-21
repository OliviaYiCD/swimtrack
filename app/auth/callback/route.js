// app/auth/callback/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// --- POST: sync email/password session ---
export async function POST(request) {
  try {
    const { session } = await request.json();
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: (name, value, options) => cookieStore.set({ name, value, ...options }),
          remove: (name, options) =>
            cookieStore.set({ name, value: "", ...options, maxAge: 0 }),
        },
      }
    );

    if (session?.access_token && session?.refresh_token) {
      // This writes the sb-*-auth-token cookie for the server
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      return NextResponse.json({ ok: true });
    }

    // No session → ensure logged out
    await supabase.auth.signOut();
    return NextResponse.json({ ok: false });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// --- GET: Google OAuth code exchange (keep what you already had) ---
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/";

    if (!code) return NextResponse.redirect(new URL(next, url.origin));

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: (name, value, options) => cookieStore.set({ name, value, ...options }),
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