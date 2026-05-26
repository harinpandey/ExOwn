import { ProductSkeleton } from "@/components/ui/ProductSkeleton";

export default function RootLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Banner Skeleton */}
      <div className="relative w-full rounded-3xl skeleton-shimmer py-16 md:py-24 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center px-6">
        <div className="h-6 bg-white/20 dark:bg-white/5 rounded-full w-48 mb-6" />
        <div className="h-10 bg-white/20 dark:bg-white/5 rounded-xl w-3/4 max-w-lg mb-4 animate-pulse" />
        <div className="h-4 bg-white/20 dark:bg-white/5 rounded-lg w-1/2 max-w-sm mb-8" />
        <div className="h-12 bg-white/20 dark:bg-white/5 rounded-2xl w-full max-w-xl" />
      </div>

      {/* Shop by Category Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 skeleton-shimmer rounded-lg w-32" />
          <div className="h-4 skeleton-shimmer rounded-lg w-20" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 justify-center min-h-[90px]">
              <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
              <div className="h-2.5 skeleton-shimmer rounded w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Trending Deals Skeleton */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 skeleton-shimmer rounded-lg w-40" />
          <div className="h-4 skeleton-shimmer rounded-lg w-16" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
