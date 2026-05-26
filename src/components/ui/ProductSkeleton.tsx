"use client";

export function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full">
      <div className="relative aspect-[4/3] skeleton-shimmer" />
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <div className="h-4 skeleton-shimmer rounded-lg w-3/4" />
        <div className="h-5 skeleton-shimmer rounded-lg w-1/2" />
        <div className="mt-auto pt-3 flex justify-between items-center border-t border-gray-50 dark:border-gray-800">
          <div className="h-3 skeleton-shimmer rounded-lg w-16" />
          <div className="h-3 skeleton-shimmer rounded-lg w-10" />
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
