import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-55 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 pt-8 pb-20 md:pb-8 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <Link href="/" className="block">
              <img src="/exown-logo.png" alt="ExOwn Logo" className="h-8 w-auto" />
            </Link>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center md:text-left">
              Exchange. Own. Repeat. The circular commerce platform for campus.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/safety" className="hover:text-primary transition-colors">Safety</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-900 mt-6 pt-6 text-center text-gray-400 dark:text-gray-500 text-[10px] font-semibold">
          <p>&copy; {new Date().getFullYear()} ExOwn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
