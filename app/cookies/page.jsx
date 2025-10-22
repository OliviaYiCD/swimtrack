export const metadata = { title: "Cookies Policy - SwimTrack" };

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-[800px] px-4 py-12 text-white/80">
      <h1 className="text-2xl font-bold text-white mb-6">Cookies Policy</h1>

      <p className="mb-4">
        This Cookies Policy explains how SwimTrack uses cookies and similar
        technologies to recognize you when you visit our site or use our
        services. It explains what these technologies are and why we use them,
        as well as your rights to control our use of them.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">1. What are cookies?</h2>
      <p className="mb-4">
        Cookies are small data files placed on your device. They are widely used
        to make websites work, or to work more efficiently, as well as to
        provide reporting information.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">2. How we use cookies</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Essential cookies for authentication and security</li>
        <li>Preference cookies to remember settings (e.g., filters)</li>
        <li>Analytics cookies to understand usage and improve features</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">3. Managing cookies</h2>
      <p className="mb-4">
        Most browsers let you control cookies through settings. If you disable
        cookies, some features of SwimTrack may not function properly.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">4. Updates</h2>
      <p className="mb-4">
        We may update this policy to reflect changes to our practices or for
        other operational, legal, or regulatory reasons.
      </p>

      <p className="text-white/60 mt-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </main>
  );
}