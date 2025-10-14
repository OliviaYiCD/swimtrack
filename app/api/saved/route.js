// app/api/saved/route.js
import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabaseServer";

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const swimmer_id = body.swimmer_id || body.swimmerId;
  if (typeof swimmer_id !== "string" || !swimmer_id) {
    return NextResponse.json({ error: "Missing 'swimmer_id'" }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const { data: ures, error: uerr } = await supabase.auth.getUser();
  if (uerr) return NextResponse.json({ error: `auth.getUser: ${uerr.message}` }, { status: 500 });
  const user = ures?.user;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // 1️⃣ Ensure swimmer exists in swimmers_v2
  const { data: existsRow, error: existsErr } = await supabase
    .from("swimmers_v2")
    .select("id")
    .eq("id", swimmer_id)
    .maybeSingle();

  if (existsErr && existsErr.code !== "PGRST116") {
    return NextResponse.json({ error: `check swimmers_v2: ${existsErr.message}` }, { status: 400 });
  }

  if (!existsRow) {
    const { data: vrow, error: verr } = await supabase
      .from("vw_results_full")
      .select("swimmer_id, given_name, family_name, event_gender")
      .eq("swimmer_id", swimmer_id)
      .maybeSingle();

    if (verr) {
      return NextResponse.json({ error: `lookup view: ${verr.message}` }, { status: 400 });
    }
    if (!vrow) {
      return NextResponse.json({ error: "Swimmer not found in view; cannot backfill" }, { status: 400 });
    }

    const { error: insErr } = await supabase.from("swimmers_v2").insert({
      id: vrow.swimmer_id,
      given_name: vrow.given_name,
      family_name: vrow.family_name,
      gender: vrow.event_gender,
    });

    if (insErr) {
      return NextResponse.json({ error: `insert swimmers_v2: ${insErr.message}` }, { status: 400 });
    }
  }

  // 2️⃣ Idempotent save (v2 syntax)
  const { error: upsertErr } = await supabase
    .from("saved_swimmers_v2")
    .upsert(
      { user_id: user.id, swimmer_id },
      { onConflict: "user_id,swimmer_id", ignoreDuplicates: true }
    );

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}