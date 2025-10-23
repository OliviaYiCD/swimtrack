// app/layout.jsx
import "./globals.css";   // <-- ensure this is here (top-level)
import Header from "../components/Header";
import SupabaseListener from "../components/SupabaseListener";
import Footer from "../components/Footer";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <SupabaseListener />
        <Header />
        <main className="mx-auto max-w-[1028px] px-4 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}


export const metadata = {
  title: "SwimTrack",
  description: "Track swimmers' progress and performance results.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: { url: "/apple-touch-icon.png" },
  },
};