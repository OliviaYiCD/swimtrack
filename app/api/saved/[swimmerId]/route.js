import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function DELETE(_request, ctx) {
  const supabase = getSupabaseServer();

  // ✅ Next 15: await params
  const { swimmerId } = await ctx.params;

  // who is signed in?
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // delete the record for this user + swimmer
  const { error } = await supabase
    .from("saved_swimmers")
    .delete()
    .eq("user_id", user.id)
    .eq("swimmer_id", swimmerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}