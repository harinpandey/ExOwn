"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, TrainFront } from "lucide-react";

const IRCTC_SEARCH_URL = "https://www.irctc.co.in/nget/train-search";

export default function TrainJourneyFinderPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const routeUrl = submitted
    ? "https://www.google.com/maps/dir/?api=1&origin=" +
      encodeURIComponent(from.trim()) +
      "&destination=" +
      encodeURIComponent(to.trim()) +
      "&travelmode=transit"
    : "#";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!from.trim() || !to.trim() || !date || from.trim().toLowerCase() === to.trim().toLowerCase()) {
      return;
    }
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#F7F9F8] px-4 py-8 text-[#13221D] dark:bg-[#0E1713] dark:text-[#E8F0EB] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/travel" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A5D56] transition hover:text-[#1E5646] dark:text-[#B4C5BC]">
          <ArrowLeft size={16} /> Back to Tickets
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-2xl border border-[#E2E8E5] bg-white p-6 sm:p-8 dark:border-[#2A4136] dark:bg-[#14231C]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F2EE] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">
              <TrainFront size={14} /> Train journey planner
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">Where are you travelling?</h1>
            <p className="mt-3 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">
              Search a journey by origin, destination and date. Train availability and fares must be confirmed with the official railway booking service.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-[#4A5D56] dark:text-[#B4C5BC]">From station or city</span>
                <span className="relative block">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8077]" />
                  <input value={from} onChange={(event) => { setFrom(event.target.value); setSubmitted(false); }} required placeholder="e.g. Ludhiana Junction (LDH)" className="min-h-12 w-full rounded-xl border border-[#D7E1DC] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#1E5646] focus:ring-2 focus:ring-[#1E5646]/10 dark:border-[#2A4136] dark:bg-[#101D17]" />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-[#4A5D56] dark:text-[#B4C5BC]">To station or city</span>
                <span className="relative block">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8077]" />
                  <input value={to} onChange={(event) => { setTo(event.target.value); setSubmitted(false); }} required placeholder="e.g. New Delhi (NDLS)" className="min-h-12 w-full rounded-xl border border-[#D7E1DC] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#1E5646] focus:ring-2 focus:ring-[#1E5646]/10 dark:border-[#2A4136] dark:bg-[#101D17]" />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-[#4A5D56] dark:text-[#B4C5BC]">Journey date</span>
                <span className="relative block">
                  <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8077]" />
                  <input type="date" value={date} onChange={(event) => { setDate(event.target.value); setSubmitted(false); }} required min={new Date().toISOString().slice(0, 10)} className="min-h-12 w-full rounded-xl border border-[#D7E1DC] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#1E5646] focus:ring-2 focus:ring-[#1E5646]/10 dark:border-[#2A4136] dark:bg-[#101D17]" />
                </span>
              </label>
              <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E5646] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#174536]">
                Find journey options <ArrowRight size={16} />
              </button>
            </form>

            {submitted && (
              <div className="mt-5 rounded-xl border border-[#DCE8E2] bg-[#EAF2EF] p-4 dark:border-[#2A4136] dark:bg-[#14251D]">
                <p className="text-sm font-bold">Journey selected</p>
                <p className="mt-1 text-sm text-[#4A5D56] dark:text-[#B4C5BC]">{from.trim()} → {to.trim()}</p>
                <p className="text-xs text-[#4A5D56] dark:text-[#B4C5BC]">Date: {date}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={IRCTC_SEARCH_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1E5646] px-4 py-2 text-xs font-bold text-white hover:bg-[#174536]">
                    Check trains on IRCTC <ArrowRight size={14} />
                  </a>
                  <a href={routeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#1E5646] bg-white px-4 py-2 text-xs font-bold text-[#1E5646] hover:bg-[#E6F2EE] dark:bg-[#14231C] dark:text-[#91CDB0]">
                    Explore transit alternatives <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#E2E8E5] bg-white p-5 dark:border-[#2A4136] dark:bg-[#14231C]">
              <h2 className="text-base font-extrabold">Compare your route</h2>
              <p className="mt-2 text-sm leading-6 text-[#4A5D56] dark:text-[#B4C5BC]">
                Use the transit route link to review possible public-transport connections and approximate trip distance between your entered places.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-[#FFFBEB] p-5 dark:border-[#725A2D] dark:bg-[#2B2416]">
              <h2 className="text-sm font-extrabold text-[#92400E] dark:text-[#F2D28C]">Important</h2>
              <p className="mt-2 text-sm leading-6 text-[#78350F] dark:text-[#F2D28C]">
                ExOwn does not yet provide live train schedules, seat availability, railway-distance calculations or guaranteed alternative train suggestions. Confirm train numbers, timings, fares and availability on IRCTC. Map distances may differ from rail distance.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
