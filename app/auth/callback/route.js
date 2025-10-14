import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabaseServer";

export async function POST(req) {
  const { event, session } = await req.json();
  const supabase = await getSupabaseServer();

  if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    // Write the session cookies on the server
    await supabase.auth.setSession(session);
  } else if (event === "SIGNED_OUT") {
    await supabase.auth.signOut();
  }
  return NextResponse.json({ ok: true });
}