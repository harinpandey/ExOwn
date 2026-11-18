"use client";

import { useCompare } from "@/context/CompareContext";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CompareBar() {
  const { items, clearCompare } = useCompare();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || items.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
      >
        <div className="rounded-2xl border border-[#E2E8E5] bg-white p-4 shadow-[0_4px_16px_rgba(19,34,29,0.08)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 text-primary rounded-xl hidden sm:block">
              <BarChart2 size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">Compare Products</p>
              <p className="text-xs text-gray-500">{items.length} of 3 selected</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={clearCompare}
              className="text-xs font-semibold text-[#4A5D56] transition-colors hover:text-[#1E5646]"
            >
              Clear All
            </button>
            <Link 
              href="/compare"
              className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                items.length < 2 
                ? 'bg-[#EEF3F0] text-[#82918B] cursor-not-allowed' 
                : 'bg-[#1E5646] text-white hover:bg-[#174536]'
              }`}
              onClick={(e) => items.length < 2 && e.preventDefault()}
            >
              Compare Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
