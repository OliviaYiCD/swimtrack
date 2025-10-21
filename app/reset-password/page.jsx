// app/reset-password/page.jsx
"use client";

import { useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ResetPasswordRequestPage() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Compute site URL safely for redirect
  const siteUrl = useMemo(() => {
    if (typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // ✅ Key change: ensure redirectTo points to your reset-password/update page
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/reset-password/update`,
      });

      if (error) throw error;
      setSent(true);
    } catch (e) {
      setErr(e?.message ?? "Could not send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-start justify-center pt-[8vh] sm:pt-[10vh] px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1a20] p-6 sm:p-8 shadow-[0_0_24px_rgba(0,0,0,0.35)] text-white">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0b3a5e] to-[#0e5d8c] text-xl">
            🔒
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Reset your password</h1>
          <p className="text-white/60 text-sm mt-1">
            Enter your email and we’ll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl bg-white/10 border border-white/10 p-4 text-sm">
            <p className="text-white/80">
              If an account exists for{" "}
              <span className="font-medium">{email}</span>, a reset link has been sent.
              <br />
              Please check your inbox and follow the link to set a new password.
            </p>
            <a
              href="/sign-in"
              className="inline-block mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm"
            >
              Back to sign in
            </a>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm text-white/80">
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm placeholder:text-white/40 
                           focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset email"}
            </button>

            {err && <p className="text-red-300 text-sm">{err}</p>}
          </form>
        )}
      </section>
    </main>
  );
}