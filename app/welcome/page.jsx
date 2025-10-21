// app/welcome/page.jsx
import Link from "next/link";

export const metadata = {
  title: "Welcome",
};

export default function WelcomePage({ searchParams }) {
  const email =
    typeof searchParams?.email === "string" ? searchParams.email : "";
  const next =
    typeof searchParams?.next === "string" ? searchParams.next : "/";

  return (
    <main className="min-h-screen flex items-start justify-center pt-[8vh] sm:pt-[10vh] px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1a20] p-6 sm:p-8 shadow-[0_0_24px_rgba(0,0,0,0.35)] text-white">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0b3a5e] to-[#0e5d8c] text-xl">
            🥳
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Account created!</h1>
          <p className="text-white/60 text-sm mt-1">
            {email ? (
              <>
                Welcome, <span className="text-white">{email}</span>.{" "}
              </>
            ) : (
              "Welcome. "
            )}
            You can now sign in to start saving swimmers.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/sign-in?next=${encodeURIComponent(next)}`}
            className="block w-full text-center rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-medium transition-colors"
          >
            Continue to sign in
          </Link>
          <Link
            href="/"
            className="block w-full text-center rounded-xl bg-white/10 hover:bg-white/20 px-4 py-3 text-sm"
          >
            Go to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}