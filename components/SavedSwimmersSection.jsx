// components/SavedSwimmersSection.jsx
import Link from "next/link";
import { getSupabaseServer } from "../lib/supabaseServer";
import AvatarInitial from "./AvatarInitial";

export default async function SavedSwimmersSection() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, show empty state with CTAs
  if (!user) {
    return (
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] font-semibold">My saved swimmers</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f1a20] p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-full bg-blue-500/20 text-blue-300 grid place-items-center text-lg font-bold">
              ★
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white text-[16px] font-semibold">
                Sign in to keep your favourites
              </h3>
              <p className="text-white/60 mt-1 text-[14px]">
                Save swimmers you care about and quickly track their progress,
                PBs and rankings across events.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/sign-in?next=/"
                  className="rounded-full bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up?next=/"
                  className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-white transition-colors"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Logged in — fetch saved swimmers
  const { data: saved = [] } = await supabase
    .from("saved_swimmers_v2")
    .select(`
      swimmer_id,
      swimmers_v2:swimmer_id ( id, full_name, gender, age_years )
    `)
    .eq("user_id", user.id)
    .order("swimmer_id", { ascending: true });

  const swimmers = (saved || [])
    .map((r) => r.swimmers_v2)
    .filter(Boolean);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-semibold">My saved swimmers</h2>
        <span className="text-[12px] text-white/50">
          {swimmers.length} saved
        </span>
      </div>

      {swimmers.length === 0 ? (
        // Empty state for logged-in users with no saves yet
        <div className="rounded-2xl border border-white/10 bg-[#0f1a20] p-6">
          <h3 className="text-white text-[16px] font-semibold">
            You haven’t saved anyone yet
          </h3>
          <p className="text-white/60 mt-1 text-[14px]">
            Tap <span className="text-white/80 font-medium">“Save”</span> on a
            swimmer’s profile to add them here and follow their improvements.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {swimmers.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-white/10 bg-[#0f1a20] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-white/5 grid place-items-center">
                    <AvatarInitial name={s.full_name} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-medium truncate">
                      {s.full_name}
                    </div>
                    <div className="text-white/60 text-[13px]">
                      {s.gender ? (s.gender.toLowerCase() === "female" ? "♀ Female" : "♂ Male") : "—"} •{" "}
                      {s.age_years != null ? `Age ${s.age_years}` : "Age —"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/swimmers/${s.id}`}
                    className="rounded-full bg-white/8 hover:bg-white/12 px-4 py-2 text-sm text-white transition-colors"
                  >
                    View
                  </Link>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#1c3f24] text-green-300 px-4 py-2 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        d="M20 6L9 17l-5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Saved
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}