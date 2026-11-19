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
      className="flex w-auto min-w-0 shrink-0 items-center gap-2 sm:gap-3 lg:gap-4"
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
            className={`flex h-11 w-auto shrink-0 items-center justify-center gap-2 rounded-2xl border px-3 transition-colors duration-200 sm:h-[58px] sm:gap-3 sm:px-5 ${
              active
                ? "border-[#C8E6D9] bg-[#DDF1E8] text-[#174536] shadow-sm"
                : "border-[#E2E8E5] bg-white text-[#4A5D56] hover:border-[#C8D9D1] hover:bg-[#F7F9F8]"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-10 sm:w-10 ${
                active ? "bg-[#C8E6D9] text-[#174536]" : "bg-[#E6F2EE] text-[#1E5646]"
              }`}
            >
              <Icon size={17} strokeWidth={2} className="sm:h-[21px] sm:w-[21px]" aria-hidden="true" />
            </span>
            <span className="min-w-0 truncate whitespace-nowrap text-xs font-extrabold sm:text-[17px]">
              {destination.label}
            </span>
            {destination.id === "news" && (
              <span className={`hidden shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide sm:inline-flex ${
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
