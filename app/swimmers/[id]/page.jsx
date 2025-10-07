import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import SaveButton from "@/components/SaveButton";

export default async function SwimmerProfile({ params }) {
  // ✅ await params to avoid Next.js sync-dynamic-apis error
  const { id } = await params;

  const supabase = getSupabaseServer();

  // Current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Swimmer details
  const { data: swimmer } = await supabase
    .from("swimmers")
    .select("id, full_name, gender, age_years")
    .eq("id", id)
    .single();

  if (!swimmer) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p>Swimmer not found.</p>
        <Link href="/swimmers" className="text-blue-400 hover:underline">
          ← Back to all swimmers
        </Link>
      </main>
    );
  }

  // Check if saved
  let initiallySaved = false;
  if (user) {
    const { data: saved } = await supabase
      .from("saved_swimmers")
      .select("id")
      .eq("user_id", user.id)
      .eq("swimmer_id", swimmer.id)
      .maybeSingle();

    initiallySaved = !!saved;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{swimmer.full_name}</h1>
      <p className="opacity-80 mb-4">
        Gender: {swimmer.gender} • Age: {swimmer.age_years}
      </p>

      {user ? (
        <SaveButton swimmerId={swimmer.id} initiallySaved={initiallySaved} />
      ) : (
        <Link href="/sign-in" className="text-blue-400 hover:underline">
          Sign in to save this swimmer
        </Link>
      )}

      <h2 className="mt-8 text-xl font-semibold">🏅 Recent Results</h2>
      <p className="opacity-70">Coming soon — will show this swimmer’s meet results here.</p>

      <p className="mt-6">
        <Link href="/swimmers" className="text-blue-400 hover:underline">
          ← Back to all swimmers
        </Link>
      </p>
    </main>
  );
}