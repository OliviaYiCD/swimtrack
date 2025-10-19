"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import clsx from "clsx";

const STROKE_LABEL = {
  FR: "Freestyle",
  BK: "Backstroke",
  BR: "Breaststroke",
  FL: "Butterfly",
  IM: "Individual Medley",
};

function formatMs(ms) {
  if (ms == null) return "—";
  const t = Math.max(0, Math.round(ms));
  const m = Math.floor(t / 60000);
  const s = Math.floor((t % 60000) / 1000);
  const cs = Math.floor((t % 1000) / 10);
  return m > 0
    ? `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`
    : `${s}.${String(cs).padStart(2, "0")}s`;
}

function ageGenderText(age, gender) {
  const g = (gender || "").toLowerCase();
  const gLabel =
    g === "f" || g === "female" ? "Female" :
    g === "m" || g === "male" ? "Male" : g || "—";
  return `Age ${age ?? "—"}, ${gLabel}`;
}

// Visual style for rank badge
function rankBadgeClass(rank) {
  if (rank === 1) return "from-yellow-300 to-amber-500 text-black ring-2 ring-amber-300";
  if (rank === 2) return "from-slate-200 to-slate-400 text-black ring-2 ring-slate-300";
  if (rank === 3) return "from-orange-400 to-amber-600 text-black ring-2 ring-amber-400";
  return "from-white/15 to-white/5 text-white ring-1 ring-white/15";
}

/**
 * Props:
 *   - swimmerId (string)
 */
