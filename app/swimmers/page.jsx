"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize client for browser (client side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SwimmersPage() {
  const [swimmers, setSwimmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSwimmers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("swimmers")
        .select("id, full_name, gender, age_years");

      if (error) {
        console.error("Error fetching swimmers:", error.message);
      } else {
        setSwimmers(data);
      }

      setLoading(false);
    }

    loadSwimmers();
  }, []);

  if (loading) return <p className="text-white p-4">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 text-white">
      <h1 className="text-2xl font-bold mb-4">🏊 Swimmers</h1>
      {swimmers.length === 0 ? (
        <p>No swimmers found.</p>
      ) : (
        <ul className="space-y-3">
          {swimmers.map((s) => (
            <li
              key={s.id}
              className="border border-gray-600 rounded p-3 hover:bg-gray-800"
            >
              <p className="font-semibold">{s.full_name}</p>
              <p className="text-sm text-gray-400">
                {s.gender} • Age: {s.age_years ?? "N/A"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}