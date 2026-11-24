"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket } from "lucide-react";
import ExperienceSwitcher from "@/components/layout/ExperienceSwitcher";

export default function TicketExperienceHeader() {
  const pathname = usePathname();
  const isListingPage = pathname === "/travel/list";

  return (
    <header className="sticky top-0 z-50 border-b border-[#DCE8E5] bg-white/95 text-[#13221D] backdrop-blur-xl dark:border-[#2A4136] dark:bg-[#101D17]/95 dark:text-[#E8F0EB]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-[72px] items-center gap-3 py-2 sm:gap-5">
          <Link
            href="/"
            aria-label="Go to ExOwn home"
            className="flex shrink-0 items-center rounded-xl p-1 transition hover:bg-[#EAF2EF] dark:hover:bg-[#20362B]"
          >
            <img src="/exown-logo.png" alt="ExOwn" className="h-9 w-auto sm:h-10" />
          </Link>

          <div className="min-w-0 flex-1">
            <ExperienceSwitcher />
          </div>

          {!isListingPage && (
            <Link
              href="/travel/list"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1E5646] px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#174536] sm:px-4"
            >
              <Ticket size={15} />
              <span className="hidden sm:inline">List a ticket</span>
              <span className="sm:hidden">List</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
