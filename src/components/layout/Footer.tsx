import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Globe,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const marketplaceLinks = [
  { label: "Buy Items", href: "/search?listingType=SELL" },
  { label: "Rent Items", href: "/search?listingType=RENT" },
  { label: "Exchange", href: "/search?exchange=true" },
  { label: "Student Housing", href: "/search?category=properties" },
  { label: "Roommates", href: "/requests" },
  { label: "Campus Services", href: "/search?listingType=SERVICE" },
];

const categoryLinks = [
  { label: "Mobiles & Gadgets", href: "/search?category=mobiles-gadgets" },
  { label: "Laptops", href: "/search?category=computers-laptops" },
  { label: "Books", href: "/search?category=books-sports-hobbies" },
  { label: "Cycles", href: "/search?category=bikes-transport" },
  { label: "Furniture", href: "/search?category=furniture-hostel" },
  { label: "Gaming", href: "/search?category=gaming-entertainment" },
];

const companyLinks = [
  { label: "About ExOwn", href: "/about" },
  { label: "Safety Center", href: "/safety" },
  { label: "FAQ", href: "/faq" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const trustSignals = [
  { icon: ShieldCheck, label: "Campus verified sellers" },
  { icon: RefreshCw, label: "Exchange & rent support" },
  { icon: Building2, label: "Student housing listings" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white pb-20 pt-14 text-gray-900 transition-colors dark:border-white/10 dark:bg-[#07090d] dark:text-white md:pb-14">
      <div className="container mx-auto px-4">

        {/* Top CTA Strip */}
        <div className="mb-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-5 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">Start trading on ExOwn</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-600 dark:text-white/55">List something and connect with students around you.</p>
          </div>
          <Link
            href="/sell"
            className="marketplace-button inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-white transition active:scale-95"
          >
            + Sell Something
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" aria-label="ExOwn home">
              <img src="/exown-logo.png" alt="ExOwn" className="h-8 w-auto" />
            </Link>
            <p className="text-sm font-semibold leading-6 text-gray-600 dark:text-white/45">
              Exchange. Own. Repeat. The trusted campus marketplace for students.
            </p>
            <div className="space-y-2">
              {trustSignals.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-white/50">
                  <s.icon size={14} className="text-primary" />
                  {s.label}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://exown.in"
                target="_blank"
                rel="noreferrer"
                aria-label="ExOwn Website"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-gray-600 transition hover:border-primary hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45 dark:hover:border-primary"
              >
                <Globe size={16} />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/35">Marketplace</p>
            <ul className="space-y-3">
              {marketplaceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-gray-600 transition hover:text-primary dark:text-white/55 dark:hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/35">Categories</p>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-gray-600 transition hover:text-primary dark:text-white/55 dark:hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/35">Company</p>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-gray-600 transition hover:text-primary dark:text-white/55 dark:hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 dark:border-white/10 sm:flex-row">
          <p className="text-xs font-semibold text-gray-500 dark:text-white/30">
            &copy; {new Date().getFullYear()} ExOwn Technologies. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-white/30">
            <span>Made for students, by students</span>
            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-white/20" aria-hidden />
            <span className="text-primary">Exchange. Own. Repeat.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
