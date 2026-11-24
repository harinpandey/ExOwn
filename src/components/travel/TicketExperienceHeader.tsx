"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BusFront, Clapperboard, GraduationCap, Music, Ticket, TrainFront, Trophy } from "lucide-react";
import ExperienceSwitcher from "@/components/layout/ExperienceSwitcher";

const categories = [
  { href: "/travel", label: "All tickets", icon: Ticket },
  { href: "/travel/train", label: "Train", icon: TrainFront },
  { href: "/travel/category/taxi-tickets", label: "Taxi / Cab", icon: BusFront },
  { href: "/travel/category/movie-tickets", label: "Movies", icon: Clapperboard },
  { href: "/travel/category/sports-tickets", label: "Cricket & Sports", icon: Trophy },
  { href: "/travel/category/concert-tickets", label: "Concerts", icon: Music },
  { href: "/travel/category/campus-event-tickets", label: "Campus", icon: GraduationCap },
  { href: "/travel/category/other-event-tickets", label: "Other events", icon: Ticket },
];

export default function TicketExperienceHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-[#DCE8E5] bg-white/95 text-[#13221D] backdrop-blur-xl dark:border-[#2A4136] dark:bg-[#101D17]/95 dark:text-[#E8F0EB]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-[64px] items-center gap-3 border-b border-[#E8EFEC] py-2 dark:border-[#2A4136]">
          <Link href="/" aria-label="Go to ExOwn home" className="flex shrink-0 items-center rounded-xl p-1 transition hover:bg-[#EAF2EF] dark:hover:bg-[#20362B]">
            <img src="/exown-logo.png" alt="ExOwn" className="h-9 w-auto sm:h-10"/>
          </Link>
          <div className="min-w-0 flex-1"><ExperienceSwitcher/></div>
          {pathname !== "/travel/list" && <Link href="/travel/list" className="hidden shrink-0 rounded-xl bg-[#1E5646] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#174536] sm:inline-flex">List a ticket</Link>}
        </div>
        <nav aria-label="Ticket categories" className="flex min-h-[48px] items-center gap-1 overflow-x-auto py-1.5 no-scrollbar">
          {categories.map(({href,label,icon:Icon}) => {
            const active = href === "/travel" ? pathname === "/travel" : pathname === href || pathname.startsWith(href + "/");
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${active ? "bg-[#1E5646] text-white" : "text-[#4A5D56] hover:bg-[#EAF2EF] hover:text-[#1E5646] dark:text-[#B4C5BC] dark:hover:bg-[#20362B]"}`}><Icon size={15}/>{label}</Link>;
          })}
        </nav>
      </div>
    </header>
  );
}
