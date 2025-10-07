// components/Header.jsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";

export default async function Header() {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="w-full border-b border-gray-700 py-4 px-6 flex items-center justify-between bg-black">
      {/* Left: App name + nav links */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-xl font-semibold text-white hover:text-blue-400"
        >
          🏊‍♂️ SwimTrack
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-6 text-sm text-gray-300">
          <Link
            href="/"
            className="hover:text-blue-400 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/swimmers"
            className="hover:text-blue-400 transition-colors"
          >
            Swimmers
          </Link>
          {user && (
            <Link
              href="/saved"
              className="hover:text-blue-400 transition-colors"
            >
              My Swimmers
            </Link>
          )}
        </nav>
      </div>

      {/* Right: user info or sign-in link */}
      {user ? (
        <div className="flex items-center gap-3 text-sm text-white">
          <span>{user.email}</span>
          <form action="/sign-out" method="post">
            <button className="rounded bg-red-600 px-3 py-1 hover:bg-red-700">
              Sign Out
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/sign-in?next=/"
          className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
        >
          Sign In
        </Link>
      )}
    </header>
  );
}