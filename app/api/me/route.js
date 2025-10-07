"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SwimmersPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [swimmers, setSwimmers] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [busy, setBusy] = useState({});

  // ✅ Get user from server via cookie-based session
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/me", { credentials: "include" });
      const { user } = await res.json();
      setUser(user);
    })();
  }, []);

  // Load swimmers (public)
  useEffect(() => {
    supabase
      .from("swimmers")
      .select("id, full_name, gender, age_years")
      .order("full_name")
      .then(({ data, error }) => {
        if (!error && data) setSwimmers(data);
      });
  }, [supabase]);

  // Load saved ids for this user
  useEffect(() => {
    if (!user) {
      setSavedIds([]);
      return;
    }
    supabase
      .from("saved_swimmers")
      .select("swimmer_id")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (!error && data) setSavedIds(data.map(r => r.swimmer_id));
      });
  }, [user, supabase]);

  async function handleSave(swimmerId) {
    if (!user) return;
    if (savedIds.includes(swimmerId)) return;

    setBusy(b => ({ ...b, [swimmerId]: true }));
    const { error } = await supabase
      .from("saved_swimmers")
      .insert({ user_id: user.id, swimmer_id: swimmerId });

    setBusy(b => ({ ...b, [swimmerId]: false }));
    if (error) {
      if (error.code !== "23505") {
        console.error(error);
        alert("Could not save swimmer.");
      }
      setSavedIds(ids => [...new Set([...ids, swimmerId])]);
      return;
    }
    setSavedIds(ids => [...ids, swimmerId]);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">🏊 Swimmers</h1>

      {swimmers.length === 0 ? (
        <p>No swimmers found.</p>
      ) : (
        <div className="space-y-3">
          {swimmers.map(s => (
            <div key={s.id} className="border border-white/10 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{s.full_name}</div>
                <div className="text-sm text-white/60">
                  {s.gender} • Age {s.age_years}
                </div>
              </div>

              {user ? (
                savedIds.includes(s.id) ? (
                  <button className="px-3 py-1 rounded bg-green-600/80 text-white" disabled>
                    ✅ Saved
                  </button>
                ) : (
                  <button
                    onClick={() => handleSave(s.id)}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    disabled={!!busy[s.id]}
                  >
                    {busy[s.id] ? "Saving…" : "Save"}
                  </button>
                )
              ) : (
                <Link
                  href={`/sign-in?next=${encodeURIComponent("/swimmers")}`}
                  className="text-blue-400 hover:underline"
                >
                  Sign in to Save
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/saved" className="text-blue-400 hover:underline">
          View my saved swimmers →
        </Link>
      </div>
    </div>
  );
}