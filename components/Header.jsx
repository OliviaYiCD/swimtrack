import Link from "next/link";
import { getSupabaseServer } from "../lib/supabaseServer";

export default async function Header() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="w-full border-b border-white/10 bg-[#0b0f12]">
      <div className="max-w-[1028px] mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo / Home link */}
        <Link
          href="/"
          className="text-[18px] sm:text-[20px] font-semibold text-white tracking-wide flex items-center gap-2"
        >
          🏊‍♂️ <span>SwimTrack</span>
        </Link>

        {/* Right side: Auth section */}
        {user ? (
          <div className="flex items-center gap-3 text-sm text-white/90">
            <span className="truncate max-w-[160px]">{user.email}</span>

            {/* Sign Out button posts to /sign-out */}
            <form action="/sign-out" method="post">
              <button
                type="submit"
                className="rounded bg-red-600 hover:bg-red-700 px-3 py-1.5 text-sm text-white transition-colors duration-150"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/sign-in?next=/"
            className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm text-white transition-colors duration-150"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}