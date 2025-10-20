"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";

export default function RemoveSavedButton({
  swimmerId,
  className,
  onRemoved,
  variant = "pill", // keep a pill look by default
}) {
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);

  const onClick = () =>
    startTransition(async () => {
      try {
        const res = await fetch("/api/saved", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ swimmer_id: swimmerId }),
          cache: "no-store",
        });

        if (!res.ok && res.status !== 204) {
          console.error("Remove API error:", await res.text());
          return;
        }

        setRemoved(true);
        onRemoved?.();
      } catch (e) {
        console.error("Remove failed:", e);
      }
    });

  if (removed) {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-2 rounded-full bg-white/10 text-white/70 border border-white/15 px-4 py-2 text-sm",
          className
        )}
      >
        Removed
      </span>
    );
  }

  const pill =
    "inline-flex items-center gap-2 rounded-full bg-[#3b1f1f] text-red-200 border border-red-400/30 px-4 py-2 text-sm hover:bg-[#4a2626] disabled:opacity-50";

  return (
    <button onClick={onClick} disabled={isPending} className={clsx(pill, className)}>
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {isPending ? "Removing…" : "Remove"}
    </button>
  );
}