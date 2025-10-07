// components/SearchBar.jsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

export default function SearchBar({ defaultValue = "", placeholder, className }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  // Submit on Enter; otherwise debounce to keep it snappy
  useEffect(() => {
    const t = setTimeout(() => {
      const current = new URLSearchParams(Array.from(params.entries()));
      if (value) current.set("q", value);
      else current.delete("q");
      router.replace(`/?${current.toString()}`);
    }, 250);
    return () => clearTimeout(t);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={clsx(
        "flex items-center gap-2 rounded-full bg-[#12222a] px-4 py-3 border border-white/10",
        className
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" className="text-white/70">
        <path d="M21 21l-4.3-4.3M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-[15px] placeholder:text-white/50"
      />
    </div>
  );
}