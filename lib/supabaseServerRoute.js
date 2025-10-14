import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Use this ONLY in route handlers / server actions (NOT in layout/Header)
export function getSupabaseServerForRoute() {
  const cookieStorePromise = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: async (name) => (await cookieStorePromise).get(name)?.value,
        set: async (name, value, options) => {
          (await cookieStorePromise).set(name, value, options);
        },
        remove: async (name, options) => {
          (await cookieStorePromise).set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}