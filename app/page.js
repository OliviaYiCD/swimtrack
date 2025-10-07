// app/page.jsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import AvatarInitial from "@/components/AvatarInitial";
import SearchBar from "@/components/SearchBar";
import SaveButton from "@/components/SaveButton";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const sp = await searchParams;                // 👈 await it
  const q = (sp?.q ?? "").trim();

  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("swimmers")
    .select("id, full_name, gender, age_years")
    .order("full_name", { ascending: true });

  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: swimmers = [], error } = await query;

  let savedMap = new Map();
  if (user) {
    const { data: savedRows = [] } = await supabase
      .from("saved_swimmers")
      .select("swimmer_id")
      .eq("user_id", user.id);
    savedMap = new Map(savedRows.map((r) => [r.swimmer_id, true]));
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6 sm:max-w-2xl">
      <SearchBar defaultValue={q} placeholder="Search by name" className="mb-5" />
      <ul className="space-y-3">
        {error && <li className="text-red-400 text-sm">Error: {error.message}</li>}
        {swimmers.map((s) => {
          const initiallySaved = savedMap.get(s.id) === true;
          return (
            <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-[#0f1a20] border border-white/10 px-3 py-4">
              <Link href={`/swimmers/${s.id}`} className="flex-1 flex items-center gap-3">
                <AvatarInitial name={s.full_name} />
                <div className="min-w-0">
                  <div className="text-[17px] font-semibold truncate">{s.full_name}</div>
                  <div className="text-sm text-white/60 mt-[2px]">{s.gender} • Age {s.age_years}</div>
                </div>
              </Link>

              {/* View button */}
              <Link href={`/swimmers/${s.id}`} className="mr-2 rounded-full bg-white/10 hover:bg-white/20 px-3 py-2 text-sm">
                View
              </Link>

              {user ? (
                <SaveButton swimmerId={s.id} initiallySaved={initiallySaved} variant="pill" />
              ) : (
                <Link href="/sign-in" className="flex items-center gap-2 rounded-full bg-[#0b3a5e] text-white px-4 py-2 text-sm hover:bg-[#0d4b79] transition">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Save
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {swimmers.length === 0 && !error && <p className="text-white/70 text-sm mt-6">No swimmers found.</p>}
    </main>
  );
}