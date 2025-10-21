// components/SavedSwimmersSection.jsx
import Link from "next/link";
import { getSupabaseServer } from "../lib/supabaseServer";
import AvatarInitial from "./AvatarInitial";

export default async function SavedSwimmersSection() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → friendly CTA
  if (!user) {
    return (
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] font-semibold">My saved swimmers</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f1a20] p-5 sm:p-6">
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

              <div className="mt-4 grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
                <Link
                  href="/sign-in?next=/"
                  className="rounded-full bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm text-white transition-colors text-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up?next=/"
                  className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-white transition-colors text-center"
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
        <span className="text-[12px] text-white/50">{swimmers.length} saved</span>
      </div>

      {swimmers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0f1a20] p-5 sm:p-6">
          <h3 className="text-white text-[16px] font-semibold">
            You haven’t saved anyone yet
          </h3>
          <p className="text-white/60 mt-1 text-[14px]">
            Tap <span className="text-white/80 font-medium">“Save”</span> on a swimmer’s
            profile to add them here and follow their improvements.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {swimmers.map((s) => {
            const gender =
              s.gender
                ? s.gender.toLowerCase() === "female"
                  ? "♀ Female"
                  : "♂ Male"
                : null;

            return (
              <li
                key={s.id}
                className="rounded-2xl border border-white/10 bg-[#0f1a20] p-4
                           sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-3"
              >
                {/* LEFT: avatar + info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-white/5 grid place-items-center">
                    <AvatarInitial name={s.full_name} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="text-white font-medium leading-tight
                                 whitespace-normal break-words sm:truncate"
                    >
                      {s.full_name}
                    </div>

                    <div className="text-white/60 text-[12px] sm:text-[13px] mt-1 flex flex-wrap gap-x-2 gap-y-1">
                      {gender ? <span>{gender}</span> : <span>—</span>}
                      <span>•</span>
                      <span>Age {s.age_years != null ? s.age_years : "—"}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: actions (stacked & full-width on mobile) */}
                <div className="mt-3 sm:mt-0 flex w-full sm:w-auto items-center gap-2 sm:justify-end">
                  <Link
                    href={`/swimmers/${s.id}`}
                    className="rounded-full bg-white/8 hover:bg-white/12 px-4 py-2 text-sm text-white
                               transition-colors w-full sm:w-auto text-center"
                  >
                    View
                  </Link>

                  <span
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1c3f24]
                               text-green-300 px-4 py-2 text-sm w-full sm:w-auto"
                  >
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
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}