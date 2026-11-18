"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bike,
  Building2,
  Newspaper,
  Plane,
} from "lucide-react";

const destinations = [
  { id: "rentals", label: "Rent", href: "/search?listingType=RENT", icon: Bike, tone: "bg-[#EAF2EF] text-[#2F6F5E]" },
  { id: "campus-living", label: "PG & Roommates", href: "/campus-living", icon: Building2, tone: "bg-[#EAF2EF] text-[#2F6F5E]" },
  { id: "travel", label: "Travel", href: "/travel", icon: Plane, tone: "bg-[#EAF2EF] text-[#2F6F5E]" },
  { id: "news", label: "LPU News", href: "/lpu-news", icon: Newspaper, tone: "bg-[#EAF2EF] text-[#2F6F5E]" },
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
            className={`group flex min-w-fit shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 transition hover:-translate-y-0.5 hover:shadow-sm sm:gap-2 sm:px-3 lg:px-3.5 ${
              active
                ? "border-[#DCE5E1] bg-[#EAF2EF] text-[#2F6F5E]"
                : "border-[#DCE5E1] bg-white text-[#4B5E57] hover:border-[#B8C9C1] hover:bg-[#EAF2EF]"
            }`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${destination.tone}`}>
              <Icon size={17} strokeWidth={2.1} />
            </span>
            <span className="whitespace-nowrap text-[11px] font-extrabold sm:text-xs lg:text-sm">
              {destination.label}
            </span>
            {destination.id === "news" && (
              <span className="rounded-full bg-[#EAF2EF] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#2F6F5E]">
                LPU
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
