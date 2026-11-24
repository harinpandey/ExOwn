"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import TicketExperienceHeader from "@/components/travel/TicketExperienceHeader";
import TicketExperienceFooter from "@/components/travel/TicketExperienceFooter";

export default function ClientLayoutWrapper({ children, marketplaceShell }: { children: ReactNode; marketplaceShell: ReactNode }) {
  const pathname = usePathname();
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