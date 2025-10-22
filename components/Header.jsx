// components/Header.jsx
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import { getSupabaseServer } from "../lib/supabaseServer";

export default async function Header() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1216]/80 backdrop-blur">
      <div className="mx-auto max-w-[1024px] px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 text-white font-semibold">
          <span className="text-xl">🏊‍♂️</span>
          <span className="tracking-wide">SwimTrack</span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="max-w-[200px] truncate text-white/70 text-sm">
                {user.email}
              </span>
              <form action="/sign-out" method="POST">
                <button
                  className="rounded-xl bg-red-600 hover:bg-red-500 px-3 py-2 text-sm text-white"
                >
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-2 text-sm text-white"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <MobileMenu user={user} />
      </div>
    </header>
  );
}