import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { searchProducts, getCategories } from "@/actions/product";
import SortSelect from "@/components/ui/SortSelect";
import Link from "next/link";
import SearchSidebar from "@/components/search/SearchSidebar";
import EmptyState from "@/components/ui/EmptyState";
import { DEMO_TRENDING, DEMO_RECENT, DEMO_RENTALS, DEMO_VERIFIED, DemoProduct } from "@/lib/demoData";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    condition?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    listingType?: string;
    campus?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "";
  const condition = params.condition || "";
  const sort = params.sort || "";
  const campus = params.campus || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const listingType = params.listingType as any;
  const page = Math.max(1, params.page ? parseInt(params.page, 10) : 1);
  const pageSize = 24;

  const activeFilters = [
    campus && `Campus: ${campus}`,
    categorySlug && `Category: ${categorySlug}`,
    condition && `Condition: ${condition.replace("_", " ")}`,
    listingType && `Type: ${listingType}`,
    params.minPrice && `Min: ₹${params.minPrice}`,
    params.maxPrice && `Max: ₹${params.maxPrice}`,
  ].filter(Boolean);

  const [dbResults, categories] = await Promise.all([
    searchProducts({ query, categorySlug, condition, listingType, minPrice, maxPrice, sortBy: sort, page, pageSize }),
    getCategories(),
  ]);

  let results: any[] = dbResults;

  // If DB results are empty, search through Demo Dataset
  if (results.length === 0) {
    const allDemo: DemoProduct[] = [...DEMO_TRENDING, ...DEMO_RECENT, ...DEMO_RENTALS, ...DEMO_VERIFIED];
    results = allDemo.filter((item) => {
      if (query && !item.title.toLowerCase().includes(query.toLowerCase()) && !item.description.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      if (categorySlug && item.category.slug !== categorySlug && item.categoryId !== categorySlug) {
        return false;
      }
      if (listingType && item.listingType !== listingType) {
        return false;
      }
      if (condition && item.condition !== condition) {
        return false;
      }
      if (minPrice !== undefined && item.price < minPrice) {
        return false;
      }
      if (maxPrice !== undefined && item.price > maxPrice) {
        return false;
      }
      return true;
    });

    // If still 0 matching, fallback to showing all demo items so the page is never bare
    if (results.length === 0 && !query && !categorySlug && !listingType) {
      results = allDemo;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900 transition-colors dark:text-white">
      <div className="flex flex-col gap-8 md:flex-row">

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
          <form method="GET" action="/search" className="relative mb-4">
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {condition && <input type="hidden" name="condition" value={condition} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
            {campus && <input type="hidden" name="campus" value={campus} />}
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search laptops, books, cycles, rooms..."
              className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-lg font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/35 dark:focus:border-primary/60"
            />
            <SearchIcon className="absolute left-4 top-4 text-gray-400 dark:text-white/42" size={24} />
          </form>

          {activeFilters.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <span key={filter} className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/62">
                  {filter}
                </span>
              ))}
              <Link href={query ? `/search?q=${query}` : "/search"} className="rounded-lg px-3 py-1.5 text-xs font-black text-primary hover:bg-primary/10">
                Clear all filters
              </Link>
            </div>
          )}

          {/* Results Header */}
          <div className="mb-6 flex flex-col justify-between items-start sm:flex-row sm:items-center gap-4">
            <div className="text-sm font-semibold text-gray-600 dark:text-white/52">
              Showing <span className="font-black text-gray-900 dark:text-white">{results.length}</span> results
              {query && <span> for &ldquo;<span className="font-black text-gray-900 dark:text-white">{query}</span>&rdquo;</span>}
            </div>

            <form method="GET" action="/search">
              {query && <input type="hidden" name="q" value={query} />}
              {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
              {condition && <input type="hidden" name="condition" value={condition} />}
              {campus && <input type="hidden" name="campus" value={campus} />}
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-gray-400 dark:text-white/45" />
                <SortSelect defaultValue={sort} />
              </div>
            </form>
          </div>

          {/* Results Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
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
              title="No matching listings found"
              description={query ? `We couldn't find any items matching "${query}". Try clearing filters, changing category, or expanding your price range.` : "No items are currently available for these filters."}
              actionLabel="Clear filters"
              actionHref="/search"
              secondaryActionLabel="Create listing"
              secondaryActionHref="/sell"
            />
          )}

          {results.length > 0 && (
            <div className="mt-10 flex items-center justify-between">
              <Link
                href={{
                  pathname: "/search",
                  query: { ...params, page: Math.max(1, page - 1).toString() },
                }}
                aria-disabled={page <= 1}
                className={`rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 dark:border-white/10 dark:text-white ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-100 dark:hover:bg-white/[0.06]"}`}
              >
                &larr; Previous
              </Link>
              <span className="text-sm font-bold text-gray-500 dark:text-white/45">Page {page}</span>
              <Link
                href={{
                  pathname: "/search",
                  query: { ...params, page: (page + 1).toString() },
                }}
                aria-disabled={results.length < pageSize}
                className={`rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 dark:border-white/10 dark:text-white ${results.length < pageSize ? "pointer-events-none opacity-40" : "hover:bg-gray-100 dark:hover:bg-white/[0.06]"}`}
              >
                Next &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
