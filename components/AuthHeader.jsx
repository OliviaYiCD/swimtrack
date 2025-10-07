import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";

export default async function AuthHeader() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-between">
      <Link href="/" className="text-xl font-semibold">🏊‍♂️ SwimTrack</Link>

      {user ? (
        <div className="flex items-center gap-3 text-sm">
          <span className="opacity-80">{user.email}</span>
          <form action="/sign-out" method="post">
            <button className="rounded bg-red-600 px-3 py-1.5 text-white">
              Sign Out
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/sign-in?next=/swimmers"
          className="rounded bg-blue-600 px-3 py-1.5 text-white"
        >
          Sign In
        </Link>
      )}
    </header>
  );
}