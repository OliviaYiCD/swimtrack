// app/swimmers/[id]/page.jsx
import Link from "next/link";
import { getSupabaseServer } from "../../../lib/supabaseServer";
import SaveButton from "../../../components/SaveButton";

export const dynamic = "force-dynamic";

/** mm:ss.cc (or s.cc) from milliseconds */
function formatMs(ms) {
  if (ms == null) return "—";
  const total = Math.max(0, Number(ms));
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const centi = Math.floor((total % 1000) / 10);
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}.${String(centi).padStart(2, "0")}`;
  }
  return `${seconds}.${String(centi).padStart(2, "0")}`;
}

export default async function SwimmerProfile({ params }) {
  const supabase = await getSupabaseServer();
  const { id } = await params;

  // who’s signed in?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // fetch swimmer
  const { data: swimmer, error: swimmerErr } = await supabase
    .from("swimmers")
    .select("id, full_name, gender, age_years")
    .eq("id", id)
    .maybeSingle();

  if (swimmerErr) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-red-400">Error: {swimmerErr.message}</p>
        <p className="mt-4">
          <Link href="/swimmers" className="text-blue-400 hover:underline">
            ← Back to all swimmers
          </Link>
        </p>
      </main>
    );
  }
  if (!swimmer) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p>Swimmer not found.</p>
        <p className="mt-4">
          <Link href="/swimmers" className="text-blue-400 hover:underline">
            ← Back to all swimmers
          </Link>
        </p>
      </main>
    );
  }

  // is this swimmer already saved by the user?
  let initiallySaved = false;
  if (user) {
    const { data: saved } = await supabase
      .from("saved_swimmers")
      .select("id")
      .eq("user_id", user.id)
      .eq("swimmer_id", swimmer.id)
      .maybeSingle();
    initiallySaved = !!saved;
  }

  // recent results (join events + meets)
  // Sort newest race first, then by event number, then by time
  const { data: results = [], error: resErr } = await supabase
    .from("results")
    .select(
      `
      id, round, heat, lane, time_ms, place, status, raced_at,
      events:event_id (
        id, event_number, stroke, distance, gender, age_group,
        meets:meet_id ( id, name, start_date, course )
      )
    `
    )
    .eq("swimmer_id", swimmer.id)
    .order("raced_at", { ascending: false, nullsFirst: true })
    .order("event_id", { ascending: true })
    .order("time_ms", { ascending: true, nullsFirst: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-2">{swimmer.full_name}</h1>
      <p className="opacity-80 mb-4">
        Gender: {swimmer.gender} • Age: {swimmer.age_years}
      </p>

      {/* Save / Saved */}
      <div className="mb-6">
        {user ? (
          <SaveButton swimmerId={swimmer.id} initiallySaved={initiallySaved} />
        ) : (
          <Link href="/sign-in" className="text-blue-400 hover:underline">
            Sign in to save this swimmer
          </Link>
        )}
      </div>

      {/* Results */}
      <h2 className="text-xl font-semibold mb-3">🏅 Recent Results</h2>

      {resErr && <p className="text-red-400 mb-4">Error: {resErr.message}</p>}

      {(!results || results.length === 0) && (
        <p className="opacity-70">No results yet.</p>
      )}

      {results.length > 0 && (
        <ul className="space-y-3">
          {results.map((r) => {
            const ev = r.events;
            const meet = ev?.meets;
            const meetLabel = meet
              ? `${meet.name} • ${meet.start_date ?? ""} • ${meet.course ?? ""}`
              : "—";
            const eventLabel = ev
              ? `${ev.event_number}. ${ev.distance} ${ev.stroke} (${ev.age_group})`
              : "—";

            return (
              <li
                key={r.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm opacity-75">{meetLabel}</div>
                    <div className="font-semibold">{eventLabel}</div>
                    <div className="text-sm opacity-75">
                      {r.round} {r.heat ? `• Heat ${r.heat}` : ""}{" "}
                      {r.lane ? `• Lane ${r.lane}` : ""}{" "}
                      {r.raced_at ? `• ${r.raced_at}` : ""}
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-4">
                    <div className="text-lg font-semibold">
                      {formatMs(r.time_ms)}
                    </div>
                    <div className="text-sm opacity-75">
                      {r.place ? `Place ${r.place}` : ""}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8">
        <Link href="/swimmers" className="text-blue-400 hover:underline">
          ← Back to all swimmers
        </Link>
      </p>
    </main>
  );
}