"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import clsx from "clsx";

// Expanded stroke labels
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
  const gLabel = g === "f" || g === "female" ? "Female" : g === "m" || g === "male" ? "Male" : g || "—";
  return `Age ${age ?? "—"}, ${gLabel}`;
}

export default function CompetitorsPanel({ swimmerId }) {
  const supabase = createClientComponentClient();

  const [me, setMe] = useState(null);
  const [events, setEvents] = useState([]);
  const [specId, setSpecId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // load base swimmer + their events
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
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
      const opts = [];
      const seen = new Set();
      for (const r of myEvents || []) {
        if (!r?.spec_id || seen.has(r.spec_id)) continue;
        seen.add(r.spec_id);
        const es = r.event_specs_v2 || {};
        const strokeLabel = STROKE_LABEL[es.stroke] || es.stroke || "";
        const title = `${es.distance_m ?? ""} ${strokeLabel}`.trim();
        opts.push({ spec_id: r.spec_id, title });
      }
      opts.sort((a, b) => a.title.localeCompare(b.title));
      setEvents(opts);
      if (!specId && opts.length) setSpecId(opts[0].spec_id);
    })();
    return () => { alive = false; };
  }, [swimmerId]);

  // load cohort for selected event
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!me || !specId) return;
      setLoading(true);

      const { data: cohortSwimmers = [] } = await supabase
        .from("swimmers_v2")
        .select("id, full_name, gender, age_years")
        .eq("gender", me.gender)
        .eq("age_years", me.age_years);

      if (!alive) return;
      const cohortIds = new Set(cohortSwimmers.map((s) => s.id));

      const since = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString();
      const { data: allRows = [] } = await supabase
        .from("results_v2")
        .select("swimmer_id, time_ms, time_text, start_date, meet_id")
        .eq("spec_id", specId)
        .gte("start_date", since)
        .order("time_ms", { ascending: true });

      if (!alive) return;

      const bestBySwimmer = new Map();
      for (const r of allRows) {
        if (!cohortIds.has(r.swimmer_id)) continue;
        if (!bestBySwimmer.has(r.swimmer_id)) bestBySwimmer.set(r.swimmer_id, r);
      }

      const idList = Array.from(bestBySwimmer.keys());
      const { data: names = [] } = await supabase
        .from("swimmers_v2")
        .select("id, full_name, gender, age_years")
        .in("id", idList);

      const nameMap = new Map(names.map((n) => [n.id, n]));

      const meetIds = Array.from(
        new Set(Array.from(bestBySwimmer.values()).map((v) => v.meet_id).filter(Boolean))
      );
      const { data: meets = [] } = await supabase
        .from("meets_v2")
        .select("id, name")
        .in("id", meetIds);
      const meetMap = new Map(meets.map((m) => [m.id, m.name]));

      const combined = idList.map((sid) => {
        const r = bestBySwimmer.get(sid);
        const info = nameMap.get(sid) || {};
        return {
          swimmer_id: sid,
          full_name: info.full_name || "",
          gender: info.gender,
          age_years: info.age_years,
          time_ms: r.time_ms,
          time_text: r.time_text,
          meet_name: r.meet_id ? meetMap.get(r.meet_id) : "",
        };
      });

      const myBest = combined.find((x) => x.swimmer_id === me.id);
      const myMs = myBest?.time_ms ?? null;

      combined.sort(
        (a, b) =>
          (a.time_ms ?? Number.POSITIVE_INFINITY) -
          (b.time_ms ?? Number.POSITIVE_INFINITY)
      );

      const rowsWithDelta = combined.map((r) => ({
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
  {/* Event Selector */}
<div className="space-y-2 mt-2">
  <h3 className="text-[15px] font-semibold text-white/80">
    Select an event to compare competitors
  </h3>
  <div className="relative">
    <select
      value={specId || ""}
      onChange={(e) => setSpecId(e.target.value || null)}
      className="w-full appearance-none rounded-xl bg-white/10 border border-white/20 px-4 py-4 pr-10 text-[15px] font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
    >
      {events.map((e) => (
        <option key={e.spec_id} value={e.spec_id}>
          {e.title}
        </option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-[14px]">
      ▾
    </span>
  </div>
</div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[18px] font-semibold">Top Competitors (PBs)</div>
        <div className="text-[13px] text-white/70 font-medium tracking-wide">
  {cohortHeader ? `Cohort: ${cohortHeader}` : ""}
</div>
      </div>
      <p className="text-[14px] text-white/40 mt-1">Each competitor’s fastest time</p>

      {/* List */}
      <div className="space-y-3">
        {loading && <div className="text-white/60 text-sm">Loading competitors…</div>}
        {!loading && rows.length === 0 && (
          <div className="text-white/60 text-sm">No competitors yet.</div>
        )}

        {rows.map((r, idx) => {
          const isMe = me && r.swimmer_id === me.id;
          let deltaText = "—";
          let deltaColor = "text-white/60";
          if (r.delta != null) {
            if (r.delta === 0) deltaText = "—";
            else if (r.delta > 0) {
              deltaText = `+${r.delta.toFixed(2)}s`;
              deltaColor = "text-red-300";
            } else {
              deltaText = `${r.delta.toFixed(2)}s`;
              deltaColor = "text-green-300";
            }
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
                  {r.full_name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0] || "")
                    .join("")
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                    <div
  className={clsx(
    "font-semibold truncate text-white",
    isMe ? "text-purple-300" : "text-white"
  )}
>
  {r.full_name}
</div>
                      <div className="text-white/50 text-[13px]">
                        {ageGenderText(r.age_years, r.gender)}
                      </div>
                    </div>

                    <div className="text-right">
                    <div className="flex items-center gap-2 text-[18px] font-bold">
                    <span className="text-[11px] font-semibold text-green-300 bg-green-400/15 border border-green-400/30 rounded-full px-2 py-[2px]">
                          PB
                        </span>
                        <span>{r.time_text || formatMs(r.time_ms)}</span>
                        {/* PB chip since list is PBs */}
                     
                      </div>
                      <div className={clsx("text-[12px]", deltaColor)}>{deltaText}</div>
                    </div>
                  </div>

                  {r.meet_name && (
                    <div className="mt-2 text-[12px] text-white/50">
                      {r.meet_name}
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