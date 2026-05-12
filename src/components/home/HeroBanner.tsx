"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNERS = [
  {
    title: "Sell Your Old Books",
    subtitle: "Turn your old textbooks into cash. Fastest way to clear your room.",
    cta: "Start Selling",
    href: "/sell",
    bg: "from-blue-600 to-emerald-600",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1000&auto=format&fit=crop"
  },
  {
    title: "Rent Bikes On Campus",
    subtitle: "Need a ride to the library? Rent cycles from fellow students.",
    cta: "Browse Cycles",
    href: "/search?category=cycles",
    bg: "from-green-600 to-emerald-700",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    title: "Buy Hostel Essentials",
    subtitle: "Bed sheets, study tables, and more at student prices.",
    cta: "View Essentials",
    href: "/search?category=hostel",
    bg: "from-purple-600 to-violet-700",
    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=1000&auto=format&fit=crop"
  }
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % BANNERS.length);
  const prev = () => setCurrent((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  return (
    <div className="relative w-full h-[220px] md:h-[280px] overflow-hidden rounded-2xl md:rounded-3xl shadow-xl group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className={`absolute inset-0 bg-gradient-to-br ${BANNERS[current].bg} flex items-center`}
        >
          <div className="absolute inset-0 opacity-20">
            <img 
              src={BANNERS[current].image} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 px-10 md:px-20 max-w-2xl text-white">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-4xl font-black mb-2 leading-tight"
            >
              {BANNERS[current].title}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm md:text-lg text-white/80 mb-6 font-medium max-w-md"
            >
              {BANNERS[current].subtitle}
            </motion.p>
            <motion.a
              href={BANNERS[current].href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-block px-8 py-2.5 bg-white text-gray-900 rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-lg"
            >
              {BANNERS[current].cta}
            </motion.a>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              current === i ? "bg-white w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
