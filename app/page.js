// app/page.js
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Please sign in to continue</h1>
        <a
          href="/sign-in"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">
        Welcome, {user.email} 🎉
      </h1>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
      >
        Sign Out
      </button>
    </div>
  );
}