"use client";

import { useCompare } from "@/context/CompareContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CompareBar() {
  const { items, clearCompare, toggleCompare } = useCompare();
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
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 transition-colors">
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
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear All
            </button>
            <Link 
              href="/compare"
              className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                items.length < 2 
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary-dark shadow-primary/20'
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
