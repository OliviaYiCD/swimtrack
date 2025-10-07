// app/api/saved/route.js
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  const supabase = getSupabaseServer();

  // Who is saving?
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // What swimmer to save?
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { swimmerId } = body || {};
  if (!swimmerId) {
    return NextResponse.json({ error: "Missing swimmerId" }, { status: 400 });
  }

  // Insert (ignore duplicates)
  const { error } = await supabase
    .from("saved_swimmers")
    .upsert(
      { user_id: user.id, swimmer_id: swimmerId },
      { onConflict: "user_id,swimmer_id", ignoreDuplicates: true }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}