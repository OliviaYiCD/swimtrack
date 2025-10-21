// app/layout.js
import "./globals.css";
import Header from "../components/Header";
import SupabaseListener from "../components/SupabaseListener";

export const metadata = { title: "SwimTrack" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <SupabaseListener />
        <Header />
        <main className="mx-auto max-w-[1028px] px-4 sm:px-6">{children}</main>     
         </body>
    </html>
  );
}