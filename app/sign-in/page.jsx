// app/sign-in/page.jsx
"use client";

import { useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SignInPage() {
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");

  // Compute the OAuth redirect target once (works on localhost or prod)
  const callbackUrl = useMemo(() => {
    // If rendered in the browser, prefer window.location.origin
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}/auth/callback?next=/`;
    }
    // Fallback to env if pre-rendered (optional)
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    return `${site ?? "http://localhost:3000"}/auth/callback?next=/`;
  }, []);

  // EMAIL + PASSWORD
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // success → go home (the session cookie is set on the client by supabase-js)
      window.location.assign("/");
    } catch (e) {
      setErr(e?.message ?? "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE OAUTH → /auth/callback exchanges code for session cookie
  const handleGoogleSignIn = async () => {
    setErr("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
      // Redirect happens automatically by Supabase; no further action here.
    } catch (e) {
      setErr(e?.message ?? "Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Sign In</h1>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-gray-900 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />

          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-900 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In with Email"}
          </button>
        </form>

        <div className="my-6 h-px bg-gray-800" />

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 rounded bg-red-500 hover:bg-red-400"
        >
          Continue with Google
        </button>

        {err && <p className="text-red-400 mt-4 text-sm">{err}</p>}

        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{" "}
          <a href="/sign-up" className="text-blue-400 hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}