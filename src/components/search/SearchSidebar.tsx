"use client";

import { useEffect, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, type Category } from "@/config/categories";

interface SearchSidebarProps {
  initialCategory: string;
  initialSubcategory: string;
  initialCondition: string;
  initialMinPrice: string;
  initialMaxPrice: string;
  initialListingType: string;
  initialDetails: Record<string, string>;
  query: string;
}

const ACCESSORY_CATEGORY: Category = {
  id: "accessories",
  name: "Accessories",
  slug: "accessories",
  icon: "Headphones",
  commonAttributes: [
    {
      id: "brand",
      label: "Brand",
      type: "dropdown",
      options: ["Apple", "Samsung", "OnePlus", "Sony", "Logitech", "Boat", "JBL", "Other"],
    },
  ],
  subcategories: [
    { id: "mobile-accessories", name: "Mobile Accessories" },
    { id: "accessories", name: "Vehicle & Fashion Accessories" },
  ],
};

const formatLabel = (value: string) =>
  value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function SearchSidebar({
  initialCategory,
  initialSubcategory,
  initialCondition,
  initialMinPrice,
  initialMaxPrice,
  initialListingType,
  initialDetails,
  query,
}: SearchSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);

  useEffect(() => {
    setSelectedSubcategory(initialSubcategory);
  }, [initialSubcategory]);

  const selectedCategory =
    initialCategory === "accessories"
      ? ACCESSORY_CATEGORY
      : CATEGORIES.find((category) => category.slug === initialCategory) ||
        (initialListingType === "SERVICE"
          ? CATEGORIES.find((category) => category.slug === "services")
          : undefined);

  const selectedSubcategoryConfig = selectedCategory?.subcategories.find(
    (subcategory) => subcategory.id === selectedSubcategory
  );
  const categoryAttributes = [
    ...(selectedCategory?.commonAttributes || []),
    ...(selectedSubcategoryConfig?.attributes || []),
  ];
  const isServiceView = selectedCategory?.slug === "services" || initialListingType === "SERVICE";
  const isTicketView = selectedCategory?.slug === "tickets-events";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());

    // Replace only the filter controls managed by this sidebar. Keep the user's
    // search text and campus selection intact.
    ["category", "subcategory", "minPrice", "maxPrice", "listingType", "condition", "exchange", "movingOut"].forEach(
      (key) => params.delete(key)
    );
    Array.from(params.keys())
      .filter((key) => key.startsWith("detail_"))
      .forEach((key) => params.delete(key));

    formData.forEach((value, key) => {
      if (typeof value === "string" && value.trim() !== "") {
        params.set(key, value.trim());
      }
    });

    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : "/search");
  };

  const clearHref = query ? `/search?q=${encodeURIComponent(query)}` : "/search";

  return (
    <aside className="w-full flex-shrink-0 md:w-72">
      <form key={searchParams.toString()} onSubmit={handleSubmit}>
        <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Filter size={19} className="text-primary" />
              <h2 className="text-lg font-extrabold">Filters</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {selectedCategory ? selectedCategory.name : "All listings"}
            </span>
          </div>

          <div className="space-y-5">
            {!selectedCategory ? (
              <div>
                <label htmlFor="category-filter" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Choose a category
                </label>
                <select
                  id="category-filter"
                  name="category"
                  defaultValue={initialCategory}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.slug} value={category.slug}>{category.name}</option>
                  ))}
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            ) : (
              <input type="hidden" name="category" value={initialCategory || selectedCategory.slug} />
            )}

            {selectedCategory && (
              <section className="rounded-xl border border-primary/15 bg-primary/[0.035] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-primary" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">
                    {selectedCategory.name} filters
                  </h3>
                </div>

                <label htmlFor="subcategory-filter" className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                  {selectedCategory.slug === "accessories" ? "Accessory type" : "Type"}
                </label>
                <select
                  id="subcategory-filter"
                  name="subcategory"
                  value={selectedSubcategory}
                  onChange={(event) => setSelectedSubcategory(event.target.value)}
                  className="mb-4 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All {selectedCategory.name}</option>
                  {selectedCategory.subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                  ))}
                </select>

                {categoryAttributes.length > 0 ? (
                  <div className="space-y-4">
                    {categoryAttributes.map((attribute) => (
                      <div key={attribute.id}>
                        <label
                          htmlFor={`detail-${attribute.id}`}
                          className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300"
                        >
                          {attribute.label}
                        </label>
                        <select
                          id={`detail-${attribute.id}`}
                          name={`detail_${attribute.id}`}
                          defaultValue={initialDetails[attribute.id] || ""}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">Any</option>
                          {attribute.type === "toggle" ? (
                            <>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </>
                          ) : (
                            attribute.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))
                          )}
                        </select>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                    Choose a type above to see more specific options, where available.
                  </p>
                )}
              </section>
            )}

            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Price range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minPrice"
                  min="0"
                  placeholder="Min ₹"
                  defaultValue={initialMinPrice}
                  className="w-full min-w-0 rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm dark:border-gray-700"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  name="maxPrice"
                  min="0"
                  placeholder="Max ₹"
                  defaultValue={initialMaxPrice}
                  className="w-full min-w-0 rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm dark:border-gray-700"
                />
              </div>
            </section>

            {!isServiceView && !isTicketView && (
              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Item condition</h3>
                <select
                  name="condition"
                  defaultValue={initialCondition}
                  className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm font-medium dark:border-gray-700"
                >
                  <option value="">Any condition</option>
                  <option value="LIKE_NEW">Like new</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Needs repair / poor</option>
                </select>
              </section>
            )}

            {isServiceView && <input type="hidden" name="listingType" value="SERVICE" />}
            {isTicketView && <input type="hidden" name="listingType" value="SELL" />}

            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-3 text-sm font-extrabold text-white transition hover:bg-primary-dark"
            >
              Apply {selectedCategory ? selectedCategory.name : "Search"} Filters
            </button>

            {(initialCategory || initialSubcategory || initialCondition || initialMinPrice || initialMaxPrice ||
              Object.values(initialDetails).some(Boolean) || initialListingType) && (
              <Link href={clearHref} className="block text-center text-xs font-bold text-gray-500 transition hover:text-primary">
                Clear filters
              </Link>
            )}
          </div>
        </div>
      </form>
    </aside>
  );
}
