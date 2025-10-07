// lib/supabaseServer.js
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function getSupabaseServer() {
  // Do NOT read from cookies() synchronously; keep it as a promise and await inside methods
  const cookieStorePromise = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Next.js 15: these methods can be async and must await the cookie store
        get: async (name) => (await cookieStorePromise).get(name)?.value,
        set: async (name, value, options) =>
          (await cookieStorePromise).set(name, value, options),
        remove: async (name, options) =>
          (await cookieStorePromise).set(name, "", { ...options, maxAge: 0 }),
      },
    }
  );
}