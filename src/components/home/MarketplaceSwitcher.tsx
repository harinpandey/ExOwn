"use client";

import { ShoppingBag, Key, Wrench, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MarketplaceSwitcher() {
  const verticals = [
    {
      title: "Buy Goods",
      desc: "Laptops, phones, books & more",
      icon: ShoppingBag,
      href: "/search?listingType=SELL",
      color: "blue",
      badge: "Used"
    },
    {
      title: "Rent Items",
      desc: "Cycles, cameras, appliances",
      icon: Key,
      href: "/search?listingType=RENT",
      color: "emerald",
      badge: "Rent"
    },
    {
      title: "Book Services",
      desc: "Tutors, cleaners, developers",
      icon: Wrench,
      href: "/search?listingType=SERVICE",
      color: "orange",
      badge: "Hire"
    }
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {verticals.map((v) => {
          const Icon = v.icon;
          return (
            <Link 
              key={v.title}
              href={v.href}
              className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all"
            >
              <div className={`w-14 h-14 bg-${v.color}-100 dark:bg-${v.color}-950/30 text-${v.color}-600 dark:text-${v.color}-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon size={28} />
              </div>
              <div className="absolute top-6 right-6 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black rounded-lg uppercase tracking-wider">
                {v.badge}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-50">{v.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">{v.desc}</p>
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                Explore Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
