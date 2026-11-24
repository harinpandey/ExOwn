import Link from "next/link";
import { ArrowRight, BusFront, CalendarDays, Clapperboard, GraduationCap, Music, ShieldCheck, Ticket, TrainFront, Trophy } from "lucide-react";

export const metadata = {
  title: "Tickets | ExOwn",
  description: "Discover student-listed train, taxi, movie, event, sports and campus tickets.",
};

const ticketTypes = [
  { title: "Train tickets", description: "Search by origin, destination and journey date. Discover direct or relevant station listings.", category: "train-tickets", icon: TrainFront, tag: "Rail journeys", href: "/travel/train" },
  { title: "Taxi / Cab", description: "Find student-shared cab or taxi seats for a route and travel date.", category: "taxi-tickets", icon: BusFront, tag: "Local & intercity" },
  { title: "Movie tickets", description: "Find student-listed cinema tickets when plans change.", category: "movie-tickets", icon: Clapperboard, tag: "Movies" },
  { title: "Cricket & sports", description: "Discover tickets for cricket matches and other sporting events.", category: "sports-tickets", icon: Trophy, tag: "Sports" },
  { title: "Concerts & festivals", description: "Browse eligible music, festival and live-show tickets.", category: "concert-tickets", icon: Music, tag: "Live events" },
  { title: "College events", description: "Find fest, club, cultural and campus-event passes.", category: "campus-event-tickets", icon: GraduationCap, tag: "On campus" },
  { title: "Other event tickets", description: "Explore theatre, comedy, exhibitions and other event listings.", category: "other-event-tickets", icon: Ticket, tag: "More events" },
];

export default function TicketExchangePage() {
  return (
    <main className="min-h-screen bg-[#F7F9F8] pb-14 text-[#13221D] dark:bg-[#0E1713] dark:text-[#E8F0EB]">
      <section className="border-b border-[#DCE8E5] bg-white dark:border-[#2A4136] dark:bg-[#14231C]">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F2EE] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]"><Ticket size={14}/> ExOwn Ticket</span>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">Your next ticket.<br/><span className="text-[#1E5646] dark:text-[#91CDB0]">Found through students.</span></h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4A5D56] sm:text-base dark:text-[#B4C5BC]">Choose what you’re looking for. Each ticket type opens its own search and listings experience—separate from the ExOwn Marketplace.</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#DCE8E5] bg-[#F7F9F8] px-4 py-3 text-xs font-semibold text-[#4A5D56] dark:border-[#2A4136] dark:bg-[#101D17] dark:text-[#B4C5BC]"><Ticket size={15} className="text-[#1E5646] dark:text-[#91CDB0]"/> Choose a ticket category below to begin</div>
            </div>
            <aside className="max-w-sm rounded-2xl border border-[#DCE8E5] bg-[#F7F9F8] p-5 dark:border-[#2A4136] dark:bg-[#101D17]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F2EE] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]"><ShieldCheck size={22}/></div>
              <h2 className="mt-4 text-lg font-extrabold">Student-to-student discovery</h2>
              <p className="mt-2 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">ExOwn connects you with the ticket owner. We don’t issue tickets or book travel. Check transfer eligibility and ticket details with the issuer and seller.</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6">
        <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E5646] dark:text-[#91CDB0]">Choose a ticket category</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight">What are you looking for?</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ticketTypes.map((item) => {
            const Icon = item.icon;
            return <Link key={item.category} href={item.href || "/travel/category/" + item.category} className="group flex min-h-[210px] flex-col rounded-2xl border border-[#DCE8E5] bg-white p-5 shadow-[0_1px_4px_rgba(19,34,29,0.035)] transition hover:-translate-y-0.5 hover:border-[#C8D6D0] hover:shadow-[0_6px_18px_rgba(19,34,29,0.07)] dark:border-[#2A4136] dark:bg-[#14231C]">
              <div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F2EE] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]"><Icon size={21}/></span><span className="rounded-full bg-[#F7F9F8] px-2.5 py-1 text-[10px] font-bold text-[#4A5D56] dark:bg-[#101D17] dark:text-[#B4C5BC]">{item.tag}</span></div>
              <h3 className="mt-5 text-lg font-bold">{item.title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">{item.description}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#1E5646] dark:text-[#91CDB0]">Explore {item.title.toLowerCase()} <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span>
            </Link>;
          })}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 sm:px-6"><div className="rounded-2xl border border-[#DCE8E5] bg-[#EAF2EF] p-5 sm:p-6 dark:border-[#2A4136] dark:bg-[#14251D]"><div className="flex items-start gap-3"><CalendarDays className="mt-0.5 text-[#1E5646] dark:text-[#91CDB0]" size={20}/><div><h2 className="font-extrabold">Student-to-student ticket discovery</h2><p className="mt-1 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">Ticket listings are shared by students. Confirm ticket details and transfer eligibility with the original issuer before making arrangements.</p></div></div></div></section>
    </main>
  );
}
