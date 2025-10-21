// app/reset-password/update/page.jsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordUpdatePage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [err, setErr] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [done, setDone] = useState(false);

  // After /auth/callback sets the cookies, we should already have a session.
  useEffect(() => {
    let alive = true;
    (async () => {
      setChecking(true);
      setErr("");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!alive) return;
        if (session) {
          setReady(true);
        } else {
          setErr(
            "Auth session missing! Please open this page from the reset email link again (on the same device)."
          );
        }
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Could not initialize reset session.");
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, [supabase]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (pw1.length < 8) return setErr("Password must be at least 8 characters.");
    if (pw1 !== pw2)  return setErr("Passwords do not match.");

    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;

      // Optional: refresh server cookies, then show success
      await fetch("/auth/callback", { method: "POST" });
      setDone(true);
    } catch (e) {
      setErr(e?.message ?? "Failed to update password.");
    }
  };

  return (
    <main className="min-h-screen flex items-start justify-center pt-[8vh] sm:pt-[10vh] px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1a20] p-6 sm:p-8 shadow-[0_0_24px_rgba(0,0,0,0.35)] text-white">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-600/20 text-xl">
            ✅
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Set a new password</h1>
          <p className="text-white/60 text-sm mt-1">
            Enter and confirm your new password below.
          </p>
        </div>

        {checking ? (
          <p className="text-white/70 text-sm">Preparing secure session…</p>
        ) : done ? (
          <div className="rounded-xl bg-white/10 border border-white/10 p-4 text-sm">
            <p className="text-white/80">Your password has been updated.</p>
            <a href="/sign-in" className="inline-block mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm">
              Continue to sign in
            </a>
          </div>
        ) : (
          <>
            {!ready && err && <p className="text-red-300 text-sm mb-4">{err}</p>}

            <form onSubmit={onSubmit} className="space-y-3" aria-disabled={!ready}>
              <label className="block text-sm text-white/80">
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={pw1}
                  onChange={(e) => setPw1(e.target.value)}
                  required
                  disabled={!ready}
                  className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm
                             placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/30
                             focus:border-blue-400/40 disabled:opacity-50"
                />
              </label>

              <label className="block text-sm text-white/80">
                Confirm password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  required
                  disabled={!ready}
                  className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm
                             placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/30
                             focus:border-blue-400/40 disabled:opacity-50"
                />
              </label>

              <button
                type="submit"
                disabled={!ready}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-medium
                           transition-colors disabled:opacity-60"
              >
                Update password
              </button>

              {err && ready && <p className="text-red-300 text-sm">{err}</p>}
            </form>

            {!ready && (
              <p className="text-white/60 text-xs mt-4">
                Tip: Open the link on the <strong>same device & browser</strong> where you requested the reset,
                or request a new email.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}