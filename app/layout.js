import "./globals.css";
import Header from "@/components/Header";
import SupabaseListener from "@/components/SupabaseListener";

export const metadata = { title: "SwimTrack" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* Syncs auth between client and server */}
        <SupabaseListener />
        {/* Shows SwimTrack + login status */}
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}