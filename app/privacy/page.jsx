export const metadata = { title: "Privacy Policy - SwimTrack" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[800px] px-4 py-12 text-white/80">
      <h1 className="text-2xl font-bold text-white mb-6">Privacy Policy</h1>
      <p className="mb-4">
        At SwimTrack, your privacy is important to us. This policy explains what
        data we collect, how we use it, and your rights regarding your
        information.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">
        1. Information We Collect
      </h2>
      <ul className="list-disc list-inside mb-4">
        <li>Account information (email, name)</li>
        <li>Swimmer preferences and saved data</li>
        <li>Analytics and usage data to improve the platform</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc list-inside mb-4">
        <li>To provide and personalize your SwimTrack experience</li>
        <li>To communicate updates, features, and support messages</li>
        <li>To analyze usage and improve our services</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">
        3. Data Storage and Security
      </h2>
      <p className="mb-4">
        We use secure databases and encryption where appropriate. Although we
        take strong precautions, no system can be guaranteed 100% secure.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">
        4. Your Rights
      </h2>
      <p className="mb-4">
        You may request to view, update, or delete your personal data at any
        time by contacting our support team at{" "}
        <a href="mailto:support@swimtrack.app" className="text-blue-400 hover:underline">
          support@swimtrack.app
        </a>
        .
      </p>

      <p className="text-white/60 mt-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </main>
  );
}