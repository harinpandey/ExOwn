import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Search, Ticket } from "lucide-react";

const categoryInfo: Record<string, { title: string; description: string; type: string; field: string; placeholder: string }> = {
  "taxi-tickets": { title: "Taxi & cab tickets", description: "Discover student-shared cab seats and ride listings for your route.", type: "taxi", field: "Route / pickup", placeholder: "From city, destination or pickup point" },
  "movie-tickets": { title: "Movie tickets", description: "Find cinema tickets listed by students who can no longer attend.", type: "movie", field: "Cinema / movie", placeholder: "Movie title or cinema name" },
  "concert-tickets": { title: "Concerts & festivals", description: "Browse eligible music, festival and live-show ticket listings.", type: "concert", field: "Artist / event", placeholder: "Event, artist or venue" },
  "sports-tickets": { title: "Cricket & sports", description: "Find student-listed tickets for cricket matches and sporting events.", type: "sports", field: "Match / event", placeholder: "Teams, tournament or match" },
  "campus-event-tickets": { title: "College & campus events", description: "Explore fest, club, cultural and campus-event passes.", type: "campus", field: "Campus / event", placeholder: "Campus or event name" },
  "other-event-tickets": { title: "Other event tickets", description: "Browse theatre, comedy, exhibitions and other local event tickets.", type: "other", field: "Event / venue", placeholder: "Event or venue name" },
};

export default async function TicketCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const item = categoryInfo[category] || categoryInfo["other-event-tickets"];
  const isTaxi = category === "taxi-tickets";
  return (
    <main className="min-h-screen bg-[#F7F9F8] px-4 py-8 text-[#13221D] dark:bg-[#0E1713] dark:text-[#E8F0EB]">
      <div className="mx-auto max-w-6xl">
        
        <section className="mt-2 overflow-hidden rounded-[26px] border border-[#DCE8E5] bg-white shadow-[0_6px_24px_rgba(19,34,29,0.05)] dark:border-[#2A4136] dark:bg-[#14231C]">
          <div className="bg-[#EAF2EF] px-6 py-8 sm:px-9 dark:bg-[#18372B]"><span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-[#1E5646] dark:bg-[#10251B] dark:text-[#91CDB0]"><Ticket size={14}/> ExOwn Tickets</span><h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{item.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">{item.description}</p></div>
          <div className="p-5 sm:p-8">
            <form action="/travel/search" method="GET" className="rounded-2xl border border-[#DCE8E5] bg-[#F7F9F8] p-4 sm:p-5 dark:border-[#2A4136] dark:bg-[#101D17]">
              <input type="hidden" name="type" value={item.type}/><input type="hidden" name="category" value={category}/>
              <h2 className="mb-4 text-lg font-extrabold">Find {item.title.toLowerCase()}</h2>
              <div className={isTaxi ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
                <label className="block"><span className="mb-2 block text-xs font-bold text-[#4A5D56] dark:text-[#B4C5BC]">{item.field}</span><input name="q" placeholder={item.placeholder} className="h-12 w-full rounded-xl border border-[#DCE8E5] bg-white px-3 text-sm outline-none focus:border-[#1E5646] dark:border-[#2A4136] dark:bg-[#14231C]"/></label>
                {isTaxi && <label className="block"><span className="mb-2 block text-xs font-bold text-[#4A5D56] dark:text-[#B4C5BC]">Destination</span><input name="to" placeholder="Where are you going?" className="h-12 w-full rounded-xl border border-[#DCE8E5] bg-white px-3 text-sm dark:border-[#2A4136] dark:bg-[#14231C]"/></label>}
                <label className="block"><span className="mb-2 block text-xs font-bold text-[#4A5D56] dark:text-[#B4C5BC]">{isTaxi ? "Travel date" : "Event date"}</span><span className="relative block"><CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#82918B]"/><input type="date" name="date" className="h-12 w-full rounded-xl border border-[#DCE8E5] bg-white pl-9 pr-3 text-sm dark:border-[#2A4136] dark:bg-[#14231C]"/></span></label>
                <label className="block"><span className="mb-2 block text-xs font-bold text-[#4A5D56] dark:text-[#B4C5BC]">{isTaxi ? "Pickup / city" : "Location"}</span><input name="location" placeholder={isTaxi ? "Pickup city or point" : "City or venue"} className="h-12 w-full rounded-xl border border-[#DCE8E5] bg-white px-3 text-sm dark:border-[#2A4136] dark:bg-[#14231C]"/></label>
              </div>
              <button className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E5646] px-5 text-sm font-bold text-white hover:bg-[#174536] sm:w-auto"><Search size={16}/> Search {item.title.toLowerCase()} <ArrowRight size={15}/></button>
            </form>
            <section className="mt-7 rounded-2xl border border-[#DCE8E5] bg-white p-5 dark:border-[#2A4136] dark:bg-[#14231C]">
              <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold">Student-listed {item.title.toLowerCase()}</h2><p className="mt-1 text-sm text-[#4A5D56] dark:text-[#B4C5BC]">Only {item.title.toLowerCase()} will appear in this category.</p></div><MapPin className="text-[#1E5646] dark:text-[#91CDB0]" size={22}/></div>
              <div className="mt-5 rounded-xl bg-[#F7F9F8] p-5 text-center dark:bg-[#101D17]"><p className="font-bold">Ticket listings will appear here</p><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">The dedicated Ticket listings database is not connected yet. This category is kept separate from general Marketplace products and filters.</p></div>
              
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
