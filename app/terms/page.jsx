export const metadata = { title: "Terms & Conditions - SwimTrack" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[800px] px-4 py-12 text-white/80">
      <h1 className="text-2xl font-bold text-white mb-6">Terms & Conditions</h1>
      <p className="mb-4">
        Welcome to SwimTrack. By using our service, you agree to comply with and
        be bound by these Terms & Conditions. Please read them carefully.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">
        1. Use of Service
      </h2>
      <p className="mb-4">
        SwimTrack is provided for personal, non-commercial use. You agree not to
        misuse the service or attempt to access it by any means other than the
        interface we provide.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">
        2. Accounts
      </h2>
      <p className="mb-4">
        When you create an account, you are responsible for maintaining the
        confidentiality of your login credentials and for all activities that
        occur under your account.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">
        3. Data and Privacy
      </h2>
      <p className="mb-4">
        Your personal data will be handled in accordance with our{" "}
        <a href="/privacy" className="text-blue-400 hover:underline">
          Privacy Policy
        </a>
        . We do not sell or share your data with third parties except as
        required to provide our service.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">
        4. Disclaimer
      </h2>
      <p className="mb-4">
        SwimTrack provides information "as is" without warranties of any kind.
        We do not guarantee accuracy, completeness, or fitness for a particular
        purpose.
      </p>

      <p className="text-white/60 mt-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </main>
  );
}