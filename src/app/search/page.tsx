import { Search as SearchIcon, SlidersHorizontal, Filter } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { searchProducts, getCategories } from "@/actions/product";
import SortSelect from "@/components/ui/SortSelect";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; condition?: string; sort?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "";
  const condition = params.condition || "";
  const sort = params.sort || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;

  const [results, categories] = await Promise.all([
    searchProducts({ query, categorySlug, condition, minPrice, maxPrice, sortBy: sort }),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <form method="GET" action="/search">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <Filter size={20} className="text-primary" />
                <h2 className="font-bold text-lg">Filters</h2>
              </div>

              {/* Preserve search query */}
              {query && <input type="hidden" name="q" value={query} />}

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wider">Categories</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        defaultChecked={!categorySlug}
                        className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                        All Categories
                      </span>
                    </label>
                    {categories.map((c) => (
                      <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value={c.slug}
                          defaultChecked={categorySlug === c.slug}
                          className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                          {c.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wider">Price Range</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      defaultValue={params.minPrice || ""}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      defaultValue={params.maxPrice || ""}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Condition Filter */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wider">Condition</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        value=""
                        defaultChecked={!condition}
                        className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Any</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        value="NEW"
                        defaultChecked={condition === "NEW"}
                        className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        value="USED"
                        defaultChecked={condition === "USED"}
                        className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Used</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                >
                  Apply Filters
                </button>

                {(categorySlug || condition || params.minPrice || params.maxPrice) && (
                  <Link
                    href={query ? `/search?q=${query}` : "/search"}
                    className="block text-center text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    Clear filters
                  </Link>
                )}
              </div>
            </div>
          </form>
        </aside>

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
                  isVerified={product.seller.isVerified}
                  categoryId={product.categoryId}
                  subcategoryId={product.subcategoryId || ""}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <SearchIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-gray-500 mb-6">
                {query ? `No items matching "${query}"` : "No items available with these filters"}
              </p>
              <Link href="/search" className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
                Clear Search
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
