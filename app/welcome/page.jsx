// app/welcome/page.jsx
"use client";

import { useSearchParams } from "next/navigation";

export default function WelcomePage() {
  const params = useSearchParams();
  const email = params.get("email");

  return (
    <main className="min-h-screen flex items-start justify-center pt-[8vh] sm:pt-[10vh] px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1a20] p-6 sm:p-8 shadow-[0_0_24px_rgba(0,0,0,0.35)] text-white">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0b3a5e] to-[#0e5d8c] text-xl">
            🎉
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Account created!</h1>
          <p className="text-white/60 text-sm mt-1">
            {email ? (
              <>
                Welcome, <span className="text-white">{email}</span>. You can now sign in to start
                saving swimmers and tracking results.
              </>
            ) : (
              "Welcome! You can now sign in to start saving swimmers and tracking results."
            )}
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/sign-in"
            className="block w-full text-center rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-medium transition-colors"
          >
            Continue to Sign In
          </a>

          <a
            href="/"
            className="block w-full text-center rounded-xl bg-white/10 hover:bg-white/20 px-4 py-3 text-sm"
          >
            Go to homepage
          </a>
        </div>

        <p className="text-white/60 text-xs mt-6 text-center">
          Tip: Google sign-in is fastest and works across devices.
        </p>
      </section>
    </main>
  );
}