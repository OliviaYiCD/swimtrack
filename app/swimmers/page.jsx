// app/swimmers/page.jsx
import Link from "next/link";
import { getSupabaseServer } from "../../lib/supabaseServer";
import SaveButton from "../../components/SaveButton";

export default async function SwimmersPage() {
  const supabase = await getSupabaseServer();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get all swimmers
  const { data: swimmers = [], error } = await supabase
    .from("swimmers")
    .select("id, full_name, gender, age_years")
    .order("full_name", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🏊 Swimmers</h1>
        {user ? (
          <div className="text-sm opacity-70">Logged in as {user.email}</div>
        ) : (
          <div className="text-sm opacity-70">Not signed in</div>
        )}
      </header>

      {error && <p className="text-red-400">Error: {error.message}</p>}

      {swimmers.length === 0 ? (
        <p>No swimmers found.</p>
      ) : (
        <ul className="space-y-4">
          {swimmers.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{s.full_name}</div>
                <div className="text-sm opacity-70">
                  {s.gender} • Age {s.age_years}
                </div>
              </div>
              {user ? (
                <SaveButton swimmerId={s.id} />
              ) : (
                <Link
                  href="/sign-in"
                  className="text-blue-400 hover:underline text-sm"
                >
                  Sign in to Save
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 👉 Added link below the list */}
      <p className="mt-6">
        <Link
          href="/saved"
          className="text-blue-400 hover:underline text-sm"
        >
          View my saved swimmers →
        </Link>
      </p>
    </main>
  );
}