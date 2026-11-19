"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HousePlus,
  KeyRound,
  Newspaper,
  TicketCheck,
} from "lucide-react";

const destinations = [
  { id: "rentals", label: "Rent", href: "/search?listingType=RENT", icon: KeyRound },
  { id: "campus-living", label: "PG & Roommates", href: "/campus-living", icon: HousePlus },
  { id: "tickets", label: "Ticket", href: "/travel", icon: TicketCheck },
  { id: "news", label: "LPU News", href: "/lpu-news", icon: Newspaper },
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
      className="grid min-w-0 flex-1 grid-cols-4 items-center gap-2 sm:gap-2.5 lg:gap-3"
    >
      {destinations.map((destination) => {
        const Icon = destination.icon;
        const active =
          destination.id === "rentals"
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
            className={`flex h-12 min-w-0 w-full items-center justify-center gap-1.5 rounded-xl border px-1.5 transition-colors duration-200 sm:gap-2 sm:px-2.5 lg:h-[52px] lg:gap-2.5 lg:px-3 ${
              active
                ? "border-[#C8E6D9] bg-[#DDF1E8] text-[#174536] shadow-sm"
                : "border-[#E2E8E5] bg-white text-[#4A5D56] hover:border-[#C8D9D1] hover:bg-[#F7F9F8]"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                active ? "bg-[#C8E6D9] text-[#174536]" : "bg-[#E6F2EE] text-[#1E5646]"
              }`}
            >
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="min-w-0 truncate whitespace-nowrap text-[10px] font-extrabold sm:text-[11px] lg:text-sm">
              {destination.label}
            </span>
            {destination.id === "news" && (
              <span className={`hidden shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:inline-flex ${
                active ? "bg-[#C8E6D9] text-[#174536]" : "bg-[#E6F2EE] text-[#1E5646]"
              }`}>
                LPU
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
