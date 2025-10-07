"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function SupabaseListener() {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Tell the server to update cookies
      await fetch("/auth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, session }),
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}