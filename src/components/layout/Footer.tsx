"use client";

import Link from "next/link";
import {
  Building2,
  Globe,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const marketplaceLinks = [
  { label: "Buy Items", href: "/search?listingType=SELL" },
  { label: "Rent Items", href: "/search?listingType=RENT" },
  { label: "Exchange", href: "/search?exchange=true" },
  { label: "Student Housing", href: "/housing" },
  { label: "Roommates", href: "/roommates" },
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
  // The global footer is informational only. Keep listing actions in the
  // section header so the same action is not repeated in every experience.
  return (
    <footer className="border-t border-[#17645F] bg-[#17645F] pb-20 pt-14 text-[#F3EEE8] md:pb-14">
      <div className="container mx-auto px-4">

        {/* Main Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" aria-label="ExOwn home">
              <img src="/exown-logo.png" alt="ExOwn" className="h-8 w-auto" />
            </Link>
            <p className="text-sm leading-6 text-[#F3EEE8]/75">
              Exchange. Own. Repeat. The trusted campus marketplace for students.
            </p>
            <div className="space-y-2">
              {trustSignals.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-xs font-semibold text-[#F3EEE8]/75">
                  <s.icon size={14} className="text-[#FFB19D]" />
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
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4DCD3] bg-[#EFE5DA] text-[#526663] transition hover:border-[#FF6845] hover:text-[#FFB19D]"
              >
                <Globe size={16} />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#526663]">Marketplace</p>
            <ul className="space-y-3">
              {marketplaceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[#526663] transition hover:text-[#FFB19D]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#526663]">Categories</p>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[#526663] transition hover:text-[#17645F]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#526663]">Company</p>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[#526663] transition hover:text-[#17645F]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E4DCD3] pt-8 sm:flex-row">
          <p className="text-xs font-medium text-[#526663]">
            &copy; {new Date().getFullYear()} ExOwn Technologies. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#526663]">
            <span>Made for students, by students</span>
            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-[#EFE5DA]/20" aria-hidden />
            <span className="text-primary">Exchange. Own. Repeat.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
