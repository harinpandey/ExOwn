"use client";

import { motion } from "framer-motion";

export function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full animate-pulse">
      <div className="relative aspect-[4/5] bg-gray-200 dark:bg-gray-800" />
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4" />
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2" />
        <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-50 dark:border-gray-800">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-20" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}

export function SectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
