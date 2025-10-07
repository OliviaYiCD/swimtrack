// app/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Debounced search
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setErr("");
      setLoading(true);
      try {
        // If no query, show a small featured list (first 15 by name)
        if (!q.trim()) {
          const { data, error } = await supabase
            .from("swimmers")
            .select("id, full_name, gender, age_years")
            .order("full_name", { ascending: true })
            .limit(15);

          if (!active) return;
          if (error) throw error;
          setResults(data || []);
        } else {
          // Case-insensitive match on full name
          const { data, error } = await supabase
            .from("swimmers")
            .select("id, full_name, gender, age_years")
            .ilike("full_name", `%${q.trim()}%`)
            .order("full_name", { ascending: true })
            .limit(50);

          if (!active) return;
          if (error) throw error;
          setResults(data || []);
        }
      } catch (e) {
        if (!active) return;
        setErr(e.message || "Search failed");
        setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [q]);

  const headerNote = useMemo(() => {
    if (loading) return "Searching…";
    if (err) return `Error: ${err}`;
    if (!q.trim() && results.length > 0) return "Featured swimmers";
    if (q.trim() && results.length === 0) return `No results for “${q.trim()}”`;
    if (q.trim()) return `Results for “${q.trim()}”`;
    return "Browse swimmers";
  }, [loading, err, q, results]);

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-8">
      {/* Simple header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold">🏊 SwimTrack</h1>
        <p className="text-sm text-white/70">
          Search any swimmer by name. No sign-in required.
        </p>
      </header>

      {/* Search box */}
      <div className="mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search swimmer by name… e.g. Isaac"
          className="w-full rounded-xl bg-white text-slate-900 px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600"
        />
      </div>

      {/* Status */}
      <div className="text-sm text-white/70 mb-3">{headerNote}</div>

      {/* Results */}
      <ul className="space-y-3">
        {results.map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-semibold">{s.full_name}</div>
              <div className="text-sm text-white/70">
                {s.gender} • Age {s.age_years ?? "—"}
              </div>
            </div>
            <Link
              href={`/swimmers/${s.id}`}
              className="text-sm bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg"
            >
              View
            </Link>
          </li>
        ))}
      </ul>

      {/* Quick links */}
      <div className="mt-8 flex items-center gap-4 text-sm">
        <Link href="/swimmers" className="text-blue-400 hover:underline">
          Browse all swimmers →
        </Link>
        <Link href="/saved" className="text-blue-400 hover:underline">
          My saved swimmers →
        </Link>
      </div>
    </main>
  );
}