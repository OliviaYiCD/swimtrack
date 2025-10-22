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