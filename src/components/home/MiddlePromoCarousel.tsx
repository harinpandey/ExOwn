"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

const middlePromos = [
  {
    id: 1,
    tag: "CAMPUS FLASH DEALS",
    title: "Instant Campus Delivery in 30 Mins",
    subtitle: "Lab coats, calculators & hostel essentials delivered directly to your hostel block.",
    cta: "Order Essentials",
    href: "/search?category=books-sports-hobbies",
    gradient: "from-pink-600 via-purple-700 to-indigo-900",
    badgeBg: "bg-pink-500 text-white",
  },
  {
    id: 2,
    tag: "SPORTS & OUTDOOR",
    title: "Badminton Rackets & Cycles Min 50% Off",
    subtitle: "Gear up for inter-hostel tournaments with quality sports equipment.",
    cta: "Explore Gear",
    href: "/search?q=sports",
    gradient: "from-amber-600 via-red-600 to-purple-900",
    badgeBg: "bg-amber-400 text-black",
  },
  {
    id: 3,
    tag: "AUDIO & GADGETS",
    title: "Noise-Cancelling Headphones From ₹499",
    subtitle: "Focus on semester exams with premium sound gear from verified campus sellers.",
    cta: "Shop Audio",
    href: "/search?q=headphones",
    gradient: "from-blue-600 via-cyan-700 to-slate-900",
    badgeBg: "bg-cyan-400 text-black",
  },
];

const promoCards = [
  {
    title: "Puma & Nike Shoes",
    discount: "Min. 60% Off",
    tagline: "Move natural on campus",
    href: "/search?q=shoes",
    bgColor: "bg-gradient-to-t from-blue-600 to-indigo-800",
  },
  {
    title: "Hostel Water Purifiers",
    discount: "Starting ₹899",
    tagline: "Safe & pure drinking water",
    href: "/search?q=filter",
    bgColor: "bg-gradient-to-t from-emerald-600 to-teal-800",
  },
  {
    title: "Study Lamps & Tables",
    discount: "From ₹199",
    tagline: "Night study essentials",
    href: "/search?category=furniture-hostel",
    bgColor: "bg-gradient-to-t from-purple-600 to-pink-800",
  },
];

export default function MiddlePromoCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % middlePromos.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Header Title */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 text-red-500">
            <Flame size={16} />
          </span>
          <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Special Campus Offers & Ads
          </h2>
        </div>
        <span className="rounded-lg bg-white/10 px-3 py-1 text-[11px] font-black uppercase text-gray-500 dark:text-white/50">
          Sponsored Deals
        </span>
      </div>

      {/* Auto-sliding Banner Strip + Side Cards Grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* Sliding Banner */}
        <div className="relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-xl">
          {middlePromos.map((promo, idx) => (
            <div
              key={promo.id}
              className={`absolute inset-0 bg-gradient-to-r ${promo.gradient} p-6 sm:p-8 transition-opacity duration-700 ${
                idx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="relative z-20 flex h-full flex-col justify-between">
                <div>
                  <span className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${promo.badgeBg}`}>
                    {promo.tag}
                  </span>
                  <h3 className="mt-2 max-w-md text-2xl font-black italic text-white sm:text-3xl leading-tight">
                    {promo.title}
                  </h3>
                  <p className="mt-1 max-w-sm text-xs font-semibold text-white/80">
                    {promo.subtitle}
                  </p>
                </div>

                <div className="mt-4">
                  <Link
                    href={promo.href}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-gray-900 shadow-md transition hover:scale-105 active:scale-95"
                  >
                    {promo.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-3 right-4 z-30 flex items-center gap-1.5">
            {middlePromos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeSlide ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 3 Mini Deal Cards (Matching Screenshot 2 bottom deal row) */}
        <div className="grid grid-cols-3 gap-2.5">
          {promoCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group flex flex-col justify-between overflow-hidden rounded-2xl ${card.bgColor} p-3 text-white shadow-lg transition hover:-translate-y-1 active:scale-95`}
            >
              <span className="self-end rounded bg-black/40 px-1.5 py-0.5 text-[8px] font-black uppercase text-white/80">
                AD
              </span>
              <div className="mt-4">
                <span className="text-[10px] font-black uppercase text-white/80">{card.discount}</span>
                <h4 className="text-xs font-black leading-tight text-white group-hover:underline">
                  {card.title}
                </h4>
                <p className="mt-0.5 text-[9px] font-bold text-white/70 line-clamp-1">{card.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
