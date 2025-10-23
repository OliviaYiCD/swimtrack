// components/SearchBar.jsx
"use client";

import clsx from "clsx";

export default function SearchBar({
  defaultValue = "",
  placeholder = "Search swimmers...",
  className = "",
}) {
  return (
    <form action="/" method="get" className={clsx("w-full", className)}>
      {/* Fill the container; no max-w here */}
      <div className="relative w-full">
        {/* Icon */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60"
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>

        {/* Input */}
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={clsx(
            "block w-full rounded-xl",
            "bg-[#223736] text-white placeholder:text-white/55",
            "py-3 pr-4",
            "pl-12",                // space for icon
            "outline-none border-0 ring-0",
            "focus:ring-2 focus:ring-[#0BA5A5]/50"
          )}
          style={{ paddingLeft: "44px" }}
        />
      </div>
    </form>
  );
}