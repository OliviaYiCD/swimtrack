import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-[#0f1a20] text-white/70">
      <div className="mx-auto max-w-[1028px] px-4 sm:px-6 py-8 text-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookies Policy
            </Link>
          </nav>
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} SwimTrack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}