"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bike,
  Building2,
  Newspaper,
  Ticket,
} from "lucide-react";

const destinations = [
  { id: "rentals", label: "Rent", href: "/search?listingType=RENT", icon: Bike, tone: "bg-[#E6F2EE] text-[#1E5646]" },
  { id: "campus-living", label: "PG & Roommates", href: "/campus-living", icon: Building2, tone: "bg-[#E6F2EE] text-[#1E5646]" },
  { id: "travel", label: "Tickets", href: "/travel", icon: Ticket, tone: "bg-[#E6F2EE] text-[#1E5646]" },
  { id: "news", label: "LPU News", href: "/lpu-news", icon: Newspaper, tone: "bg-[#E6F2EE] text-[#1E5646]" },
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
      className="flex min-w-0 flex-1 items-center justify-start gap-2 overflow-x-auto no-scrollbar sm:gap-2.5 lg:gap-3"
    >
      {destinations.map((destination) => {
        const Icon = destination.icon;
        const active =
          destination.id === "marketplace"
            ? pathname === "/" || (pathname === "/search" && listingType !== "RENT")
            : destination.id === "rentals"
              ? pathname === "/search" && listingType === "RENT"
              : destination.id === "campus-living"
              ? ["/campus-living", "/housing", "/roommates"].some((route) => pathname === route || pathname.startsWith(`${route}/`))
              : pathname === destination.href || pathname.startsWith(`${destination.href}/`);

        return (
          <Link
            key={destination.id}
            href={destination.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setListingType(destination.id === "rentals" ? "RENT" : "")}
            className={`group flex min-w-fit shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 transition hover:border-[#CAD8D2] sm:gap-2 sm:px-3 lg:px-3.5 ${
              active
                ? "border-[#1E5646] bg-[#1E5646] text-white"
                : "border-[#E2E8E5] bg-white text-[#4A5D56] hover:border-[#CAD8D2] hover:bg-[#F7F9F8]"
            }`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${destination.tone}`}>
              <Icon size={17} strokeWidth={2.1} />
            </span>
            <span className="whitespace-nowrap text-[11px] font-extrabold sm:text-xs lg:text-sm">
              {destination.label}
            </span>
            {destination.id === "news" && (
              <span className="rounded-full bg-[#E6F2EE] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1E5646]">
                LPU
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
