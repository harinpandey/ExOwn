"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import TicketExperienceHeader from "@/components/travel/TicketExperienceHeader";
import TicketExperienceFooter from "@/components/travel/TicketExperienceFooter";

export default function ClientLayoutWrapper({ children, marketplaceShell }: { children: ReactNode; marketplaceShell: ReactNode }) {
  const pathname = usePathname();

  // The ticket shell replaces the taller marketplace header. Reset scroll on
  // route changes so the sticky ticket header cannot leave the hero offset.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  if (pathname === "/travel" || pathname.startsWith("/travel/")) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F7F9F8] text-[#13221D] dark:bg-[#0E1713] dark:text-[#E8F0EB]">
        <TicketExperienceHeader />
        <div className="page-transition flex-1">{children}</div>
        <TicketExperienceFooter />
      </div>
    );
  }
  return <>{marketplaceShell}</>;
}