function getModeUrl(
  currentParams: Record<string, string | undefined>,
  overrides: { listingType?: string; exchange?: string }
): string {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(currentParams)) {
    if (value && key !== "listingType" && key !== "exchange" && key !== "page") {
      p.set(key, value);
    }
  }
  if (overrides.listingType) {
    p.set("listingType", overrides.listingType);
  }
  if (overrides.exchange) {
    p.set("exchange", overrides.exchange);
  }
  const queryStr = p.toString();
  return queryStr ? `/search?${queryStr}` : "/search";
}

import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { searchProducts, getCategories } from "@/actions/product";
import { resolveCampus } from "@/actions/location";
import { parseSearchIntent } from "@/lib/search-intent";
import SortSelect from "@/components/ui/SortSelect";
import Link from "next/link";
import SearchSidebar from "@/components/search/SearchSidebar";
import EmptyState from "@/components/ui/EmptyState";
import SearchMomentsTrigger from "@/components/search/SearchMomentsTrigger";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    subcategory?: string;
    condition?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    listingType?: string;
    campus?: string;
    exchange?: string;
    movingOut?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const rawQuery = params.q || "";
  const categorySlug = params.category || "";
  const subcategorySlug = params.subcategory || "";
  const sort = params.sort || "";
  const rawCampus = params.campus || "";
  const page = Math.max(1, params.page ? parseInt(params.page, 10) : 1);
  const pageSize = 24;

  // Deterministic search intent extraction
  const intent = parseSearchIntent(rawQuery);
  const effectiveQuery = intent.textQuery || rawQuery;
  const searchTokens = intent.tokens;

  // Explicit URL parameters remain strictly authoritative over parsed intent
  const condition = params.condition || intent.condition || "";
  const listingType = (params.listingType || intent.listingType || "") as any;
  const isExchange = params.exchange !== undefined ? params.exchange === "true" : (intent.exchange ?? false);
  const isMovingOut = params.movingOut === "true";
  const minPrice = params.minPrice
    ? parseFloat(params.minPrice)
    : intent.minPrice !== undefined
    ? intent.minPrice
    : undefined;
  const maxPrice = params.maxPrice
    ? parseFloat(params.maxPrice)
    : intent.maxPrice !== undefined
    ? intent.maxPrice
    : undefined;

  // Resolve campus safely against DB (accepts exact ID, slug, or campus name)
  const resolvedCampusObj = rawCampus ? await resolveCampus(rawCampus) : null;
  // If rawCampus is specified but does not resolve to any DB campus, pass non-matching sentinel so no cross-campus leak occurs
  const effectiveCampusId = rawCampus ? (resolvedCampusObj?.id || "invalid_campus_filter") : undefined;
  const campusLabel = resolvedCampusObj?.name || rawCampus;

  const activeFilters = [
    rawCampus && { label: `Campus: ${campusLabel}`, param: "campus" },
    categorySlug && { label: `Category: ${categorySlug}`, param: "category" },
    subcategorySlug && { label: `Subcategory: ${subcategorySlug}`, param: "subcategory" },
    condition && { label: `Condition: ${condition.replace("_", " ")}`, param: "condition" },
    listingType && { label: `Type: ${listingType}`, param: "listingType" },
    isExchange && { label: "Exchange Only", param: "exchange" },
    isMovingOut && { label: "Moving Out Deals", param: "movingOut" },
    minPrice !== undefined && { label: `Min: ₹${minPrice.toLocaleString("en-IN")}`, param: "minPrice" },
    maxPrice !== undefined && { label: `Max: ₹${maxPrice.toLocaleString("en-IN")}`, param: "maxPrice" },
  ].filter(Boolean) as { label: string; param: string }[];

  let results: any[] = [];
  let categories: any[] = [];
  try {
    [results, categories] = await Promise.all([
      searchProducts({
        query: effectiveQuery,
        tokens: searchTokens,
        categorySlug,
        subcategorySlug,
        condition,
        listingType,
        minPrice,
        maxPrice,
        sortBy: sort,
        campusId: effectiveCampusId,
        exchange: isExchange,
        movingOut: isMovingOut,
        page,
        pageSize,
      }),
      getCategories(),
    ]);
  } catch (err) {
    console.error("[SearchPage] DB fetch failed:", err);
  }

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900 transition-colors dark:text-white">
      <SearchMomentsTrigger query={effectiveQuery} category={categorySlug} listingType={listingType} />
      <div className="flex flex-col gap-8 md:flex-row">

        {/* Sidebar Filters */}
        <SearchSidebar 
          categories={categories}
          initialCategory={categorySlug}
          initialCondition={condition}
          initialMinPrice={params.minPrice || ""}
          initialMaxPrice={params.maxPrice || ""}
          initialListingType={params.listingType || ""}
          initialExchange={isExchange}
          initialMovingOut={isMovingOut}
          query={rawQuery}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <form method="GET" action="/search" className="relative mb-2">
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {condition && <input type="hidden" name="condition" value={condition} />}
            {listingType && <input type="hidden" name="listingType" value={listingType} />}
            {isExchange && <input type="hidden" name="exchange" value="true" />}
            {isMovingOut && <input type="hidden" name="movingOut" value="true" />}
            {params.minPrice && <input type="hidden" name="minPrice" value={params.minPrice} />}
            {params.maxPrice && <input type="hidden" name="maxPrice" value={params.maxPrice} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
            {rawCampus && <input type="hidden" name="campus" value={rawCampus} />}
            <input
              type="text"
              name="q"
              defaultValue={rawQuery}
              placeholder="Search laptops, books, cycles, rooms..."
              className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-lg font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/35 dark:focus:border-primary/60"
            />
            <SearchIcon className="absolute left-4 top-4 text-gray-400 dark:text-white/42" size={24} />
          </form>

          {/* Search Guidance */}
          <p className="mb-4 text-xs text-gray-500 dark:text-white/45">
            Try: <span className="font-semibold text-gray-700 dark:text-white/70">iPhone under ₹50,000</span> &middot; <span className="font-semibold text-gray-700 dark:text-white/70">laptop for rent</span> &middot; <span className="font-semibold text-gray-700 dark:text-white/70">gaming laptop 40k&ndash;70k</span>
          </p>

          {/* Listing Type / Mode Filter Pills */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {[
              { label: "All", href: getModeUrl(params, { listingType: undefined, exchange: undefined }) },
              { label: "Buy", href: getModeUrl(params, { listingType: "SELL", exchange: undefined }) },
              { label: "Rent", href: getModeUrl(params, { listingType: "RENT", exchange: undefined }) },
              { label: "Exchange Only", href: getModeUrl(params, { listingType: undefined, exchange: "true" }) },
              { label: "Services", href: getModeUrl(params, { listingType: "SERVICE", exchange: undefined }) },
            ].map((mode) => {
              const isActive =
                mode.label === "All"
                  ? !listingType && !isExchange
                  : mode.label === "Buy"
                  ? listingType === "SELL" && !isExchange
                  : mode.label === "Rent"
                  ? listingType === "RENT" && !isExchange
                  : mode.label === "Exchange Only"
                  ? isExchange
                  : mode.label === "Services"
                  ? listingType === "SERVICE" && !isExchange
                  : false;

              return (
                <Link
                  key={mode.label}
                  href={mode.href}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.08]"
                  }`}
                >
                  {mode.label}
                </Link>
              );
            })}
          </div>

          {activeFilters.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => {
                const updatedParams = { ...params };
                delete (updatedParams as any)[filter.param];
                delete (updatedParams as any).page;
                const searchStr = new URLSearchParams(
                  Object.entries(updatedParams).filter(([, v]) => Boolean(v)) as [string, string][]
                ).toString();

                return (
                  <span
                    key={filter.param}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/62"
                  >
                    {filter.label}
                    <Link
                      href={searchStr ? `/search?${searchStr}` : "/search"}
                      className="ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                      aria-label={`Remove ${filter.label}`}
                    >
                      &times;
                    </Link>
                  </span>
                );
              })}
              <Link
                href={rawQuery ? `/search?q=${encodeURIComponent(rawQuery)}` : "/search"}
                className="rounded-lg px-3 py-1.5 text-xs font-black text-primary hover:bg-primary/10"
              >
                Clear all filters
              </Link>
            </div>
          )}

          {/* Results Header */}
          <div className="mb-6 flex flex-col justify-between items-start sm:flex-row sm:items-center gap-4">
            <div className="text-sm font-semibold text-gray-600 dark:text-white/52">
              Showing <span className="font-black text-gray-900 dark:text-white">{results.length}</span> results
              {rawQuery && (
                <span>
                  {" "}for &ldquo;<span className="font-black text-gray-900 dark:text-white">{effectiveQuery}</span>&rdquo;
                  {effectiveQuery.toLowerCase() !== rawQuery.toLowerCase() && (
                    <span className="ml-1 text-xs text-gray-400 dark:text-white/40">
                      (from &ldquo;{rawQuery}&rdquo;)
                    </span>
                  )}
                </span>
              )}
            </div>

            <form method="GET" action="/search">
              {rawQuery && <input type="hidden" name="q" value={rawQuery} />}
              {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
              {condition && <input type="hidden" name="condition" value={condition} />}
              {listingType && <input type="hidden" name="listingType" value={listingType} />}
              {isExchange && <input type="hidden" name="exchange" value="true" />}
              {isMovingOut && <input type="hidden" name="movingOut" value="true" />}
              {params.minPrice && <input type="hidden" name="minPrice" value={params.minPrice} />}
              {params.maxPrice && <input type="hidden" name="maxPrice" value={params.maxPrice} />}
              {rawCampus && <input type="hidden" name="campus" value={rawCampus} />}
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
              description={rawQuery ? `We couldn't find any items matching "${rawQuery}". Try clearing filters, changing category, or expanding your price range.` : "No items are currently available for these filters."}
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
