"use client";

import clsx from "clsx";
import { useState } from "react";

export default function SearchBar({
  defaultValue = "",
  placeholder = "Search swimmers, clubs, or meets...",
  className = "",
}) {
  const [query, setQuery] = useState(defaultValue);

  return (
    <form
      action="/"
      method="get"
      className={clsx("w-full relative flex items-center", className)}
    >
      {/* Input field */}
      <input
        type="text"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3
                   text-[15px] text-white placeholder-white/50
                   focus:outline-none focus:ring-2 focus:ring-teal-600"
      />

      {/* Search button with icon */}
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2
                   rounded-lg bg-teal-600 hover:bg-teal-700 px-4 py-1.5 text-sm font-medium text-white"
      >
        {/* Icon inside button */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-3.5-3.5" />
        </svg>
        Search
      </button>
    </form>
  );
}