import Link from "next/link";
import { ArrowLeft, BusFront, Clapperboard, GraduationCap, Ticket, TrainFront, Trophy } from "lucide-react";

export default function TicketExperienceHeader() {
  const nav = [
    { href: "/travel", label: "All tickets", icon: Ticket },
    { href: "/travel/train", label: "Train", icon: TrainFront },
    { href: "/travel/category/taxi-tickets", label: "Taxi", icon: BusFront },
    { href: "/travel/category/movie-tickets", label: "Movies", icon: Clapperboard },
    { href: "/travel/category/sports-tickets", label: "Sports", icon: Trophy },
    { href: "/travel/category/campus-event-tickets", label: "Campus", icon: GraduationCap },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-[#DCE8E5] bg-white/95 text-[#13221D] backdrop-blur dark:border-[#2A4136] dark:bg-[#101D17]/95 dark:text-[#E8F0EB]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-[68px] items-center gap-4">
          <Link href="/travel" aria-label="ExOwn Tickets home" className="flex shrink-0 items-center gap-2"><img src="/exown-logo.png" alt="ExOwn" className="h-9 w-auto"/><span className="hidden border-l border-[#DCE8E5] pl-3 text-sm font-extrabold sm:block">Tickets</span></Link>
          <nav aria-label="Ticket categories" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar">
            {nav.map(({href,label,icon:Icon})=><Link key={href} href={href} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#4A5D56] transition hover:bg-[#EAF2EF] hover:text-[#1E5646] dark:text-[#B4C5BC] dark:hover:bg-[#20362B]"><Icon size={15}/>{label}</Link>)}
          </nav>
          <Link href="/travel/list" className="hidden shrink-0 rounded-xl bg-[#1E5646] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#174536] sm:inline-flex"><Ticket size={14} className="mr-1.5"/> List a ticket</Link>
          <Link href="/search" className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold text-[#4A5D56] sm:inline-flex"><ArrowLeft size={14}/> Marketplace</Link>
        </div>
      </div>
    </header>
  );
}
