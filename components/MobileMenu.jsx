// components/MobileMenu.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileMenu({ user }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on outside click / Esc
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

  // Lock scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <div className="md:hidden relative">
      <button
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-90">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-90">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        role="menu"
        aria-hidden={!open}
        className={`absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl border border-white/10 bg-[#0f1a20] p-2 shadow-xl transition-all duration-150
          ${open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
      >
        {user ? (
          <div className="text-sm">
            <div className="px-3 py-2 text-white/70 truncate">{user.email}</div>

            <Link href="/" className="block w-full rounded-xl px-3 py-2 text-left text-white hover:bg-white/10">
              Home
            </Link>
            <Link href="/#saved" className="block w-full rounded-xl px-3 py-2 text-left text-white hover:bg-white/10">
              My saved swimmers
            </Link>
            <Link href="/about" className="block w-full rounded-xl px-3 py-2 text-left text-white hover:bg-white/10">
              About
            </Link>
            <Link href="/contact" className="block w-full rounded-xl px-3 py-2 text-left text-white hover:bg-white/10">
              Contact
            </Link>

            <div className="my-2 h-px bg-white/10" />

            {/* Legal links */}
            <Link href="/terms" className="block w-full rounded-xl px-3 py-2 text-left text-white/80 hover:bg-white/10">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="block w-full rounded-xl px-3 py-2 text-left text-white/80 hover:bg-white/10">
              Privacy Policy
            </Link>

            <div className="my-2 h-px bg-white/10" />

            <form action="/sign-out" method="post" className="px-2 pb-1 pt-1">
              <button className="w-full rounded-xl bg-red-600 hover:bg-red-500 px-3 py-2 text-white">
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <div className="text-sm">
            <Link href="/sign-in" className="block w-full rounded-xl px-3 py-2 text-left text-white hover:bg-white/10">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="mt-1 block w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-white hover:bg-white/10"
            >
              Create account
            </Link>

            <div className="my-2 h-px bg-white/10" />

            <Link href="/about" className="block w-full rounded-xl px-3 py-2 text-left text-white/80 hover:bg-white/10">
              About
            </Link>
            <Link href="/terms" className="block w-full rounded-xl px-3 py-2 text-left text-white/80 hover:bg-white/10">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="block w-full rounded-xl px-3 py-2 text-left text-white/80 hover:bg-white/10">
              Privacy Policy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}