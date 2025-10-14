// app/api/me/route.js
import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabaseServer";

export const dynamic = "force-dynamic"; // ensure fresh auth on each call

export async function GET() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ user: null, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ user: data?.user ?? null });
}