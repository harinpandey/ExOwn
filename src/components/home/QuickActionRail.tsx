import Link from "next/link";
import { ArrowRight, ShoppingBag, Plus, RefreshCw, Building2, HelpCircle } from "lucide-react";

const marketplaceActions = [
  {
    label: "Buy Items",
    subtext: "Used tech & essentials",
    href: "/search?listingType=SELL",
    icon: ShoppingBag,
    tone: "from-blue-600 to-indigo-600 text-white",
  },
  {
    label: "Sell Stuff",
    subtext: "List in 60 seconds",
    href: "/sell",
    icon: Plus,
    tone: "from-orange-500 to-amber-600 text-white",
  },
  {
    label: "Rentals",
    subtext: "Cycles, coolers & fridges",
    href: "/search?listingType=RENT",
    icon: RefreshCw,
    tone: "from-emerald-600 to-teal-600 text-white",
  },
  {
    label: "Campus Housing",
    subtext: "PGs & student rooms",
    href: "/search?category=properties",
    icon: Building2,
    tone: "from-purple-600 to-pink-600 text-white",
  },
  {
    label: "Post a Want",
    subtext: "Ask peers for items",
    href: "/requests",
    icon: HelpCircle,
    tone: "from-cyan-600 to-blue-700 text-white",
  },
];

export default function QuickActionRail() {
  return (
    <section className="container mx-auto px-4 py-2" aria-label="Marketplace Actions">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {marketplaceActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs transition hover:border-primary/50 hover:bg-gray-50/80 hover:shadow-md dark:border-white/10 dark:bg-[#10141b] dark:hover:border-primary/50 dark:hover:bg-white/[0.04] active:scale-95"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-xs transition-transform group-hover:scale-105 ${action.tone}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black tracking-tight text-gray-900 group-hover:text-primary dark:text-white dark:group-hover:text-primary truncate">
                  {action.label}
                </p>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate">
                  {action.subtext}
                </p>
              </div>
              <ArrowRight size={13} className="shrink-0 text-gray-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
