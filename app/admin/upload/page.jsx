// app/admin/upload/page.jsx
"use client";

import { useState } from "react";

export default function AdminUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setMsg(`❌ ${data.error || res.statusText}`);
    } else {
      setMsg(`✅ ${data.message || "Uploaded and queued"} (rows: ${data.rows ?? 0})`);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Upload meet PDF</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-2">
            Meet name
            <input name="meet_name" required className="w-full mt-1 bg-black/30 border p-2 rounded" />
          </label>
          <label>
            Start date
            <input type="date" name="start_date" required className="w-full mt-1 bg-black/30 border p-2 rounded" />
          </label>
          <label>
            End date
            <input type="date" name="end_date" className="w-full mt-1 bg-black/30 border p-2 rounded" />
          </label>
          <label>
            Location (city/region)
            <input name="location" className="w-full mt-1 bg-black/30 border p-2 rounded" />
          </label>
          <label>
            Course
            <select name="course" className="w-full mt-1 bg-black/30 border p-2 rounded">
              <option value="">(auto)</option>
              <option value="SC">SC</option>
              <option value="LC">LC</option>
            </select>
          </label>
        </div>

        <label className="block">
          Meet PDF
          <input name="pdf" type="file" accept="application/pdf" required className="mt-1" />
        </label>

        <button disabled={isLoading} className="rounded bg-blue-600 px-4 py-2">
          {isLoading ? "Processing…" : "Upload & Parse"}
        </button>
      </form>

      {msg && <p className="text-sm opacity-80">{msg}</p>}
    </main>
  );
}