import { ArrowUpRight, Bus, CheckCircle2, Clock3, Plane, ShieldCheck, TrainFront } from "lucide-react";

export const metadata = {
  title: "Student Travel | ExOwn",
  description: "Find trusted starting points for train, bus and flight bookings as a student.",
};

const travelOptions = [
  {
    title: "Train journeys",
    description: "Check routes, train schedules, seat availability and official booking options.",
    action: "Open IRCTC",
    href: "https://www.irctc.co.in/nget/train-search",
    icon: TrainFront,
    tone: "blue",
    tag: "Rail",
  },
  {
    title: "Bus journeys",
    description: "Compare bus operators, boarding points, timings and seat options.",
    action: "Explore buses",
    href: "https://www.redbus.in/",
    icon: Bus,
    tone: "orange",
    tag: "Bus",
  },
  {
    title: "Flight journeys",
    description: "Compare flight options and review baggage, fare rules and timings.",
    action: "Compare flights",
    href: "https://www.google.com/travel/flights",
    icon: Plane,
    tone: "violet",
    tag: "Air",
  },
];

export default function TravelPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] pb-16 dark:bg-[#090c12]">
      <section className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#10141b]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
            <Plane size={14} /> ExOwn travel
          </span>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl lg:text-5xl">
                Your next journey, made simpler.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
                Choose how you want to travel and continue to a booking platform. Compare the full fare and travel rules before confirming.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-semibold text-gray-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300">
              <ShieldCheck size={16} className="text-emerald-600" /> External booking links
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-gray-950 dark:text-white">Choose your travel mode</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select a platform to continue your search.</p>
          </div>
          <span className="text-xs font-semibold text-gray-400">Train · Bus · Flight</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {travelOptions.map((option) => {
            const Icon = option.icon;
            const tone = option.tone === "blue"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
              : option.tone === "orange"
                ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                : "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300";
            return (
              <article key={option.title} className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-[#10141b] sm:p-6">
                <div className="flex items-center justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}><Icon size={23} /></span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:bg-white/[0.06] dark:text-gray-400">{option.tag}</span>
                </div>
                <h3 className="mt-5 text-lg font-black text-gray-950 dark:text-white">{option.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-400">{option.description}</p>
                <a href={option.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-500/20 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200">
                  {option.action} <ArrowUpRight size={16} />
                </a>
              </article>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#10141b] sm:p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <h2 className="text-base font-black text-gray-950 dark:text-white">Before you book</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Compare the total fare, including fees", "Check baggage and cancellation rules", "Confirm the boarding point and timing", "Use the operator’s official payment flow"].map((item) => (
                <p key={item} className="flex items-start gap-2 text-xs leading-6 text-gray-600 dark:text-gray-400">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /> {item}
                </p>
              ))}
            </div>
          </section>
          <aside className="rounded-2xl border border-orange-200 bg-orange-50/80 p-5 dark:border-orange-900/50 dark:bg-orange-950/20 sm:p-6">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Clock3 size={18} />
              <h2 className="text-base font-black">ExOwn booking integration</h2>
            </div>
            <p className="mt-3 text-xs leading-6 text-orange-950 dark:text-orange-100">
              Live ticket inventory, fare checks and in-app payments are not connected yet. These links open external platforms; ExOwn does not take payment or issue tickets.
            </p>
            <p className="mt-3 text-[11px] font-semibold text-orange-800/80 dark:text-orange-200/70">Your booking and passenger details stay with the platform you choose.</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
