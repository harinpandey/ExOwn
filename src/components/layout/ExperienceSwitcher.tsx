"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bike,
  Building2,
  Newspaper,
  Plane,
  Store,
  Users,
} from "lucide-react";

const destinations = [
  { id: "marketplace", label: "ExOwn", href: "/", icon: Store, tone: "bg-primary text-white" },
  { id: "rentals", label: "Rentals", href: "/search?listingType=RENT", icon: Bike, tone: "bg-emerald-600 text-white" },
  { id: "housing", label: "PG & Housing", href: "/housing", icon: Building2, tone: "bg-violet-600 text-white" },
  { id: "roommates", label: "Roommates", href: "/roommates", icon: Users, tone: "bg-cyan-700 text-white" },
  { id: "travel", label: "Travel & Tickets", href: "/travel", icon: Plane, tone: "bg-orange-600 text-white" },
  { id: "news", label: "LPU News", href: "/lpu-news", icon: Newspaper, tone: "bg-blue-700 text-white" },
];

export default function ExperienceSwitcher() {
  const pathname = usePathname();
  const [listingType, setListingType] = useState("");

  useEffect(() => {
    setListingType(new URLSearchParams(window.location.search).get("listingType") || "");
  }, [pathname]);

  return (
    <nav
      aria-label="ExOwn services"
      className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 py-2.5 no-scrollbar dark:border-white/10 sm:gap-3"
    >
      {destinations.map((destination) => {
        const Icon = destination.icon;
        const active =
          destination.id === "marketplace"
            ? pathname === "/" || (pathname === "/search" && listingType !== "RENT")
            : destination.id === "rentals"
              ? pathname === "/search" && listingType === "RENT"
              : pathname === destination.href || pathname.startsWith(`${destination.href}/`);

        return (
          <Link
            key={destination.id}
            href={destination.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setListingType(destination.id === "rentals" ? "RENT" : "")}
            className={`group flex min-w-fit shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 transition hover:-translate-y-0.5 hover:shadow-sm sm:px-4 ${
              active
                ? "border-primary/25 bg-primary/10 text-primary dark:bg-primary/15"
                : "border-gray-100 bg-gray-100/90 text-gray-700 hover:border-gray-200 hover:bg-gray-100 dark:border-white/5 dark:bg-white/[0.05] dark:text-white/75 dark:hover:bg-white/[0.09]"
            }`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${destination.tone}`}>
              <Icon size={17} strokeWidth={2.1} />
            </span>
            <span className="whitespace-nowrap text-xs font-extrabold sm:text-sm">
              {destination.label}
            </span>
            {destination.id === "news" && (
              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-blue-700 dark:bg-blue-400/15 dark:text-blue-300">
                LPU
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
