// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error("Missing SUPABASE env vars (URL or SERVICE_ROLE_KEY).");
}

// Full access server client (bypasses RLS). Never import this on the client!
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});