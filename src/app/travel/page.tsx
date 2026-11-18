import Link from "next/link";
import { ArrowLeft, Plane, Ticket, TrainFront, Bus, Database } from "lucide-react";

export const metadata = {
  title: "Travel & Tickets | ExOwn",
  description: "Travel planning and ticket discovery for students.",
};

export default function TravelPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary">
        <ArrowLeft size={15} /> Back to ExOwn
      </Link>
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-orange-50 via-white to-amber-100 p-7 dark:border-white/10 dark:from-[#25180c] dark:via-[#10141b] dark:to-[#20170d] sm:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg">
          <Plane size={28} />
        </div>
        <p className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">A separate ExOwn experience</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">Travel & Tickets</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          A dedicated student travel space for discovering journeys and ticket options. It will use a separate travel inventory and booking database, not the ExOwn marketplace listings database.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Train tickets", icon: TrainFront },
            { label: "Bus tickets", icon: Bus },
            { label: "Flights & trips", icon: Ticket },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-orange-200/80 bg-white/80 p-4 text-sm font-bold text-gray-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
                <Icon size={20} className="text-orange-600 dark:text-orange-300" />
                {item.label}
              </div>
            );
          })}
        </div>
        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-100/70 p-4 text-xs leading-relaxed text-orange-950 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-100">
          <Database size={17} className="mt-0.5 shrink-0" />
          <span><strong>Planned as an independent module.</strong> Live ticket availability, prices and booking are not connected yet. No sample tickets or fake availability are shown.</span>
        </div>
      </section>
    </main>
  );
}
