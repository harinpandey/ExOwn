import Link from "next/link";
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  Clapperboard,
  GraduationCap,
  Music,
  ShieldCheck,
  Ticket,
  TrainFront,
  Trophy,
  Sparkles,
  Users,
  MoveRight,
} from "lucide-react";

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
      <section className="relative isolate overflow-hidden border-b border-[#DCE8E5] bg-white dark:border-[#2A4136] dark:bg-[#14231C]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#EAF2EF] blur-3xl dark:bg-[#20362B]/70" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-[34%] h-36 w-36 rounded-full bg-[#F4F0E5] blur-3xl dark:bg-[#2B3023]/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F2EE] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]"><Ticket size={14}/> ExOwn Ticket</span>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.7rem] lg:leading-[1.08]">Your next ticket.<br/><span className="text-[#1E5646] dark:text-[#91CDB0]">Found through students.</span></h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4A5D56] sm:text-base dark:text-[#B4C5BC]">Choose what you’re looking for. Each ticket type opens its own search and listings experience—separate from the ExOwn Marketplace.</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#DCE8E5] bg-[#F7F9F8] px-4 py-3 text-xs font-semibold text-[#4A5D56] dark:border-[#2A4136] dark:bg-[#101D17] dark:text-[#B4C5BC]"><Ticket size={15} className="text-[#1E5646] dark:text-[#91CDB0]"/> Choose a ticket category below to begin</div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#4A5D56] dark:text-[#B4C5BC]">
                <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#1E5646] dark:text-[#91CDB0]"/> Student-to-student</span>
                <span className="inline-flex items-center gap-2"><Users size={15} className="text-[#1E5646] dark:text-[#91CDB0]"/> Connect with the ticket owner</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[510px]">
              <div className="absolute -left-4 top-10 hidden h-20 w-20 rounded-3xl border border-[#DCE8E5] bg-white/70 rotate-12 sm:block dark:border-[#2A4136] dark:bg-[#101D17]/70" />
              <div className="absolute -right-2 bottom-7 hidden h-24 w-24 rounded-full border border-[#DCE8E5] sm:block dark:border-[#2A4136]" />
              <div className="relative rounded-[28px] border border-[#DCE8E5] bg-[#F7F9F8] p-4 shadow-[0_18px_50px_rgba(19,34,29,0.08)] sm:p-6 dark:border-[#2A4136] dark:bg-[#101D17] dark:shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                <div className="flex items-center justify-between px-1 pb-4">
                  <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#71827A]">Plans changed?</p><p className="mt-1 text-sm font-bold">Pass it on, student to student.</p></div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F2EE] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]"><Sparkles size={18}/></span>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-[#DCE8E5] bg-white dark:border-[#2A4136] dark:bg-[#14231C]">
                  <div className="flex items-center justify-between border-b border-dashed border-[#DCE8E5] px-4 py-3 dark:border-[#2A4136]">
                    <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-wide text-[#1E5646] dark:text-[#91CDB0]"><Ticket size={14}/> EXOWN TICKET</span>
                    <span className="rounded-full bg-[#EAF2EF] px-2.5 py-1 text-[9px] font-bold text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">STUDENT PASS</span>
                  </div>
                  <div className="px-4 py-5 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold text-[#71827A]">A seat you can share</p><p className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">Someone else’s<br/>next great plan.</p></div>
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2EF] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]"><Ticket size={30} strokeWidth={1.6}/></div>
                    </div>
                    <div className="mt-5 flex items-center gap-2">
                      <span className="rounded-lg bg-[#F7F9F8] px-3 py-2 text-[10px] font-bold text-[#4A5D56] dark:bg-[#101D17] dark:text-[#B4C5BC]">Your plans</span>
                      <MoveRight size={17} className="text-[#91A49A]"/>
                      <span className="rounded-lg bg-[#EAF2EF] px-3 py-2 text-[10px] font-bold text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">Their opportunity</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-[#DCE8E5] px-4 py-3 dark:border-[#2A4136]"><span className="text-[10px] font-medium text-[#71827A]">Discover eligible student listings</span><span className="text-[10px] font-extrabold tracking-[0.14em] text-[#1E5646] dark:text-[#91CDB0]">PASS IT ON</span></div>
                </div>
                <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#4A5D56] dark:text-[#B4C5BC]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#1E5646] dark:text-[#91CDB0]"/> ExOwn connects students. Ticket transfer rules and eligibility are confirmed with the original issuer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 sm:pt-9">
        <div className="relative overflow-hidden rounded-2xl border border-[#D4E3DC] bg-[#EAF2EF] px-5 py-5 sm:flex sm:items-center sm:justify-between sm:px-7 sm:py-6 dark:border-[#2A4136] dark:bg-[#14251D]">
          <div aria-hidden="true" className="absolute -right-10 -top-20 h-48 w-48 rounded-full border-[24px] border-white/30 dark:border-[#91CDB0]/5"/>
          <div className="relative flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]"><Sparkles size={20}/></span>
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#1E5646] dark:text-[#91CDB0]">The student ticket exchange</p><h2 className="mt-1 text-lg font-extrabold tracking-tight sm:text-xl">A seat shouldn’t go unused.</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">Find a ticket from another student—or help someone else make the most of theirs.</p></div>
          </div>
          <div className="relative mt-4 flex shrink-0 items-center gap-2 sm:ml-6 sm:mt-0"><span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-2 text-[10px] font-bold text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]"><ShieldCheck size={13}/> Peer-to-peer</span><span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-2 text-[10px] font-bold text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">No booking fees</span></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6">
        <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E5646] dark:text-[#91CDB0]">Find your kind of ticket</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight">What are you looking for?</h2><p className="mt-2 max-w-xl text-sm text-[#4A5D56] dark:text-[#B4C5BC]">Choose a category to open its dedicated search and student listings.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ticketTypes.map((item) => {
            const Icon = item.icon;
            return <Link key={item.category} href={item.href || "/travel/category/" + item.category} className="group flex min-h-[210px] flex-col rounded-2xl border border-[#DCE8E5] bg-white p-5 shadow-[0_1px_4px_rgba(19,34,29,0.035)] transition duration-200 hover:-translate-y-1 hover:border-[#B8CEC3] hover:shadow-[0_10px_26px_rgba(19,34,29,0.08)] dark:border-[#2A4136] dark:bg-[#14231C]">
              <div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F2EE] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]"><Icon size={21}/></span><span className="rounded-full bg-[#F7F9F8] px-2.5 py-1 text-[10px] font-bold text-[#4A5D56] dark:bg-[#101D17] dark:text-[#B4C5BC]">{item.tag}</span></div>
              <h3 className="mt-5 text-lg font-bold">{item.title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">{item.description}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#1E5646] dark:text-[#91CDB0]">Explore {item.title.toLowerCase()} <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span>
            </Link>;
          })}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 sm:px-6"><div className="rounded-2xl border border-[#DCE8E5] bg-white p-5 sm:p-6 dark:border-[#2A4136] dark:bg-[#14231C]"><div className="flex items-start gap-3"><CalendarDays className="mt-0.5 text-[#1E5646] dark:text-[#91CDB0]" size={20}/><div><h2 className="font-extrabold">Check before you transfer</h2><p className="mt-1 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">Ticket listings are shared by students. Confirm ticket details, identity and transfer eligibility with the original issuer before making arrangements.</p></div></div></div></section>
    </main>
  );
}
