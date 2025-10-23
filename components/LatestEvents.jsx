// components/LatestEvents.jsx
import { getSupabaseServer } from "../lib/supabaseServer";

// Server component that fetches and renders recent meets
export default async function LatestEvents({ limit = 5, className = "" }) {
  const supabase = await getSupabaseServer();

  let meets = [];
  try {
    const { data } = await supabase
      .from("meets_v2")
      .select("id, name, location, start_date, course")
      .order("start_date", { ascending: false })
      .limit(limit);
    meets = Array.isArray(data) ? data : [];
  } catch {
    meets = [];
  }

  const fmt = (d) => {
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
  };

  return (
    <section className={className}>
      <div className="mt-10 mb-3 flex items-center justify-between">
        <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-wide">
          Latest events
        </h2>
        <span className="text-[12px] text-white/40">Most recent meets</span>
      </div>

      <ul className="space-y-2">
        {meets.map((m) => (
          <li
            key={m.id}
            className="rounded-2xl bg-surface border border-white/10 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{m.name}</div>
                <div className="text-white/60 text-[13px] mt-[2px]">
                  {fmt(m.start_date)}
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

        {meets.length === 0 && (
          <li className="text-white/60 text-sm">No recent meets.</li>
        )}
      </ul>
    </section>
  );
}