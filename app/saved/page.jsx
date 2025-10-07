import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import Header from "@/components/Header";
import RemoveSavedButton from "@/components/RemoveSavedButton";

export default async function SavedPage() {
  const supabase = await getSupabaseServer();

  // ensure user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold mb-4">⭐ Saved Swimmers</h1>
          <p>
            Please <Link href="/sign-in" className="text-blue-400 underline">sign in</Link> to
            view your saved swimmers.
          </p>
        </main>
      </div>
    );
  }

  // load saved list
  const { data: saved, error } = await supabase
    .from("saved_swimmers")
    .select(
      `
      swimmer_id,
      swimmers:swimmer_id (
        full_name,
        gender,
        age_years
      )
    `
    )
    .eq("user_id", user.id)
    .order("swimmer_id");

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">⭐ Saved Swimmers</h1>

        {error && <p className="text-red-400">Failed to load saved swimmers.</p>}

        {!saved || saved.length === 0 ? (
          <p>
            No saved swimmers yet. Go to{" "}
            <Link href="/swimmers" className="text-blue-400 underline">Swimmers</Link> to add some.
          </p>
        ) : (
          <ul className="space-y-3">
            {saved.map((row) => (
              <li
                key={row.swimmer_id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <div className="font-medium">{row.swimmers?.full_name}</div>
                  <div className="text-white/60 text-sm">
                    {row.swimmers?.gender} • Age {row.swimmers?.age_years}
                  </div>
                </div>

                <RemoveSavedButton swimmerId={row.swimmer_id} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}