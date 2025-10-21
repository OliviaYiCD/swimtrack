// lib/supabaseServer.js
import { cookies } from "next/headers";
import { createServerClient, createBrowserClient } from "@supabase/ssr";

export async function getSupabaseServer() {
  if (typeof window !== "undefined") {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
  }

  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        // no-ops in Server Components to avoid write errors
        set() {},
        remove() {},
      },
    }
  );
}