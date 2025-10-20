// app/page.jsx
import Link from "next/link";
import { getSupabaseServer } from "../lib/supabaseServer";
import AvatarInitial from "../components/AvatarInitial";
import SearchBar from "../components/SearchBar";
import SaveButton from "../components/SaveButton";
import SavedSwimmersSection from "../components/SavedSwimmersSection";

export const dynamic = "force-dynamic";

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

// Normalize any gender string to one of: "male" | "female" | ""
const uiGender = (g) => {
  const s = (g || "").toString().trim().toLowerCase();
  if (s === "m" || s === "male") return "male";
  if (s === "f" || s === "female") return "female";
  return "";
};
// Convert UI gender to DB code ("m" | "f")
const dbGenderCode = (g) =>
  uiGender(g) === "male" ? "m" : uiGender(g) === "female" ? "f" : "";

export default async function Home({ searchParams }) {
  const sp = await searchParams;

  // --- Read query + filters from URL
  const q =
    typeof sp?.get === "function"
      ? (sp.get("q") ?? "").trim()
      : ((sp?.q ?? "") + "").trim();

  const genderParam =
    typeof sp?.get === "function"
      ? (sp.get("gender") ?? "").trim()
      : ((sp?.gender ?? "") + "").trim();
  const gender = uiGender(genderParam); // "male" | "female" | ""

  const ageRaw =
    typeof sp?.get === "function"
      ? (sp.get("age") ?? "").trim()
      : ((sp?.age ?? "") + "").trim();
  const age = ageRaw !== "" && !Number.isNaN(Number(ageRaw)) ? Number(ageRaw) : null;

  const hasFilters = Boolean(gender || age !== null);
  const hasQuery = Boolean(q);
  const shouldSearch = hasQuery || hasFilters; // <-- ONLY show filters + search list when true

  const supabase = await getSupabaseServer();

  // --- Auth (for Save buttons)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---------- Data holders ----------
  let searchRows = [];     // search results (only used when shouldSearch)
  let featuredRows = [];   // MVP featured list (only used when !shouldSearch)
  let listError = null;

  // 🏆 MVP (featured when no q/filters)
  const POINTS = { 1: 10, 2: 8, 3: 5 };
  const since = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString();
  const mvpBySwimmer = new Map();

  try {
    if (shouldSearch) {
      // -------------------------
      // SEARCH / FILTER MODE ONLY
      // -------------------------
      let query = supabase.from("swimmers_v2").select("id, full_name, gender, age_years");

      if (hasQuery) query = query.ilike("full_name", `%${q}%`);

      // Translate UI gender to DB code "m"/"f"
      const code = dbGenderCode(gender);
      if (code) query = query.eq("gender", code);

      if (age !== null) query = query.eq("age_years", age);

      const { data, error } = await query
        .order("full_name", { ascending: true })
        .limit(200);

      searchRows = Array.isArray(data) ? data : [];
      listError = error || null;
    } else {
      // ------------------------------------
      // FEATURED MVPs (NO SEARCH / NO FILTERS)
      // ------------------------------------
      const { data: podiumRows, error: podiumErr } = await supabase
        .from("results_v2")
        .select("swimmer_id, place, time_ms")
        .in("place", [1, 2, 3])
        .gte("start_date", since)
        .limit(50000);

      if (podiumErr) throw podiumErr;

      for (const r of podiumRows || []) {
        const sid = r.swimmer_id;
        if (!sid) continue;
        const pts = POINTS[r.place] || 0;

        const curr = mvpBySwimmer.get(sid) || {
          points: 0,
          firsts: 0,
          seconds: 0,
          thirds: 0,
          best_time_ms: null,
        };
        curr.points += pts;
        if (r.place === 1) curr.firsts += 1;
        if (r.place === 2) curr.seconds += 1;
        if (r.place === 3) curr.thirds += 1;

        if (r.time_ms != null) {
          if (curr.best_time_ms == null || r.time_ms < curr.best_time_ms) {
            curr.best_time_ms = r.time_ms;
          }
        }
        mvpBySwimmer.set(sid, curr);
      }

      const ranked = Array.from(mvpBySwimmer.entries())
        .sort((a, b) => {
          const A = a[1], B = b[1];
          if (B.points !== A.points) return B.points - A.points;
          if (B.firsts !== A.firsts) return B.firsts - A.firsts;
          const at = A.best_time_ms ?? Number.POSITIVE_INFINITY;
          const bt = B.best_time_ms ?? Number.POSITIVE_INFINITY;
          return at - bt;
        })
        .slice(0, 5);

      const featuredIds = ranked.map(([sid]) => sid);

      if (featuredIds.length) {
        const { data, error } = await supabase
          .from("swimmers_v2")
          .select("id, full_name, gender, age_years")
          .in("id", featuredIds);

        const rows = Array.isArray(data) ? data : [];
        const order = new Map(featuredIds.map((id, i) => [id, i]));
        featuredRows = rows.sort(
          (a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999)
        );
        listError = error || null;
      } else {
        featuredRows = [];
      }
    }
  } catch (e) {
    listError = e;
    searchRows = [];
    featuredRows = [];
  }

  // Saved swimmers map (for “Save” pills lighting up)
  let savedMap = new Map();
  if (user) {
    const { data: savedRows } = await supabase
      .from("saved_swimmers_v2")
      .select("swimmer_id")
      .eq("user_id", user.id);

    const ids = (savedRows || []).map(r => r.swimmer_id).filter(Boolean);
    savedMap = new Map(ids.map(id => [id, true]));
  }

  // ---------- Latest meets ----------
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

  // Helpers for filter UI defaults
  const selectedGender = gender || "";
  const selectedAge = age !== null ? String(age) : "";

  // Render gender label from row value (supports "m/f" and "male/female")
  const renderGenderLabel = (rowGender) => {
    const g = uiGender(rowGender);
    return g ? (g === "female" ? "Female" : "Male") : null;
  };

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

      {/* =========================
          MY SAVED SECTION (always shows on home)
          ========================= */}
      {!shouldSearch && <SavedSwimmersSection />}

      {/* =========================
          MODE 1: FEATURED MVPs
          ========================= */}
      {!shouldSearch && (
        <>
          <div className="mb-3 mt-8 flex items-center justify-between">
            <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-wide">
              Featured MVP swimmers
            </h2>
            <span className="text-[12px] text-white/40 italic">
              Top 5 by podium points (last 12 months)
            </span>
          </div>

          <ul className="space-y-3">
            {featuredRows.map((s) => {
              const saved = savedMap.get(s.id) === true;
              const genderLabel = renderGenderLabel(s.gender);
              const hasAge =
                s.age_years !== null && s.age_years !== undefined && String(s.age_years) !== "";

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
                      <div className="mt-1 text-[13px] sm:text-sm text-white/60 flex items-center gap-2">
                        {genderLabel ? (
                          <span className="inline-flex items-center gap-1">
                            <span aria-hidden>{genderLabel === "Female" ? "♀" : "♂"}</span>
                            <span className="capitalize">{genderLabel}</span>
                          </span>
                        ) : null}
                        {hasAge ? (
                          <>
                            {genderLabel ? <span>•</span> : null}
                            <span>Age {Number(s.age_years)}</span>
                          </>
                        ) : null}
                        {!genderLabel && !hasAge ? <span>—</span> : null}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/swimmers/${s.id}`}
                      className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-2 text-sm"
                    >
                      View
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
                        + Save
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
            {featuredRows.length === 0 && (
              <li className="text-white/60 text-sm">No MVP swimmers found.</li>
            )}
          </ul>
        </>
      )}

      {/* =========================
          MODE 2: SEARCH RESULTS
          ========================= */}
      {shouldSearch && (
        <>
          <div className="mb-3 mt-1 flex items-center justify-between">
            <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-wide">
              Search results
            </h2>
          </div>

          {/* Filters (GET params) — ONLY visible in search mode */}
          <form action="/" method="get" className="flex flex-wrap items-center gap-2 mb-4">
            {/* preserve q */}
            <input type="hidden" name="q" value={q} />
            <select
              name="gender"
              defaultValue={selectedGender}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
            >
              <option value="">Gender (Any)</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <select
              name="age"
              defaultValue={selectedAge}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
            >
              <option value="">Age (Any)</option>
              {Array.from({ length: 19 }, (_, i) => i + 6).map((n) => (
                <option key={n} value={n}>{`Age ${n}`}</option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium"
            >
              Apply
            </button>

            {(gender || age !== null) && (
              <Link
                href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
                className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm"
              >
                Clear
              </Link>
            )}
          </form>

          {/* Applied filters text */}
          {(gender || age !== null) && (
            <div className="text-[12px] text-white/40 mb-2">
              Filters:
              {gender ? ` ${gender[0].toUpperCase() + gender.slice(1)}` : ""}
              {gender && age !== null ? " •" : ""}
              {age !== null ? ` Age ${age}` : ""}
            </div>
          )}

          {/* Results list */}
          <ul className="space-y-3">
            {searchRows.map((s) => {
              const saved = savedMap.get(s.id) === true;
              const genderLabel = renderGenderLabel(s.gender);
              const hasAge =
                s.age_years !== null && s.age_years !== undefined && String(s.age_years) !== "";

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
                      <div className="mt-1 text-[13px] sm:text-sm text-white/60 flex items-center gap-2">
                        {genderLabel ? (
                          <span className="inline-flex items-center gap-1">
                            <span aria-hidden>{genderLabel === "Female" ? "♀" : "♂"}</span>
                            <span className="capitalize">{genderLabel}</span>
                          </span>
                        ) : null}
                        {hasAge ? (
                          <>
                            {genderLabel ? <span>•</span> : null}
                            <span>Age {Number(s.age_years)}</span>
                          </>
                        ) : null}
                        {!genderLabel && !hasAge ? <span>—</span> : null}
                      </div>
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

            {searchRows.length === 0 && !listError && (
              <li className="text-white/70 text-sm text-center">No swimmers found.</li>
            )}
          </ul>
        </>
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