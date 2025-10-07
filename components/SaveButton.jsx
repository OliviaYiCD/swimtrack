"use client";

import { useState, useTransition } from "react";

export default function SaveButton({ swimmerId, initiallySaved = false }) {
  const [saved, setSaved] = useState(Boolean(initiallySaved));
  const [isPending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      try {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // IMPORTANT: send auth cookies so the API can read the session
          credentials: "same-origin",
          body: JSON.stringify({ swimmerId }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          console.error("Save failed:", payload?.error || res.statusText);
          return;
        }

        setSaved(true);
      } catch (err) {
        console.error("Save error:", err);
      }
    });

  if (saved) return <span className="text-green-400">Saved ✓</span>;

  return (
    <button
      onClick={save}
      disabled={isPending}
      className="text-blue-400 hover:underline disabled:opacity-50"
      aria-disabled={isPending}
    >
      {isPending ? "Saving…" : "Save"}
    </button>
  );
}