import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";

export default async function Header() {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="w-full border-b border-gray-700 py-4 px-6 flex items-center justify-between">
      {/* App name */}
      <Link href="/" className="text-xl font-semibold text-white">
        🏊‍♂️ SwimTrack
      </Link>

      {/* Right side: user info or sign-in link */}
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
          href="/sign-in?next=/swimmers"
          className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
        >
          Sign In
        </Link>
      )}
    </header>
  );
}