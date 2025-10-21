// app/auth/callback/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** POST
 * Optional helper: if the client sends {session:{access_token,refresh_token}}
 * we sync it to server cookies. If body is empty, we just no-op (204).
 */
export async function POST(request) {
  // Safely parse JSON (empty body is fine)
  let session = null;
try {
   const body = await request.text();
   if (body) {
     // Handle both raw JSON and accidental base64 cookies
     try {
        const parsed = JSON.parse(body);
      session = parsed?.session ?? null;
     } catch {
       // Ignore non-JSON body
       session = null;
     }
   }
 } catch {
   session = null;
   }
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) =>
          cookieStore.set({ name, value, ...(options || {}) }),
        remove: (name, options) =>
          cookieStore.set({ name, value: "", ...(options || {}), maxAge: 0 }),
      },
    }
  );

  if (session?.access_token && session?.refresh_token) {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    return NextResponse.json({ ok: true });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ ok: false });
}

/** GET
 * Exchange ?code=... for a session (works for OAuth AND password recovery).
 * Then redirect to ?next=/... (default "/").
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/";

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: (name, value, options) =>
            cookieStore.set({ name, value, ...(options || {}) }),
          remove: (name, options) =>
            cookieStore.set({ name, value: "", ...(options || {}), maxAge: 0 }),
        },
      }
    );

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("exchangeCodeForSession error:", error.message);
        return NextResponse.redirect(
          new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url.origin)
        );
      }
    }

    return NextResponse.redirect(new URL(next, url.origin));
  } catch (e) {
    return new NextResponse(`Auth callback error: ${e.message}`, { status: 500 });
  }
}