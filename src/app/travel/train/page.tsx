import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Search, TrainFront } from "lucide-react";

const inputClass = "h-14 w-full rounded-xl border border-[#DCE8E2] bg-[#F7F9F8] px-4 text-sm text-[#13221D] outline-none transition focus:border-[#1E5646] focus:ring-2 focus:ring-[#1E5646]/10 dark:border-[#2A4136] dark:bg-[#101D17] dark:text-[#E8F0EB]";

export default function TrainTicketSearchPage() {
  return (
    <main className="min-h-screen bg-[#F7F9F8] text-[#13221D] dark:bg-[#0E1713] dark:text-[#E8F0EB]">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-6">
        <Link href="/travel" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A5D56] hover:text-[#1E5646] dark:text-[#B4C5BC]"><ArrowLeft size={16}/> All ticket categories</Link>
        <section className="mt-5 overflow-hidden rounded-[28px] border border-[#DCE8E2] bg-white shadow-[0_8px_28px_rgba(19,34,29,0.07)] dark:border-[#2A4136] dark:bg-[#14231C]">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#EAF2EF] via-[#F5FAF8] to-[#DCEBE5] px-6 py-8 sm:px-10 sm:py-10 dark:from-[#18372B] dark:via-[#14231C] dark:to-[#203D30]">
            <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-[28px] border-white/30"/>
            <div className="relative max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-bold text-[#1E5646] dark:bg-[#10251B] dark:text-[#91CDB0]"><TrainFront size={15}/> ExOwn Train Tickets</span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Find a ticket for your journey.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4A5D56] sm:text-base dark:text-[#B4C5BC]">Search student-listed tickets by route and travel date. If there’s no direct match, discover relevant station options along the train’s running path.</p>
            </div>
          </div>
          <div className="p-4 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#E6F2EE] px-5 py-2.5 text-sm font-bold text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">● One Way</span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A5D56] dark:text-[#B4C5BC]"><MapPin size={14}/> Student-to-student listings</span>
            </div>
            <form action="/travel/search" method="GET">
              <input type="hidden" name="type" value="train"/>
              <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr]">
                <label className="block"><span className="mb-2 block text-xs font-bold tracking-wide text-[#4A5D56] dark:text-[#B4C5BC]">FROM</span><span className="relative block"><MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#82918B]"/><input name="from" required placeholder="City or railway station" className={inputClass+" pl-11"} autoComplete="off"/></span></label>
                <label className="block"><span className="mb-2 block text-xs font-bold tracking-wide text-[#4A5D56] dark:text-[#B4C5BC]">TO</span><span className="relative block"><MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#82918B]"/><input name="to" required placeholder="Destination station" className={inputClass+" pl-11"} autoComplete="off"/></span></label>
                <label className="block"><span className="mb-2 block text-xs font-bold tracking-wide text-[#4A5D56] dark:text-[#B4C5BC]">JOURNEY DATE</span><span className="relative block"><CalendarDays size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#82918B]"/><input type="date" name="date" required className={inputClass+" pl-11"}/></span></label>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><button className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1E5646] px-6 text-base font-extrabold text-white transition hover:bg-[#174536]"><Search size={18}/> Find student tickets <ArrowRight size={17}/></button><p className="max-w-md text-xs leading-5 text-[#71827A]">ExOwn doesn’t book or issue railway tickets. Review the listing and contact the student who posted it.</p></div>
            </form>
          </div>
        </section>
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#DCE8E2] bg-white p-5 dark:border-[#2A4136] dark:bg-[#14231C]"><p className="text-sm font-extrabold">Direct destination match</p><p className="mt-2 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">Find student listings whose journey covers your destination.</p></div>
          <div className="rounded-2xl border border-[#DCE8E2] bg-white p-5 dark:border-[#2A4136] dark:bg-[#14231C]"><p className="text-sm font-extrabold">Along the train route</p><p className="mt-2 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">Discover possible intermediate-station listings on the same running path.</p></div>
          <div className="rounded-2xl border border-[#DCE8E2] bg-white p-5 dark:border-[#2A4136] dark:bg-[#14231C]"><p className="text-sm font-extrabold">Contact the ticket owner</p><p className="mt-2 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">Check details and any transfer eligibility directly with the student.</p></div>
        </section>
      </div>
    </main>
  );
}
