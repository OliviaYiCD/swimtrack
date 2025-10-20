// components/SaveButton.jsx
"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";

export default function SaveButton({
  swimmerId,
  initiallySaved = false,
  variant = "link",       // "link" | "pill"
  className,
  label,                  // optional: override label
  onSaved,                // optional callback after saving
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      try {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ swimmer_id: swimmerId }),
          cache: "no-store",
        });

        if (!res.ok) {
          // --- minimal improvement: if unauthenticated, send to sign-in ---
          let txt = "";
          try { txt = await res.text(); } catch {}
          const unauth =
            res.status === 401 ||
            res.status === 403 ||
            /not\s+authenticated/i.test(txt);

          if (unauth) {
            const next =
              typeof window !== "undefined"
                ? window.location.pathname + window.location.search
                : "/";
            // redirect to your sign-in page with return url
            window.location.href = `/signin?next=${encodeURIComponent(next)}`;
            return;
          }

          console.error("Save API error:", txt || res.statusText);
          return;
        }

        setSaved(true);
        onSaved?.(); // notify parent wrapper if provided
      } catch (e) {
        console.error("Save failed:", e);
      }
    });

  if (saved) {
    if (variant === "pill") {
      return (
        <span className="flex items-center gap-2 rounded-full bg-[#1c3f24] text-green-300 px-4 py-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" className="text-green-300">
            <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Saved
        </span>
      );
    }
    return <span className="text-green-400">Saved ✓</span>;
  }

  const pillClasses =
    "flex items-center gap-2 rounded-full bg-[#0b3a5e] text-white px-4 py-2 text-sm hover:bg-[#0d4b79] transition disabled:opacity-50";
  const linkClasses = "text-blue-400 hover:underline disabled:opacity-50";
  const content = label ?? "Save";

  return (
    <button
      onClick={save}
      disabled={isPending}
      className={clsx(variant === "pill" ? pillClasses : linkClasses, className)}
    >
      {variant === "pill" && (
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {isPending ? "Saving…" : content}
    </button>
  );
}