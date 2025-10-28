import Link from "next/link";
import { getSupabaseServer } from "../../../lib/supabaseServer";
import FeaturedSwimmerRow from "../../../components/FeaturedSwimmerRow";
import { slugify } from "../../../lib/slugify";

export const dynamic = "force-dynamic";

export default async function ClubPage({ params }) {
  const { slug } = await params;
  const supabase = await getSupabaseServer();

  // 1) Resolve the club by slug
  const { data: clubs = [] } = await supabase
    .from("clubs_v2")
    .select("id, name")
    .limit(2000); // small table; fine to pull and match locally

  const club = (clubs || []).find((c) => slugify(c.name) === slug);
  if (!club) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-white text-xl font-semibold mb-3">Club not found</h1>
        <p className="text-white/70">
          We couldn’t find that club.{" "}
          <Link href="/" className="text-teal-300 hover:underline">Back to home</Link>
        </p>
      </main>
    );
  }

  // 2) Pull swimmers for this club (swimmers_v2 has club TEXT, not an id)
  // Match by case-insensitive equality after trimming.
  const { data: swimmers = [] } = await supabase
    .from("swimmers_v2")
    .select("id, full_name, gender, age_years, club")
    .or(`club.ilike.${club.name}`) // Supabase doesn’t support equalsIgnoreCase; ILIKE here
    .order("full_name", { ascending: true });

  // 3) Saved map for toggles
  let savedMap = new Map();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user || null;
  if (user) {
    const { data: saved = [] } = await supabase
      .from("saved_swimmers_v2")
      .select("swimmer_id")
      .eq("user_id", user.id);
    savedMap = new Map((saved || []).map((r) => [r.swimmer_id, true]));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-white text-2xl font-bold tracking-wide">
        {club.name}
      </h1>
      <p className="text-white/60 mt-1">All swimmers registered with this club</p>

      <ul className="space-y-3 mt-6">
        {(swimmers || []).map((s) => (
          <FeaturedSwimmerRow
            key={s.id}
            swimmer={s}
            isSaved={savedMap.get(s.id) === true}
            isAuthed={!!user}
          />
        ))}
        {(!swimmers || swimmers.length === 0) && (
          <li className="text-white/60">No swimmers found for this club.</li>
        )}
      </ul>
    </main>
  );
}