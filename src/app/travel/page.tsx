import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clapperboard,
  Music,
  ShieldCheck,
  Ticket,
  Trophy,
  GraduationCap,
  TrainFront,
} from "lucide-react";

export const metadata = {
  title: "Ticket Exchange | ExOwn",
  description: "Find or list eligible unused movie, concert, sports, campus and other event tickets with fellow students.",
};

const ticketTypes = [
  {
    title: "Train tickets",
    description: "Find student ticket listings for your route, including relevant stations along a train running path.",
    category: "train-tickets",
    icon: TrainFront,
    tag: "Rail journeys",
  },
  {
    title: "Movie tickets",
    description: "Plans changed? Let another student use your cinema seats.",
    category: "movie-tickets",
    icon: Clapperboard,
    tag: "Movies",
  },
  {
    title: "Concerts & festivals",
    description: "Pass on eligible music, festival and live-show tickets.",
    category: "concert-tickets",
    icon: Music,
    tag: "Live events",
  },
  {
    title: "Cricket & sports",
    description: "Find another fan for a match or sporting event you can’t attend.",
    category: "sports-tickets",
    icon: Trophy,
    tag: "Sports",
  },
  {
    title: "College events",
    description: "Share eligible fest, club and campus-event passes.",
    category: "campus-event-tickets",
    icon: GraduationCap,
    tag: "On campus",
  },
  {
    title: "Other event tickets",
    description: "Pass on eligible theatre, comedy, exhibitions and local event tickets.",
    category: "other-event-tickets",
    icon: Ticket,
    tag: "More events",
  },
];

export default function TicketExchangePage() {
  return (
    <main className="min-h-screen bg-[#F7F9F8] pb-16 text-[#13221D] dark:bg-[#0E1713] dark:text-[#E8F0EB]">
      <section className="border-b border-[#E2E8E5] bg-white dark:border-[#2A4136] dark:bg-[#14231C]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F2EE] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">
            <Ticket size={14} /> ExOwn Ticket Exchange
          </span>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#13221D] dark:text-[#E8F0EB] sm:text-4xl lg:text-5xl">
                Plans changed?
                <span className="block text-[#1E5646] dark:text-[#91CDB0]">Pass your ticket on.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4A5D56] dark:text-[#B4C5BC] sm:text-base">
                Already bought a ticket but can’t make it? Find another student who can use it.
                ExOwn is a peer-to-peer marketplace for eligible unused tickets — not a ticket-booking platform.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/travel/search?type=events"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1E5646] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#174536]"
                >
                  Find tickets <ArrowRight size={16} />
                </Link>
                <Link
                  href="/travel/list"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#1E5646] bg-white px-5 py-3 text-sm font-bold text-[#1E5646] transition hover:bg-[#E6F2EE] dark:bg-[#14231C] dark:text-[#91CDB0] dark:hover:bg-[#20362B]"
                >
                  <Ticket size={16} /> List my ticket
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#4A5D56] dark:text-[#B4C5BC]">
                <span className="inline-flex items-center gap-1.5"><BadgeCheck size={15} className="text-[#1E5646] dark:text-[#91CDB0]" /> Student-to-student</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#1E5646] dark:text-[#91CDB0]" /> Transfer rules first</span>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-[#E2E8E5] bg-[#F7F9F8] p-5 dark:border-[#2A4136] dark:bg-[#101D17]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F2EE] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">
                <Ticket size={22} />
              </div>
              <h2 className="mt-4 text-lg font-extrabold">One ticket. A second chance.</h2>
              <p className="mt-2 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">
                Browse what students are passing on, or list a ticket only when the original issuer allows transfer or resale.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6">
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E5646] dark:text-[#91CDB0]">Browse by ticket type</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">What are you looking for?</h2>
          <p className="mt-2 text-sm text-[#4A5D56] dark:text-[#B4C5BC]">Browse tickets students have listed and connect directly with the ticket owner.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ticketTypes.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.category}
                href={item.category === "train-tickets" ? "/travel/train" : "/travel/category/" + item.category}
                className="group flex min-h-[220px] flex-col rounded-2xl border border-[#E2E8E5] bg-white p-5 shadow-[0_1px_4px_rgba(19,34,29,0.035)] transition hover:-translate-y-0.5 hover:border-[#C8D6D0] hover:shadow-[0_6px_18px_rgba(19,34,29,0.07)] dark:border-[#2A4136] dark:bg-[#14231C]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F2EE] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">
                    <Icon size={21} />
                  </span>
                  <span className="rounded-full bg-[#F7F9F8] px-2.5 py-1 text-[10px] font-bold text-[#4A5D56] dark:bg-[#101D17] dark:text-[#B4C5BC]">{item.tag}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#13221D] dark:text-[#E8F0EB]">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#1E5646] dark:text-[#91CDB0]">
                  Browse tickets <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-[#E2E8E5] bg-white p-5 sm:p-6 dark:border-[#2A4136] dark:bg-[#14231C]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={19} className="text-[#1E5646] dark:text-[#91CDB0]" />
            <h2 className="text-base font-extrabold">List only transferable tickets</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">
            Ticket rules vary by organiser and ticketing provider. Before listing, confirm that resale or transfer is allowed for that specific event. Use the issuer’s official transfer process, never share an active QR or barcode publicly, and do not list above the permitted price.
          </p>
          <div className="mt-4 rounded-xl bg-[#F7F9F8] p-4 dark:bg-[#101D17]">
            <p className="text-xs font-bold text-[#13221D] dark:text-[#E8F0EB]">A safer handover</p>
            <ol className="mt-2 space-y-1.5 text-xs leading-5 text-[#4A5D56] dark:text-[#B4C5BC]">
              <li>1. Check the event organiser’s transfer and resale rules.</li>
              <li>2. Hide QR codes, barcodes, PNRs and booking references in listing photos.</li>
              <li>3. Complete transfer through the official issuer method before marking it handed over.</li>
            </ol>
          </div>
        </div>

        <aside className="rounded-2xl border border-[#DCE8E2] bg-[#EAF2EF] p-5 sm:p-6 dark:border-[#2A4136] dark:bg-[#14251D]">
          <div className="flex items-center gap-2 text-[#1E5646] dark:text-[#91CDB0]">
            <TrainFront size={19} />
            <h2 className="text-base font-extrabold">Find tickets along your route</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">
            Search student-listed tickets by journey. If there is no direct destination match, ExOwn can surface listings for stations along the same train running path, so students can review relevant options and contact the ticket owner.
          </p>
          <p className="mt-2 text-xs leading-5 text-[#4A5D56] dark:text-[#B4C5BC]">
            ExOwn connects students and does not issue or book railway tickets. Confirm ticket details with the listing owner.
          </p>
        </aside>

      </section>

    </main>
  );
}
