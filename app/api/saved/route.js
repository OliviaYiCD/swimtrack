import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Optional but helpful in dev to prevent caching oddities
export const dynamic = "force-dynamic";

/** Bind Next cookies to Supabase client */
function bindCookies(cookieStore) {
  return {
    get(name) {
      return cookieStore.get(name)?.value;
    },
    set(name, value, options) {
      // next/headers cookies API uses set() for both set & delete
      cookieStore.set({ name, value, ...options });
    },
    remove(name, options) {
      cookieStore.set({ name, value: "", ...options });
    },
  };
}

/** Build a server client that can read the auth cookie */
async function getSupabase() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: bindCookies(store) }
  );
}

export async function POST(req) {
  const supabase = await getSupabase();

  // who am I?
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  // body
  const { swimmer_id } = await req.json().catch(() => ({}));
  if (!swimmer_id) {
    return NextResponse.json({ error: "swimmer_id required" }, { status: 400 });
  }

  // insert or ignore duplicate
  const { error } = await supabase
    .from("saved_swimmers_v2")
    .upsert(
      { user_id: user.id, swimmer_id },
      { onConflict: "user_id,swimmer_id", ignoreDuplicates: true }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not authenticated" }, { status: 401 });

  const { swimmer_id } = await req.json().catch(() => ({}));
  if (!swimmer_id) {
    return NextResponse.json({ error: "swimmer_id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_swimmers_v2")
    .delete()
    .eq("user_id", user.id)
    .eq("swimmer_id", swimmer_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}