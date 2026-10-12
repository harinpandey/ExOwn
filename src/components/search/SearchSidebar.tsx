"use client";

import { Filter } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchSidebarProps {
  categories: any[];
  initialCategory: string;
  initialCondition: string;
  initialMinPrice: string;
  initialMaxPrice: string;
  initialListingType: string;
  initialExchange?: boolean;
  initialMovingOut?: boolean;
  query: string;
}

export default function SearchSidebar({ 
  categories, 
  initialCategory, 
  initialCondition, 
  initialMinPrice, 
  initialMaxPrice,
  initialListingType,
  initialExchange = false,
  initialMovingOut = false,
  query 
}: SearchSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    
    // Managed fields from sidebar form
    const sidebarKeys = ["category", "minPrice", "maxPrice", "listingType", "condition", "exchange", "movingOut"];
    sidebarKeys.forEach((k) => params.delete(k));

    formData.forEach((value, key) => {
      if (value && typeof value === "string" && value.trim() !== "") {
        params.set(key, value.trim());
      }
    });

    // Reset page to 1 on applying filters
    params.delete("page");

    router.push(`/search?${params.toString()}`);
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <Filter size={20} className="text-primary" />
            <h2 className="font-bold text-lg">Filters</h2>
          </div>

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
                    defaultChecked={!initialCategory}
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
                      defaultChecked={initialCategory === c.slug}
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
                  defaultValue={initialMinPrice}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  defaultValue={initialMaxPrice}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
                />
              </div>
            </div>

            {/* Listing Type Filter */}
            <div>
              <h3 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wider">Ad Type</h3>
              <div className="space-y-2">
                {[
                  { label: "All Types", value: "" },
                  { label: "For Sale", value: "SELL" },
                  { label: "For Rent", value: "RENT" },
                  { label: "Services", value: "SERVICE" }
                ].map((t) => (
                  <label key={t.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="listingType"
                      value={t.value}
                      defaultChecked={initialListingType === t.value}
                      className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                      {t.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Filters */}
            <div>
              <h3 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wider">Special Deals</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="exchange"
                    value="true"
                    defaultChecked={initialExchange}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                    Exchange Only
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="movingOut"
                    value="true"
                    defaultChecked={initialMovingOut}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                    Moving Out Deals
                  </span>
                </label>
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <h3 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wider">Condition</h3>
              <div className="space-y-2">
                {["", "LIKE_NEW", "GOOD", "FAIR", "POOR"].map((c) => (
                  <label key={c} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value={c}
                      defaultChecked={initialCondition === c}
                      className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {c === "" ? "Any" : c.replace("_", " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              Apply Filters
            </button>

            {(initialCategory || initialCondition || initialMinPrice || initialMaxPrice || initialListingType || initialExchange || initialMovingOut) && (
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
  );
}
