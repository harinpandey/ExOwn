import Link from "next/link";
import {
  ArrowRight,
  BusFront,
  Clapperboard,
  GraduationCap,
  Music,
  ShieldCheck,
  Ticket,
  TrainFront,
  Trophy,
  Users,
  MapPin,
  CalendarDays,
  CircleDot,
} from "lucide-react";

export const metadata = {
  title: "Tickets | ExOwn",
  description: "Discover student-listed train, taxi, movie, event, sports and campus tickets.",
};

const ticketTypes = [
  { title: "Train tickets", description: "Search by origin, destination and journey date. Find student-listed tickets along your route.", category: "train-tickets", icon: TrainFront, tag: "Rail journeys", href: "/travel/train" },
  { title: "Taxi / Cab", description: "Find student-shared cab seats for a route, date and pickup point.", category: "taxi-tickets", icon: BusFront, tag: "Local & intercity" },
  { title: "Movie tickets", description: "Browse cinema tickets from students whose plans have changed.", category: "movie-tickets", icon: Clapperboard, tag: "Movies" },
  { title: "Cricket & sports", description: "Discover tickets for matches and other live sporting events.", category: "sports-tickets", icon: Trophy, tag: "Sports" },
  { title: "Concerts & festivals", description: "Browse eligible music, festival and live-show tickets.", category: "concert-tickets", icon: Music, tag: "Live events" },
  { title: "College events", description: "Find fest, club, cultural and campus-event passes.", category: "campus-event-tickets", icon: GraduationCap, tag: "On campus" },
  { title: "Other event tickets", description: "Explore theatre, comedy, exhibitions and local event listings.", category: "other-event-tickets", icon: Ticket, tag: "More events" },
];

export default function TicketExchangePage() {
  return (
    <main className="min-h-screen bg-[#F7F9F8] pb-14 text-[#13221D] dark:bg-[#0E1713] dark:text-[#E8F0EB]">
      <section className="border-b border-[#DCE8E5] bg-white dark:border-[#2A4136] dark:bg-[#14231C]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE8E5] bg-[#F7F9F8] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1E5646] dark:border-[#2A4136] dark:bg-[#101D17] dark:text-[#91CDB0]"><Ticket size={14}/> ExOwn Tickets</div>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-[4.25rem]">Plans change.<br/><span className="text-[#1E5646] dark:text-[#91CDB0]">Tickets move on.</span></h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#4A5D56] dark:text-[#B4C5BC]">Find tickets shared by students, or help another student use yours. Choose a category to open its own search and listings.</p>
              <div className="mt-7 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#4A5D56] dark:text-[#B4C5BC]">
                <span className="inline-flex items-center gap-2"><Users size={16} className="text-[#1E5646] dark:text-[#91CDB0]"/> Student-to-student</span>
                <span className="h-1 w-1 rounded-full bg-[#A8B9B0]"/>
                <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-[#1E5646] dark:text-[#91CDB0]"/> Verify transfer rules</span>
              </div>
            </div>

            <div className="relative min-h-[300px] overflow-hidden rounded-[26px] bg-[#1E5646] p-5 text-white sm:min-h-[350px] sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 1px 1px, #DCEFE5 1px, transparent 0)",backgroundSize:"22px 22px"}}/>
              <div aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/20"/>
              <div aria-hidden="true" className="absolute -right-8 -top-12 h-52 w-52 rounded-full border border-white/20"/>
              <div className="relative flex items-start justify-between">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C3E2D1]">The student ticket exchange</p><p className="mt-2 max-w-[260px] text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">One change of plan.<br/>A new chance for someone.</p></div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15"><Ticket size={21}/></span>
              </div>
              <div className="relative mt-8 rounded-2xl border border-white/25 bg-[#174638]/70 p-4 backdrop-blur-sm sm:p-5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-[#C3E2D1]"><span>Student connection</span><span>ExOwn / Pass it on</span></div>
                <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><CalendarDays size={18}/></span><p className="mt-2 text-sm font-bold">Your plan</p><p className="mt-1 text-[11px] text-[#C3E2D1]">Can’t make it?</p></div>
                  <div className="flex flex-col items-center gap-1 text-[#C3E2D1]"><div className="h-px w-12 bg-white/40"/><ArrowRight size={18}/><div className="h-px w-12 bg-white/40"/></div>
                  <div className="text-right"><span className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Users size={18}/></span><p className="mt-2 text-sm font-bold">Their plan</p><p className="mt-1 text-[11px] text-[#C3E2D1]">A seat found</p></div>
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-3 text-[10px] text-[#D6EADF]"><MapPin size={13}/> Connect directly with the ticket owner</div>
              </div>
              <div className="relative mt-4 flex items-center justify-between text-[10px] font-semibold text-[#C3E2D1]"><span>Discover • Connect • Confirm</span><span className="inline-flex items-center gap-1"><CircleDot size={12}/> Peer-to-peer</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="relative overflow-hidden rounded-2xl border border-[#D7E5DD] bg-[#EAF2EF] dark:border-[#2A4136] dark:bg-[#172A21]">
          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="p-5 sm:p-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1E5646] dark:text-[#91CDB0]">A little more useful. A little less waste.</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Someone else could use that ticket.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">Browse student listings for journeys, shows, matches and campus events. ExOwn helps you find the person—confirm ticket validity and transfer eligibility with them and the issuer.</p>
            </div>
            <div className="relative hidden h-full min-h-[150px] w-64 items-center justify-center overflow-hidden border-l border-[#D7E5DD] lg:flex dark:border-[#2A4136]">
              <div className="absolute h-36 w-36 rounded-full border-[18px] border-white/60 dark:border-[#91CDB0]/10"/>
              <div className="absolute h-24 w-24 rounded-full border border-[#1E5646]/25 dark:border-[#91CDB0]/20"/>
              <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#1E5646] shadow-sm dark:bg-[#20362B] dark:text-[#91CDB0]"><Ticket size={30}/></span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-11">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E5646] dark:text-[#91CDB0]">Browse by type</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">What are you looking for?</h2></div>
          <p className="max-w-md text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">Each category has its own dedicated experience.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ticketTypes.map((item) => {
            const Icon = item.icon;
            return <Link key={item.category} href={item.href || "/travel/category/" + item.category} className="group flex min-h-[205px] flex-col rounded-2xl border border-[#DCE8E5] bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-[#B8CEC3] hover:shadow-[0_12px_30px_rgba(19,34,29,0.07)] dark:border-[#2A4136] dark:bg-[#14231C] dark:hover:border-[#476C58]">
              <div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F2EE] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]"><Icon size={21}/></span><span className="rounded-full bg-[#F7F9F8] px-2.5 py-1 text-[10px] font-bold text-[#4A5D56] dark:bg-[#101D17] dark:text-[#B4C5BC]">{item.tag}</span></div>
              <h3 className="mt-5 text-lg font-bold">{item.title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">{item.description}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#1E5646] dark:text-[#91CDB0]">Browse {item.title.toLowerCase()} <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span>
            </Link>;
          })}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 sm:px-6"><div className="rounded-2xl border border-[#DCE8E5] bg-white p-5 sm:p-6 dark:border-[#2A4136] dark:bg-[#14231C]"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-[#1E5646] dark:text-[#91CDB0]" size={20}/><div><h2 className="font-extrabold">Keep every transfer safe</h2><p className="mt-1 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">Confirm ticket details, seller identity and transfer eligibility with the original issuer before making arrangements. Never share active QR codes or booking references publicly.</p></div></div></div></section>
    </main>
  );
}
