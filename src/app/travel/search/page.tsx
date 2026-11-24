import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, Search, Ticket, TrainFront } from "lucide-react";

const titles: Record<string, string> = {
  train: "Train tickets",
  taxi: "Taxi & cab tickets",
  movie: "Movie tickets",
  sports: "Cricket & sports tickets",
  concert: "Concert & festival tickets",
  campus: "College event tickets",
  other: "Other event tickets",
};

export default async function TicketSearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; category?: string; from?: string; to?: string; date?: string; location?: string }> }) {
  const p = await searchParams;
  const type = p.type || "all";
  const title = titles[type] || "Student tickets";
  const isTrain = type === "train";
  const hasQuery = !!(p.q || p.from || p.to || p.date || p.location);
  return (
    <main className="min-h-screen bg-[#F7F9F8] px-4 py-8 text-[#13221D] dark:bg-[#0E1713] dark:text-[#E8F0EB]">
      <div className="mx-auto max-w-6xl">
        <Link href={p.category ? "/travel/category/" + p.category : "/travel"} className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A5D56] hover:text-[#1E5646] dark:text-[#B4C5BC]"><ArrowLeft size={15}/> Back to {p.category ? "category" : "tickets"}</Link>
        <section className="mt-6 overflow-hidden rounded-[26px] border border-[#DCE8E5] bg-white dark:border-[#2A4136] dark:bg-[#14231C]">
          <div className="bg-[#EAF2EF] px-6 py-7 sm:px-8 dark:bg-[#18372B]"><span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-[#1E5646] dark:bg-[#10251B] dark:text-[#91CDB0]">{isTrain ? <TrainFront size={14}/> : <Ticket size={14}/>} Ticket-only search</span><h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{isTrain ? "Student train ticket matches" : title}</h1><p className="mt-2 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">Results are limited to this ticket type. No general Marketplace product, Rent, Exchange or Services filters are used here.</p></div>
          <div className="p-5 sm:p-8">
            {isTrain && <div className="mb-5 rounded-2xl border border-[#DCE8E5] bg-[#F7F9F8] p-4 dark:border-[#2A4136] dark:bg-[#101D17]"><p className="text-xs font-bold uppercase tracking-wide text-[#4A5D56] dark:text-[#B4C5BC]">Your journey</p><div className="mt-2 flex flex-wrap items-center gap-2 text-lg font-extrabold"><span>{p.from || "Origin"}</span><ArrowRight size={17} className="text-[#1E5646]"/><span>{p.to || "Destination"}</span></div>{p.date && <p className="mt-1 text-sm text-[#4A5D56] dark:text-[#B4C5BC]">Journey date: {p.date}</p>}</div>}
            {hasQuery && !isTrain && <div className="mb-5 rounded-xl bg-[#F7F9F8] p-4 text-sm dark:bg-[#101D17]"><p className="font-bold">Search details</p><p className="mt-1 text-[#4A5D56] dark:text-[#B4C5BC]">{[p.q, p.location, p.to, p.date].filter(Boolean).join(" · ")}</p></div>}
            <div className="rounded-2xl border border-[#DCE8E5] bg-white p-6 text-center dark:border-[#2A4136] dark:bg-[#14231C]">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F2EE] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]"><Search size={22}/></span>
              <h2 className="mt-4 text-xl font-extrabold">No live student listings yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">The separate Ticket database and listing search are still being connected. This page is ready to show only {title.toLowerCase()} when ticket records become available.</p>
              {isTrain && <div className="mx-auto mt-5 max-w-2xl rounded-xl bg-[#EAF2EF] p-4 text-left dark:bg-[#18372B]"><p className="font-bold text-[#1E5646] dark:text-[#91CDB0]">Route alternatives (planned)</p><p className="mt-1 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">Once train running-path data is connected, ExOwn can rank direct destination listings first and then show relevant intermediate-station listings along the same train route.</p></div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3"><Link href={isTrain ? "/travel/train" : p.category ? "/travel/category/" + p.category : "/travel"} className="inline-flex items-center gap-2 rounded-xl border border-[#1E5646] px-4 py-2.5 text-sm font-bold text-[#1E5646] dark:text-[#91CDB0]">{isTrain ? "Change journey" : "Change search"} <ArrowRight size={15}/></Link><Link href="/travel/list" className="inline-flex items-center gap-2 rounded-xl bg-[#1E5646] px-4 py-2.5 text-sm font-bold text-white">List a ticket <Ticket size={15}/></Link></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
