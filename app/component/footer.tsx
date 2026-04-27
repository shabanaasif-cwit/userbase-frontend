import Link from "next/link";

export default function Footer() {
  const footerLinkClass =
    "cursor-pointer hover:text-white hover:underline underline-offset-4 transition-all duration-200";

  return (
    <footer className="mt-auto w-full bg-gray-900 text-gray-300">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm sm:flex-row sm:px-6">
        <Link href="/" className={footerLinkClass}>
          &copy; 2026 User Management System
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end sm:gap-6">
          <Link href="/privacy" className={footerLinkClass}>
            Privacy
          </Link>
          <Link href="/terms" className={footerLinkClass}>
            Terms
          </Link>
          <Link href="/support" className={footerLinkClass}>
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
