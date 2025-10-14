"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "../lib/supabaseBrowser";

export default function SupabaseListener() {
  useEffect(() => {
    const supabase = supabaseBrowser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      // Keep UI in sync; you can optionally refresh router here
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return null;
}