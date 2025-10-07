import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import Header from "@/components/Header";
import RemoveSavedButton from "@/components/RemoveSavedButton"; // <-- keep this path as in your project

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const supabase = getSupabaseServer();

  // who is signed in?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Header />
        <h1 className="mt-6 text-2xl font-bold">👤 My Swimmers</h1>
        <p className="mt-4 opacity-70">
          Please <Link href="/sign-in" className="text-blue-400 hover:underline">sign in</Link> to see saved swimmers.
        </p>
      </main>
    );
  }

  // Pull saved swimmers for this user, joined to swimmers table
  const { data: rows = [], error } = await supabase
    .from("saved_swimmers")
    .select(
      `
        swimmer_id,
        swimmers:swimmer_id (
          id,
          full_name,
          gender,
          age_years
        )
      `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Header />

      <section className="mt-6">
        <h1 className="text-2xl font-bold">👤 My Swimmers</h1>

        {error && (
          <p className="mt-4 text-red-400">Error: {error.message}</p>
        )}

        {rows.length === 0 ? (
          <p className="mt-4 opacity-70">You haven’t saved any swimmers yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {rows.map((r) => {
              // Depending on your select shape above, the swimmer comes back under `r.swimmers`
              const s = r.swimmers ?? {};
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div>
                    <div className="font-semibold">{s.full_name}</div>
                    <div className="text-sm opacity-70">
                      {s.gender} • Age {s.age_years}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* 👉 NEW: View button */}
                    <Link
                      href={`/swimmers/${s.id}`}
                      className="rounded-md px-3 py-1.5 text-sm text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                    >
                      View
                    </Link>

                    <RemoveSavedButton swimmerId={s.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}