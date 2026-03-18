export default function Footer() {
    const footerLinkClass =
      "cursor-pointer hover:text-white hover:underline underline-offset-4 transition-all duration-200";
  
    return (
      <footer className="mt-auto w-full bg-gray-900 text-gray-300">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm sm:flex-row">
          <a href="/" className={footerLinkClass}>
            © 2026 User Management System
          </a>
          <div className="flex gap-6">
            <a href="/privacy" className={footerLinkClass}>
              Privacy
            </a>
            <a href="/terms" className={footerLinkClass}>
              Terms
            </a>
            <a href="/support" className={footerLinkClass}>
              Support
            </a>
          </div>
        </div>
      </footer>
    );
  }
  
  