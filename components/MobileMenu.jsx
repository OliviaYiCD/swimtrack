// components/MobileMenu.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function MobileMenu({ user }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // close on outside click / Esc
  useEffect(() => {
    function onDown(e) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) { if (e.key === "Escape") setOpen(false); }

    if (open) {
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onEsc);
    }
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="md:hidden relative">
      <button
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10"
      >
        {/* Hamburger icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-90">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-[#0f1a20] p-2 shadow-xl"
        >
          {user ? (
            <div className="text-sm">
              <div className="px-3 py-2 text-white/70 truncate">
                {user.email}
              </div>

              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block w-full rounded-xl px-3 py-2 text-left text-white hover:bg-white/10"
              >
                Home
              </Link>

              <Link
                href="/#saved"
                onClick={() => setOpen(false)}
                className="block w-full rounded-xl px-3 py-2 text-left text-white hover:bg-white/10"
              >
                My saved swimmers
              </Link>

              <div className="my-2 h-px bg-white/10" />

              <form action="/sign-out" method="POST" className="px-2 pb-1 pt-1">
                <button
                  className="w-full rounded-xl bg-red-600 hover:bg-red-500 px-3 py-2 text-white"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <div className="text-sm">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="block w-full rounded-xl px-3 py-2 text-left text-white hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="mt-1 block w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-white hover:bg-white/10"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}