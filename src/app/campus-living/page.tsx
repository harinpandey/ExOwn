import Link from "next/link";
import { ArrowRight, BedDouble, Building2, CheckCircle2, MapPin, ShieldCheck, Users } from "lucide-react";

const destinations = [
  {
    title: "Find a place to stay",
    subtitle: "PGs, hostels, flats & rooms",
    description: "Browse student accommodation around your campus. Compare monthly rent, location, amenities and owner details before you reach out.",
    href: "/housing",
    action: "Explore housing",
    icon: Building2,
    tone: "blue",
    details: ["Monthly rent & deposits", "Nearby student localities", "Amenities and contact options"],
  },
  {
    title: "Find your roommate",
    subtitle: "Meet compatible campus peers",
    description: "Connect with students looking to share a room or flat. Review their budget, room preference and interests before sending a request.",
    href: "/roommates",
    action: "Find roommates",
    icon: Users,
    tone: "violet",
    details: ["Budget-based discovery", "Room and lifestyle preferences", "Private connection requests"],
  },
];

export const metadata = {
  title: "Campus Living | ExOwn",
  description: "Find student housing, PGs, hostels, flats and compatible roommates around your campus.",
};

export default function CampusLivingPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] pb-16 dark:bg-[#090c12]">
      <section className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#10141b]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <MapPin size={14} /> Campus living
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl lg:text-5xl">
              Make campus life feel like home.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
              Find a stay that fits your budget, or meet students who are looking for a roommate. Start with what you need.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-600" /> Student-focused discovery</span>
              <span className="inline-flex items-center gap-2"><BedDouble size={15} className="text-blue-600" /> Housing and shared stays</span>
              <span className="inline-flex items-center gap-2"><Users size={15} className="text-violet-600" /> Roommate connections</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:py-10">
        {destinations.map((item) => {
          const Icon = item.icon;
          const isBlue = item.tone === "blue";
          return (
            <article key={item.href} className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-[#10141b]">
              <div className={`flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/10 sm:px-7 ${isBlue ? "bg-blue-50/80 dark:bg-blue-500/[0.06]" : "bg-violet-50/80 dark:bg-violet-500/[0.06]"}`}>
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.14em] ${isBlue ? "text-blue-700 dark:text-blue-300" : "text-violet-700 dark:text-violet-300"}`}>{item.subtitle}</p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-gray-950 dark:text-white sm:text-2xl">{item.title}</h2>
                </div>
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${isBlue ? "bg-blue-600 text-white" : "bg-violet-600 text-white"}`}>
                  <Icon size={26} strokeWidth={1.8} />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-400">{item.description}</p>
                <ul className="mt-5 space-y-2.5">
                  {item.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                      <CheckCircle2 size={15} className={isBlue ? "text-blue-600" : "text-violet-600"} /> {detail}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <Link href={item.href} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition focus:outline-none focus:ring-4 ${isBlue ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/20" : "bg-violet-600 hover:bg-violet-700 focus:ring-violet-500/20"}`}>
                    {item.action} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:flex-row sm:items-center">
          <ShieldCheck size={20} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
          <p className="text-xs leading-6 text-emerald-950 dark:text-emerald-100">
            <strong>Stay informed before you decide.</strong> Confirm the property, rent, deposit and house rules directly with the owner. ExOwn keeps contact actions behind sign-in where required.
          </p>
        </div>
      </section>
    </main>
  );
}
