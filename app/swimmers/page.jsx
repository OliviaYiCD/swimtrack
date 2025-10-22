// app/swimmers/[id]/page.jsx
import Link from "next/link";
import { getSupabaseServer } from "../../lib/supabaseServer";
import AvatarInitial from "../../components/AvatarInitial";
 import SaveButton from "../../components/SaveButton";

export const dynamic = "force-dynamic";

const STROKE_LABEL = { FR: "Freestyle", BK: "Backstroke", BR: "Breaststroke", FL: "Butterfly", IM: "IM" };

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
function rankText(n) {
  if (n == null) return null;
  const s = n % 10, t = n % 100;
  const suf = (s === 1 && t !== 11) ? "st" : (s === 2 && t !== 12) ? "nd" : (s === 3 && t !== 13) ? "rd" : "th";
  return `${n}${suf}`;
}

export default async function SwimmerPage({ params }) {
  const p = await params;
  const id = p?.id;

  const supabase = await getSupabaseServer();

  // ----- Swimmer core -----
  const { data: swimmer, error: swimmerErr } = await supabase
    .from("swimmers_v2")
    .select("id, full_name, gender, age_years, club")
    .eq("id", id)
    .single();

  if (swimmerErr || !swimmer) {
    return (
      <main className="mx-auto max-w-md px-4 py-6 sm:max-w-2xl">
        <p className="text-red-400">Swimmer not found.</p>
      </main>
    );
  }

  // Latest club/team (from most recent result)
  let club = null;
  {
    const { data: lastClub } = await supabase
      .from("results_v2")
      .select("club,start_date")
      .eq("swimmer_id", id)
      .order("start_date", { ascending: false, nullsFirst: true })
      .limit(1)
      .maybeSingle();
    club = lastClub?.club || null;
  }

  // Saved?
  let initiallySaved = false;
  {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (user) {
      const { data: savedRows } = await supabase
        .from("saved_swimmers_v2")
        .select("swimmer_id")
        .eq("user_id", user.id)
        .eq("swimmer_id", id)
        .limit(1);
      initiallySaved = Array.isArray(savedRows) && savedRows.length > 0;
    }
  }

  // ----- Personal bests (fastest per spec) -----
  const { data: allTimes = [] } = await supabase
    .from("results_v2")
    .select("spec_id,time_ms,time_text,meet_id,start_date")
    .eq("swimmer_id", id)
    .not("time_ms", "is", null)
    .order("time_ms", { ascending: true })
    .limit(2000);

  // Keep the best (first) row per spec_id
  const bestBySpec = new Map();
  for (const r of allTimes) {
    if (!bestBySpec.has(r.spec_id)) bestBySpec.set(r.spec_id, r);
  }
  const bestRows = Array.from(bestBySpec.values()).slice(0, 4); // show up to 4 cards

  // Fetch spec + meet metadata
  const specIds = [...new Set(bestRows.map(r => r.spec_id).filter(Boolean))];
  const meetIds = [...new Set(bestRows.map(r => r.meet_id).filter(Boolean))];

  const specMap = new Map();
  if (specIds.length) {
    const { data: specs = [] } = await supabase
      .from("event_specs_v2")
      .select("id,distance_m,stroke")
      .in("id", specIds);
    for (const s of specs) specMap.set(s.id, s);
  }

  const meetMap = new Map();
  if (meetIds.length) {
    const { data: meets = [] } = await supabase
      .from("meets_v2")
      .select("id,name")
      .in("id", meetIds);
    for (const m of meets) meetMap.set(m.id, m);
  }

  // ----- Recent results -----
  const { data: recent = [] } = await supabase
    .from("results_v2")
    .select("spec_id, meet_id, start_date, time_ms, time_text, place")
    .eq("swimmer_id", id)
    .order("start_date", { ascending: false, nullsFirst: true })
    .limit(10);

  // Preload any extra specs/meets used in recent
  const recentSpecIds = [...new Set(recent.map(r => r.spec_id).filter(Boolean))].filter(x => !specMap.has(x));
  const recentMeetIds = [...new Set(recent.map(r => r.meet_id).filter(Boolean))].filter(x => !meetMap.has(x));

  if (recentSpecIds.length) {
    const { data: extraSpecs = [] } = await supabase
      .from("event_specs_v2")
      .select("id,distance_m,stroke")
      .in("id", recentSpecIds);
    for (const s of extraSpecs) specMap.set(s.id, s);
  }
  if (recentMeetIds.length) {
    const { data: extraMeets = [] } = await supabase
      .from("meets_v2")
      .select("id,name")
      .in("id", recentMeetIds);
    for (const m of extraMeets) meetMap.set(m.id, m);
  }

  // Helpers for titles
  const specTitle = (specId) => {
    const s = specMap.get(specId);
    if (!s) return "—";
    const dist = s?.distance_m != null ? `${s.distance_m}m` : "";
    const stroke = s?.stroke ? (STROKE_LABEL[s.stroke] || s.stroke) : "";
    return [dist, stroke].filter(Boolean).join(" ");
  };

  return (
    <main className="mx-auto max-w-md px-4 py-6 sm:max-w-2xl">
      {/* Header */}
      <section className="rounded-3xl bg-gradient-to-b from-[#0b1a23] to-[#0f1a20] border border-white/10 p-6 text-center mb-6 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          <AvatarInitial name={swimmer.full_name} size="lg" />
        </div>
        <h1 className="text-[22px] sm:text-[24px] font-bold text-white mb-2 tracking-wide">
          {swimmer.full_name}
        </h1>
        <p className="text-white/70 text-[14px]">
          {swimmer.age_years != null ? `Age ${swimmer.age_years}` : "Age —"} •{" "}
          {swimmer.gender ? (swimmer.gender.toLowerCase() === "female" ? "Female" : "Male") : "—"}
        </p>
        {club && (
          <p className="text-white/50 text-[13px] mt-1">Team: {club}</p>
        )}

        <div className="mt-4 flex justify-center">
          <SaveButton swimmerId={swimmer.id} initiallySaved={initiallySaved} variant="pill" />
        </div>
      </section>

      {/* "Tabs" header (static for now) */}
      <div className="mb-4 flex items-center rounded-2xl bg-[#0f1a20] border border-white/10 p-1">
        <div className="flex-1">
          <span className="block text-center text-[14px] font-semibold bg-white/10 rounded-xl py-2">
            Personal Bests
          </span>
        </div>
        <div className="flex-1">
          <span className="block text-center text-[14px] text-white/40 py-2">
            Competitors
          </span>
        </div>
      </div>

      {/* Personal Bests grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {bestRows.length === 0 ? (
          <div className="text-white/60 text-sm">No personal bests yet.</div>
        ) : (
          bestRows.map((r, idx) => {
            const title = specTitle(r.spec_id);
            const meetName = r.meet_id ? (meetMap.get(r.meet_id)?.name || "") : "";
            const time = r.time_text || formatMs(r.time_ms);
            return (
              <div
                key={`${r.spec_id}-${idx}`}
                className="rounded-2xl bg-[#0f1a20] border border-white/10 p-4"
              >
                <div className="text-white/80 text-[13px]">{title}</div>
                <div className="mt-2 text-[22px] font-bold tracking-wide">{time || "—"}</div>
                <div className="text-white/50 text-[12px] mt-2">
                  {meetName ? meetName : "—"}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recent results */}
      <h2 className="text-[16px] font-semibold tracking-wide mb-3">Recent results</h2>
      <ul className="space-y-3">
        {recent.length === 0 ? (
          <li className="text-white/60 text-sm">No recent results.</li>
        ) : (
          recent.map((r, i) => {
            const title = specTitle(r.spec_id);
            const when = formatDate(r.start_date);
            const time = r.time_text || formatMs(r.time_ms);
            const rk = rankText(r.place);
            return (
              <li
                key={`${r.spec_id}-${r.start_date || i}`}
                className="rounded-2xl bg-[#0f1a20] border border-white/10 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[15px] font-medium truncate">{title}</div>
                    <div className="text-white/60 text-[13px] mt-[2px]">{when}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[18px] font-bold">{time || "—"}</div>
                    {rk && (
                      <div className="text-[12px] text-blue-300 mt-[2px]">Rank: {rk}</div>
                    )}
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </main>
  );
}