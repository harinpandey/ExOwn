export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl space-y-8">
      {/* Breadcrumbs Skeleton */}
      <div className="flex gap-2 items-center mb-8">
        <div className="h-4 skeleton-shimmer rounded w-16" />
        <div className="h-3 w-3 skeleton-shimmer rounded-sm" />
        <div className="h-4 skeleton-shimmer rounded w-24" />
        <div className="h-3 w-3 skeleton-shimmer rounded-sm" />
        <div className="h-4 skeleton-shimmer rounded w-32" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Left Column: Image & Details */}
        <div className="flex-1 space-y-12">
          {/* Gallery Skeleton */}
          <div className="aspect-[4/3] rounded-3xl skeleton-shimmer w-full" />
          
          {/* Description Skeleton */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 md:p-12 space-y-4">
            <div className="h-6 skeleton-shimmer rounded w-32" />
            <div className="space-y-2.5">
              <div className="h-4 skeleton-shimmer rounded w-full" />
              <div className="h-4 skeleton-shimmer rounded w-full" />
              <div className="h-4 skeleton-shimmer rounded w-5/6" />
            </div>
          </div>
        </div>

        {/* Right Column: Cards */}
        <div className="w-full lg:w-[450px] space-y-8">
          {/* Pricing Card Skeleton */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
            <div className="h-8 skeleton-shimmer rounded w-1/3" />
            <div className="h-5 skeleton-shimmer rounded w-2/3" />
            <div className="h-12 skeleton-shimmer rounded-xl w-full" />
          </div>

          {/* Seller Card Skeleton */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full skeleton-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton-shimmer rounded w-1/2" />
              <div className="h-3 skeleton-shimmer rounded w-1/3" />
            </div>
          </div>

          {/* AI Assistant Skeleton */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-3">
            <div className="h-5 skeleton-shimmer rounded w-1/2" />
            <div className="h-10 skeleton-shimmer rounded-xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
