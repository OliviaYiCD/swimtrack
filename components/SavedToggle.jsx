"use client";

import { useState } from "react";
import SaveButton from "./SaveButton";
import RemoveSavedButton from "./RemoveSavedButton";

export default function SavedToggle({
  swimmerId,
  initiallySaved = false,
  className = "",
}) {
  const [saved, setSaved] = useState(initiallySaved);

  if (saved) {
    return (
      <div
        className={
          "inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 " +
          "bg-emerald-500/10 text-emerald-300 px-3 py-[6px] text-sm " +
          className
        }
      >
        {/* check icon */}
        <svg width="15" height="15" viewBox="0 0 24 24" className="text-emerald-300">
          <path
            d="M20 6L9 17l-5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <span>Saved swimmer</span>

        {/* subtle trash icon for remove */}
        <button
          onClick={async () => {
            const res = await fetch("/api/saved", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ swimmer_id: swimmerId }),
            });
            if (res.ok) setSaved(false);
          }}
          title="Remove"
          className="ml-1 p-1.5 hover:bg-emerald-400/10 rounded-full transition text-emerald-300 hover:text-emerald-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </div>
    );
  }

  // not saved -> show pill save button
  return (
    <SaveButton
      swimmerId={swimmerId}
      initiallySaved={false}
      variant="pill"
      className="px-4 py-2 text-sm"
      label="Save"
      onSaved={() => setSaved(true)}
    />
  );
}