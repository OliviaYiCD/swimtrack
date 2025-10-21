// app/sign-up/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SignUpPage() {
  const supabase = createClientComponentClient();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const callbackUrl = useMemo(() => `${siteUrl}/auth/callback?next=/`, [siteUrl]);

  // local state for email signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // If a session is ever created immediately, still land at homepage
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        await fetch("/auth/callback", { method: "POST" });
        window.location.assign("/");
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Google SSO (unchanged)
  const handleGoogle = async () => {
    setErr("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) setErr(error.message);
  };

  // Custom email sign-up → always send to /welcome
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl, // if you re-enable confirmation later
        },
      });
      if (error) throw error;
      // Whether or not a session is created, send to congrats page:
      window.location.assign(`/welcome?email=${encodeURIComponent(email)}`);
    } catch (e) {
      setErr(e?.message ?? "Sign up failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-start justify-center pt-[8vh] sm:pt-[10vh] px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1a20] p-6 sm:p-8 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0b3a5e] to-[#0e5d8c] text-xl">
            🏊‍♂️
          </div>
          <h1 className="text-white text-2xl font-bold tracking-wide">Create an Account</h1>
          <p className="text-white/60 text-sm mt-1">
            Sign up with Google or your email to start tracking swimmers.
          </p>
        </div>

        {/* Google button (same style as your sign-in page) */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#3c4043] rounded-xl border border-[#dadce0] px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.55 2.75 30.08 0 24 0 14.64 0 6.48 5.38 2.45 13.22l7.98 6.21C12.21 13.58 17.68 9.5 24 9.5z" />
            <path fill="#34A853" d="M46.1 24.55c0-1.57-.14-3.08-.39-4.55H24v9.02h12.46c-.54 2.92-2.17 5.39-4.63 7.05l7.27 5.64c4.25-3.93 6.99-9.72 6.99-17.16z" />
            <path fill="#4A90E2" d="M10.43 28.43A14.48 14.48 0 019.5 24c0-1.54.26-3.03.74-4.43l-7.98-6.21A23.89 23.89 0 000 24c0 3.87.92 7.53 2.54 10.64l7.89-6.21z" />
            <path fill="#FBBC05" d="M24 48c6.48 0 11.91-2.13 15.87-5.79l-7.27-5.64c-2.01 1.35-4.6 2.16-8.6 2.16-6.32 0-11.79-4.08-13.57-9.63l-7.98 6.21C6.48 42.62 14.64 48 24 48z" />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <div className="my-5 flex items-center gap-3 text-white/40 text-xs">
          <div className="h-px flex-1 bg-white/10" />
          OR
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Email sign-up (custom, so we can redirect to /welcome) */}
        <form onSubmit={handleEmailSignUp} className="space-y-3 text-white">
          <label className="block text-sm text-white/80">
            Email address
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
            />
          </label>
          <label className="block text-sm text-white/80">
            Create a Password
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-medium transition-colors disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Sign up"}
          </button>

          {err && <p className="text-red-300 text-sm">{err}</p>}
        </form>

        <p className="text-center text-white/60 text-sm mt-4">
          Already have an account?{" "}
          <a href="/sign-in" className="text-blue-300 hover:text-blue-200 font-medium">
            Sign in
          </a>
        </p>
      </section>
    </main>
  );
}