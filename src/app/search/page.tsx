import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { searchProducts, getCategories } from "@/actions/product";
import SortSelect from "@/components/ui/SortSelect";
import Link from "next/link";
import SearchSidebar from "@/components/search/SearchSidebar";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; condition?: string; sort?: string; minPrice?: string; maxPrice?: string; listingType?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "";
  const condition = params.condition || "";
  const sort = params.sort || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const listingType = params.listingType as any;
  const page = Math.max(1, params.page ? parseInt(params.page, 10) : 1);
  const pageSize = 24;

  const [results, categories] = await Promise.all([
    searchProducts({ query, categorySlug, condition, listingType, minPrice, maxPrice, sortBy: sort, page, pageSize }),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Filters */}
        <SearchSidebar 
          categories={categories}
          initialCategory={categorySlug}
          initialCondition={condition}
          initialMinPrice={params.minPrice || ""}
          initialMaxPrice={params.maxPrice || ""}
          initialListingType={params.listingType || ""}
          query={query}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <form method="GET" action="/search" className="relative mb-6">
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {condition && <input type="hidden" name="condition" value={condition} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search for items, brands, or categories..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm text-lg"
            />
            <SearchIcon className="absolute left-4 top-4 text-gray-400" size={24} />
          </form>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold text-gray-900 dark:text-white">{results.length}</span> results
              {query && <span> for "<span className="font-bold text-gray-900 dark:text-white">{query}</span>"</span>}
            </div>

            <form method="GET" action="/search">
              {query && <input type="hidden" name="q" value={query} />}
              {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
              {condition && <input type="hidden" name="condition" value={condition} />}
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-gray-500" />
                <SortSelect defaultValue={sort} />
              </div>
            </form>
          </div>

          {/* Results Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.images?.[0] || ""}
                  location={product.pickupLocation}
                  createdAt={product.createdAt}
                  isUrgent={product.isUrgent}
                  listingType={product.listingType as any}
                  condition={product.condition}
                  isVerified={product.seller?.isVerified || false}
                  categoryId={product.categoryId}
                  subcategoryId={product.subcategoryId || ""}
                  sellerId={product.sellerId}
                  seller={product.seller as any}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No results found"
              description={query ? `We couldn't find any items matching "${query}". Try refining your search query or filters.` : "No items are currently available matching these filters."}
              actionLabel="Clear Search"
              actionHref="/search"
            />
          )}

          {results.length > 0 && (
            <div className="flex items-center justify-between mt-10">
              <Link
                href={{
                  pathname: "/search",
                  query: { ...params, page: Math.max(1, page - 1).toString() },
                }}
                aria-disabled={page <= 1}
                className={`px-5 py-3 rounded-xl font-bold text-sm border ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                Previous
              </Link>
              <span className="text-sm font-bold text-gray-500">Page {page}</span>
              <Link
                href={{
                  pathname: "/search",
                  query: { ...params, page: (page + 1).toString() },
                }}
                aria-disabled={results.length < pageSize}
                className={`px-5 py-3 rounded-xl font-bold text-sm border ${results.length < pageSize ? "pointer-events-none opacity-40" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                Next
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
