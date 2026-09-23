"use client";

export function ProductSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#10141b] shadow-lg">
      <div className="relative aspect-[4/3] skeleton-shimmer" />
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="h-4 skeleton-shimmer rounded-lg w-3/4" />
        <div className="h-5 skeleton-shimmer rounded-lg w-1/2" />
        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
          <div className="h-3 skeleton-shimmer rounded-lg w-16" />
          <div className="h-3 skeleton-shimmer rounded-lg w-10" />
        </div>
      </div>
    </div>
  );
}

export function SectionSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
