// app/swimmers/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Public client using anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SwimmersPage() {
  const [swimmers, setSwimmers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSwimmers() {
      const { data, error } = await supabase
        .from('swimmers')
        .select('id, full_name, gender, age_years')
        .order('full_name', { ascending: true });

      if (error) setError(error.message);
      else setSwimmers(data);
    }

    loadSwimmers();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🏊 Swimmers</h1>

      {error && <p className="text-red-400">{error}</p>}
      {swimmers === null ? (
        <p>Loading…</p>
      ) : swimmers.length === 0 ? (
        <p>No swimmers found</p>
      ) : (
        <ul className="space-y-3">
          {swimmers.map((s) => (
            <li key={s.id} className="rounded border border-slate-700 p-3">
              <div className="font-medium">{s.full_name}</div>
              <div className="text-sm text-slate-400">
                {s.gender} • Age: {s.age_years ?? '—'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}