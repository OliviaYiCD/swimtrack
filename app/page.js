// app/page.jsx
import Link from "next/link";
import { getSupabaseServer } from "../lib/supabaseServer";
import AvatarInitial from "../components/AvatarInitial";
import SearchBar from "../components/SearchBar";
import SaveButton from "../components/SaveButton";

export const dynamic = "force-dynamic";

const STROKE_LABEL = { FR: "Free", BK: "Back", BR: "Breast", FL: "Fly", IM: "IM" };

function formatMs(ms) {
  if (ms == null) return "";
  const t = Math.max(0, Math.round(ms));
  const m = Math.floor(t / 60000);
  const s = Math.floor((t % 60000) / 1000);
  const cs = Math.floor((t % 1000) / 10);
  return m > 0
    ? `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`
    : `${s}.${String(cs).padStart(2, "0")}s`;
}
function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(d);
  }
}

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const q =
    typeof sp?.get === "function"
      ? (sp.get("q") ?? "").trim()
      : ((sp?.q ?? "") + "").trim();

  const supabase = await getSupabaseServer();

  // Auth (for Save buttons)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---------- Build swimmers list ----------
  let swimmers = [];
  let listError = null;

  // For featured mode we also keep their best win for the badge
  const bestWinBySwimmer = new Map(); // swimmer_id -> { spec_id, place, time_ms, time_text }

  try {
    if (q) {
      // Search mode
      const { data, error } = await supabase
        .from("swimmers_v2")
        .select("id, full_name, gender")
        .ilike("full_name", `%${q}%`)
        .order("full_name", { ascending: true });
      swimmers = Array.isArray(data) ? data : [];
      listError = error || null;
    } else {
      // FEATURED: 5 swimmers who have at least one win (place = 1), by fastest win
      const { data: wins, error: winsErr } = await supabase
        .from("results_v2")
        .select("swimmer_id, spec_id, place, time_ms, time_text")
        .eq("place", 1)
        .order("time_ms", { ascending: true, nullsFirst: true })
        .limit(5000);

      if (winsErr) throw winsErr;

      const featuredIds = [];
      const seen = new Set();
      for (const w of wins || []) {
        const sid = w.swimmer_id;
        if (!sid || seen.has(sid)) continue;
        seen.add(sid);
        featuredIds.push(sid);
        bestWinBySwimmer.set(sid, {
          spec_id: w.spec_id,
          place: w.place,
          time_ms: w.time_ms,
          time_text: w.time_text,
        });
        if (featuredIds.length >= 5) break;
      }

      if (featuredIds.length) {
        const { data, error } = await supabase
          .from("swimmers_v2")
          .select("id, full_name, gender")
          .in("id", featuredIds);

        const rows = Array.isArray(data) ? data : [];
        const order = new Map(featuredIds.map((id, i) => [id, i]));
        swimmers = rows.sort(
          (a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999)
        );
        listError = error || null;
      } else {
        const { data, error } = await supabase
          .from("swimmers_v2")
          .select("id, full_name, gender")
          .order("full_name", { ascending: true })
          .limit(5);
        swimmers = Array.isArray(data) ? data : [];
        listError = error || null;
      }
    }
  } catch (e) {
    listError = e;
    swimmers = [];
  }

  // Saved swimmers
  let savedMap = new Map();
  if (user) {
    const { data: savedRows } = await supabase
      .from("saved_swimmers_v2")
      .select("swimmer_id")
      .eq("user_id", user.id);
    savedMap = new Map((savedRows || []).map((r) => [r.swimmer_id, true]));
  }

  // specs for featured badges
  const allWinSpecIds = Array.from(
    new Set(
      Array.from(bestWinBySwimmer.values())
        .map((w) => w.spec_id)
        .filter(Boolean)
    )
  );
  const specById = new Map();
  if (allWinSpecIds.length) {
    const { data: specRows } = await supabase
      .from("event_specs_v2")
      .select("id, distance_m, stroke")
      .in("id", allWinSpecIds);
    for (const s of specRows || []) specById.set(s.id, s);
  }

  // ---------- Latest events (meets) ----------
  let latestMeets = [];
  try {
    const { data: meetsData } = await supabase
      .from("meets_v2")
      .select("id, name, location, start_date, course")
      .order("start_date", { ascending: false })
      .limit(5);
    latestMeets = Array.isArray(meetsData) ? meetsData : [];
  } catch {
    latestMeets = [];
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6 sm:max-w-2xl">
      {/* Hero / Search */}
      <section className="rounded-3xl bg-gradient-to-b from-[#0b1a23] to-[#0f1a20] border border-white/10 p-8 text-center mb-8 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0b3a5e] to-[#0e5d8c] text-3xl">
          🏊‍♂️
        </div>
        <h1 className="text-[22px] sm:text-[24px] font-bold text-white mb-2 tracking-wide">
          Find your swimmer
        </h1>
        <p className="text-white/60 text-[14px] max-w-sm mx-auto mb-6 leading-relaxed">
          Search by name to find swimmers and track their progress.
        </p>
        <div className="max-w-md mx-auto">
          <SearchBar defaultValue={q} placeholder="Search swimmers..." className="mb-0" />
        </div>
      </section>

      {listError && (
        <p className="text-red-400 text-sm mb-3">
          Error: {String(listError.message || listError)}
        </p>
      )}

      <div className="mb-3 mt-1 flex items-center justify-between">
        <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-wide">
          {q ? "Search results" : "Featured swimmers"}
        </h2>
        {!q && (
          <span className="text-[12px] text-white/40 italic">
            Top 5 ranked swimmers this season
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {swimmers.map((s) => {
          const saved = savedMap.get(s.id) === true;
          const g = (s.gender || "").toLowerCase();

          // featured badge
          let winBadge = null;
          const win = bestWinBySwimmer.get(s.id);
          if (!q && win) {
            const spec = specById.get(win.spec_id);
            const dist = spec?.distance_m != null ? `${spec.distance_m}` : "";
            const stroke = spec?.stroke ? (STROKE_LABEL[spec.stroke] || spec.stroke) : "";
            const evt = [dist, stroke].filter(Boolean).join(" ");
            const time = win.time_text || formatMs(win.time_ms);
            winBadge = (
              <div className="mt-2">
                <span className="px-2 py-[2px] rounded-full bg-white/8 text-white/80 text-[12px]">
                  {evt} #{win.place}
                  {time ? ` · ${time}` : ""}
                </span>
              </div>
            );
          }

          return (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-2xl bg-[#0f1a20] border border-white/10 px-3 py-3"
            >
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <AvatarInitial name={s.full_name} />
                <div className="min-w-0">
                  <div className="text-[15px] sm:text-[16px] font-semibold truncate">
                    {s.full_name}
                  </div>
                  <div className="mt-1 text-[13px] sm:text-sm text-white/60 flex items-center gap-3">
                    {g ? (
                      <span className="inline-flex items-center gap-1">
                        <span aria-hidden>{g === "female" ? "♀" : "♂"}</span>
                        <span className="capitalize">
                          {g === "female" ? "Female" : "Male"}
                        </span>
                      </span>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                  {winBadge}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Link
                  href={`/swimmers/${s.id}`}
                  className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-2 text-sm"
                >
                  View profile
                </Link>

                {user ? (
                  <SaveButton
                    swimmerId={s.id}
                    initiallySaved={saved}
                    variant="pill"
                    className="px-3 py-2 text-sm"
                  />
                ) : (
                  <Link
                    href="/sign-in"
                    className="rounded-full bg-[#0b3a5e] hover:bg-[#0d4b79] px-3 py-2 text-sm"
                  >
                    Save swimmer
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {swimmers.length === 0 && !listError && (
        <p className="text-white/70 text-sm mt-6 text-center">No swimmers found.</p>
      )}

      {/* Latest events */}
      <div className="mt-10 mb-3 flex items-center justify-between">
        <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-wide">
          Latest events
        </h2>
        <span className="text-[12px] text-white/40">Most recent meets</span>
      </div>

      <ul className="space-y-2">
        {latestMeets.map((m) => (
          <li
            key={m.id}
            className="rounded-2xl bg-[#0f1a20] border border-white/10 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{m.name}</div>
                <div className="text-white/60 text-[13px] mt-[2px]">
                  {formatDate(m.start_date)}
                  {m.location ? ` • ${m.location}` : ""}
                </div>
              </div>
              {m.course && (
                <span className="shrink-0 text-[12px] px-2 py-[2px] rounded-full bg-white/8 text-white/70">
                  {m.course}
                </span>
              )}
            </div>
          </li>
        ))}
        {latestMeets.length === 0 && (
          <li className="text-white/60 text-sm">No recent meets.</li>
        )}
      </ul>
    </main>
  );
}