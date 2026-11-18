import Link from "next/link";
import { ArrowRight, BedDouble, Building2, MapPin, ShieldCheck, Users } from "lucide-react";

const destinations = [
  {
    title: "PGs, Hostels & Flats",
    eyebrow: "Find a place to stay",
    description: "Explore student PGs, hostels, private rooms, shared accommodation and flats around your campus.",
    href: "/housing",
    action: "Explore housing",
    icon: Building2,
    tone: "from-blue-600 to-indigo-700",
  },
  {
    title: "Find a Roommate",
    eyebrow: "Find the right people",
    description: "Discover students looking for a flatmate or shared room. Compare budgets, preferences and interests before connecting.",
    href: "/roommates",
    action: "Find roommates",
    icon: Users,
    tone: "from-violet-600 to-purple-700",
  },
];

export const metadata = {
  title: "Campus Living | ExOwn",
  description: "Find student housing, PGs, hostels, flats and roommates around your campus.",
};

export default function CampusLivingPage() {
  return (
    <main className="min-h-screen bg-gray-50/70 pb-16 dark:bg-[#090c12]">
      <section className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#10141b]">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <MapPin size={14} /> Campus living
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">
            Housing & Roommates, together.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">
            Find a place near campus or connect with students who are looking for someone to share one. Choose the path that works for you.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] font-bold text-gray-500 dark:text-white/50">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Student-focused discovery</span>
            <span className="inline-flex items-center gap-1.5"><BedDouble size={14} className="text-primary" /> PG, hostel and flat options</span>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-5 px-4 py-9 md:grid-cols-2">
        {destinations.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.href} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#10141b]">
              <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${item.tone} text-white`}>
                <Icon size={58} strokeWidth={1.35} />
              </div>
              <div className="p-6 sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.17em] text-primary">{item.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">{item.title}</h2>
                <p className="mt-3 min-h-12 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{item.description}</p>
                <Link href={item.href} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-white transition hover:bg-primary-dark">
                  {item.action} <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
