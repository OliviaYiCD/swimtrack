"use client";
import { useMemo } from "react";

function msOrSecToSec(row) {
  if (typeof row.time_s === "number") return row.time_s;
  if (typeof row.time_ms === "number") return row.time_ms / 1000;
  return null;
}
function fmt(sec) {
  if (sec == null) return "—";
  const ms = Math.round(sec * 1000);
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return m > 0
    ? `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`
    : `${s}.${String(cs).padStart(2, "0")}s`;
}

export default function PerformanceChart({
  title = "Performance Racing Chart",
  subtitle = "Times in seconds. Shorter bar is better.",
  rows = [],
}) {
  const data = useMemo(() => {
    return (rows || [])
      .map((r) => {
        const time_s = msOrSecToSec(r);
        const label =
          r.label ??
          (r.name
            ? r.name
                .split(/\s+/)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase() || "")
                .join("")
            : "–");
        return { ...r, time_s, label };
      })
      .filter((r) => r.time_s != null);
  }, [rows]);

  const empty = data.length === 0;

  let max = 1,
    min = 0,
    guideRow = null,
    guidePct = 0;

  if (!empty) {
    max = Math.max(...data.map((d) => d.time_s));
    min = Math.min(...data.map((d) => d.time_s));
    const best = data.reduce((a, b) => (b.time_s < a.time_s ? b : a), data[0]);
    const owner = data.find((d) => d.isOwner);
    guideRow = owner || best;

    // % position INSIDE the bar lane (same formula the bar uses)
    guidePct = Math.max(8, Math.min(100, (guideRow.time_s / max) * 100));
  }

  // Tailwind widths used in the row:
  // left initials = w-9 (36px), gap between columns = gap-3 (12px)
  // right time column = w-20 (80px), gap-3 (12px)
  const LEFT_OFFSET = 36 + 12;
  const RIGHT_OFFSET = 80 + 12;

  const color = (t, isOwner) => {
    if (isOwner) return "bg-blue-500";
    const ratio = (t - min) / Math.max(1e-9, max - min);
    if (ratio < 0.15) return "bg-emerald-500";
    if (ratio < 0.35) return "bg-emerald-400";
    if (ratio < 0.55) return "bg-yellow-400";
    if (ratio < 0.75) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f1a20] p-4 sm:p-5">
      <div className="mb-3">
        <h3 className="text-white font-semibold text-sm sm:text-base">{title}</h3>
        <p className="text-white/50 text-xs">{subtitle}</p>
      </div>

      {empty ? (
        <div className="text-white/60 text-sm">No PBs for this event yet.</div>
      ) : (
        <div className="relative mt-3">
          {/* Overlay that covers EXACTLY the bar lane (between initials and time) */}
          <div
            className="absolute inset-y-0 pointer-events-none"
            style={{ left: LEFT_OFFSET, right: RIGHT_OFFSET }}
          >
            {/* Dashed guide positioned within bar lane */}
            <div
              className="absolute inset-y-0 border-l border-dashed border-white/25"
              style={{ left: `${guidePct}%` }}
            >
              <div
                className="absolute -top-5 text-[11px] text-white/70 whitespace-nowrap"
                style={{
                  transform: "translateX(calc(-100% - 4px))",
                }}
              >
                <span className="font-semibold">{guideRow?.label}</span>{" "}
                {fmt(guideRow?.time_s)}
              </div>
            </div>
          </div>

          <ul className="space-y-3 relative">
            {data.map((r, i) => {
              const pct = Math.max(8, Math.min(100, (r.time_s / max) * 100));
              const isBest = r.time_s === min;
              return (
                <li key={i} className="flex items-center gap-3">
                  {/* left initials */}
                  <div className="shrink-0 w-9 text-[13px] text-white/80 font-semibold text-center">
                    {r.label}
                  </div>

                  {/* bar lane */}
                  <div className="relative h-8 flex-1 rounded-full bg-white/5">
                    <div
                      className={`h-8 rounded-full ${color(r.time_s, r.isOwner)} transition-[width]`}
                      style={{ width: `${pct}%` }}
                    />
                    {r.name && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-white/90">
                        {r.name}
                      </div>
                    )}
                  </div>

                  {/* right time */}
                  <div
                    className={`shrink-0 w-20 text-right text-[13px] ${
                      isBest ? "text-emerald-300 font-semibold" : "text-white/80"
                    }`}
                  >
                    {fmt(r.time_s)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}