export default function CompetitorsPanel({ swimmerId }) {
  const supabase = createClientComponentClient();

  const [me, setMe] = useState(null);
  const [events, setEvents] = useState([]);
  const [specId, setSpecId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load base swimmer + their events (titles)
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      // Keep it minimal (club here can cause issues and we don't need it)
      const { data: meRow } = await supabase
        .from("swimmers_v2")
        .select("id, full_name, gender, age_years")
        .eq("id", swimmerId)
        .single();
      if (!alive) return;
      setMe(meRow || null);

      const { data: myEvents = [] } = await supabase
        .from("results_v2")
        .select("spec_id, event_specs_v2(distance_m, stroke)")
        .eq("swimmer_id", swimmerId);

      if (!alive) return;
      const seen = new Set();
      const opts = [];
      for (const r of myEvents || []) {
        if (!r?.spec_id || seen.has(r.spec_id)) continue;
        seen.add(r.spec_id);
        const es = r.event_specs_v2 || {};
        const title = `${es.distance_m ?? ""} ${(STROKE_LABEL[es.stroke] || es.stroke || "").trim()}`.trim();
        opts.push({ spec_id: r.spec_id, title });
      }
      opts.sort((a, b) => a.title.localeCompare(b.title));
      setEvents(opts);
      if (!specId && opts.length) setSpecId(opts[0].spec_id);
    })();
    return () => { alive = false; };
  }, [swimmerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load cohort PBs for selected event (and club via the PB row)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!me || !specId) return;
      setLoading(true);

      // Same cohort (exact age + gender)
      const { data: cohortSwimmers = [] } = await supabase
        .from("swimmers_v2")
        .select("id, full_name, gender, age_years")
        .eq("gender", me.gender)
        .eq("age_years", me.age_years);

      if (!alive) return;
      const cohortIds = new Set(cohortSwimmers.map(s => s.id));

      const since = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString();

      // Fetch times for this spec over last 12 months; include club here
      const { data: allRows = [] } = await supabase
        .from("results_v2")
        .select("swimmer_id, time_ms, time_text, start_date, meet_id, club")
        .eq("spec_id", specId)
        .gte("start_date", since)
        .order("time_ms", { ascending: true });

      if (!alive) return;

      // Choose first (fastest) row per swimmer as PB
      const bestBySwimmer = new Map();
      for (const r of allRows) {
        if (!cohortIds.has(r.swimmer_id)) continue;
        if (!bestBySwimmer.has(r.swimmer_id)) bestBySwimmer.set(r.swimmer_id, r);
      }

      const idList = Array.from(bestBySwimmer.keys());

      // Hydrate names
      const { data: names = [] } = await supabase
        .from("swimmers_v2")
        .select("id, full_name, gender, age_years")
        .in("id", idList);
      const nameMap = new Map(names.map(n => [n.id, n]));

      // Meet names
      const meetIds = Array.from(
        new Set(Array.from(bestBySwimmer.values()).map(v => v.meet_id).filter(Boolean))
      );
      const { data: meets = [] } = await supabase
        .from("meets_v2")
        .select("id, name")
        .in("id", meetIds);
      const meetMap = new Map(meets.map(m => [m.id, m.name]));

      const combined = idList.map(sid => {
        const r = bestBySwimmer.get(sid);
        const info = nameMap.get(sid) || {};
        return {
          swimmer_id: sid,
          full_name: info.full_name || "",
          gender: info.gender,
          age_years: info.age_years,
          time_ms: r.time_ms,
          time_text: r.time_text,
          club_name: r.club || "",                 // club picked from PB row
          meet_name: r.meet_id ? meetMap.get(r.meet_id) : "",
        };
      });

      // My PB for deltas
      const myBest = combined.find(x => x.swimmer_id === me.id);
      const myMs = myBest?.time_ms ?? null;

      // Rank by time (nulls last)
      combined.sort(
        (a, b) =>
          (a.time_ms ?? Number.POSITIVE_INFINITY) -
          (b.time_ms ?? Number.POSITIVE_INFINITY)
      );

      const rowsWithDelta = combined.map(r => ({
        ...r,
        delta: myMs != null && r.time_ms != null ? (r.time_ms - myMs) / 1000 : null,
      }));

      if (!alive) return;
      setRows(rowsWithDelta);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [me, specId, supabase]);

  const leader = rows[0];
  const cohortHeader = me && specId ? ageGenderText(me.age_years, me.gender) : "";

  return (
    <div className="space-y-4">
   {/* Event Selector - Pill Style */}
<div className="space-y-2 mt-3">
  <h3 className="text-[15px] font-semibold text-white/80">
    Select an event to compare competitors
  </h3>

  <div className="flex flex-wrap gap-2 mt-2">
    {events.map((e) => {
      const isActive = e.spec_id === specId;
      return (
        <button
          key={e.spec_id}
          onClick={() => setSpecId(e.spec_id)}
          className={clsx(
            "px-4 py-2 text-[14px] rounded-full border transition-all duration-200",
            isActive
              ? "bg-blue-500/20 border-blue-400/40 text-blue-200 font-semibold shadow-[0_0_8px_rgba(59,130,246,0.4)]"
              : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/20"
          )}
        >
          {e.title}
        </button>
      );
    })}
  </div>
</div>


{/* Comparison Header */}
{me && specId && (
  <div>
    <div className="text-white/50 text-[13px] font-medium mb-[2px]">
    Top Competitors (PBs)  Comparing against
    </div>
    <div className="text-white font-bold text-[20px] leading-tight tracking-wide">
      <span className="text-white/90">
        {
          events.find(e => e.spec_id === specId)?.title ||
          ""
        }
      </span>
    </div>
  </div>
)}



      {/* List */}
      <div className="space-y-3">
        {loading && <div className="text-white/60 text-sm">Loading competitors…</div>}
        {!loading && rows.length === 0 && (
          <div className="text-white/60 text-sm">No competitors yet.</div>
        )}

        {rows.map((r, idx) => {
          const isMe = me && r.swimmer_id === me.id;
          const rank = idx + 1;

          let deltaText = "—";
          let deltaColor = "text-white/60";
          if (r.delta != null) {
            if (r.delta === 0) deltaText = "—";
            else if (r.delta > 0) { deltaText = `+${r.delta.toFixed(2)}s`; deltaColor = "text-red-300"; }
            else { deltaText = `${r.delta.toFixed(2)}s`; deltaColor = "text-green-300"; }
          }

          return (
            <div
              key={r.swimmer_id}
              className={clsx(
                "rounded-2xl border px-4 py-4 transition-colors duration-200",
                isMe
                  ? "bg-[#14355b] border-[#3b82f6]/40 shadow-[0_0_10px_rgba(59,130,246,0.25)]"
                  : "bg-[#0f1a20] border-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Rank badge */}
                <div
                  className={clsx(
                    "shrink-0 h-9 w-9 sm:h-10 sm:w-10 grid place-items-center rounded-full",
                    "bg-gradient-to-b font-extrabold text-[13px] sm:text-[14px] shadow-lg",
                    rankBadgeClass(rank)
                  )}
                  aria-label={`Rank ${rank}`}
                  title={`Rank ${rank}`}
                >
                  {rank}
                </div>

                {/* Initials avatar */}
                <div
                  className={clsx(
                    "h-10 w-10 shrink-0 rounded-full text-sm font-bold grid place-items-center",
                    [
                      "bg-blue-600/30 text-blue-200",
                      "bg-emerald-600/30 text-emerald-200",
                      "bg-violet-600/30 text-violet-200",
                      "bg-amber-600/30 text-amber-200",
                    ][idx % 4]
                  )}
                >
                  {r.full_name.split(/\s+/).slice(0, 2).map(p => p[0] || "").join("").toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className={clsx("font-semibold truncate", isMe ? "text-purple-300" : "text-white")}>
                        {r.full_name}
                      </div>
                      <div className="text-white/50 text-[13px]">
                        {ageGenderText(r.age_years, r.gender)}
                        {r.club_name ? ` • ${r.club_name}` : ""}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 text-[18px] font-bold">
                        <span className="text-[11px] font-semibold text-green-300 bg-green-400/15 border border-green-400/30 rounded-full px-2 py-[2px]">
                          PB
                        </span>
                        <span>{r.time_text || formatMs(r.time_ms)}</span>
                      </div>
                      <div className={clsx("text-[12px]", deltaColor)}>{deltaText}</div>
                    </div>
                  </div>

                  {(r.meet_name || isMe) && (
                    <div className="mt-2 text-[12px] text-white/50">
                      {r.meet_name || ""}
                      {isMe && leader?.swimmer_id === r.swimmer_id && (
                        <span className="ml-2 inline-block rounded-full bg-white/8 px-2 py-[2px] text-white/70">
                          Personal Best
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}