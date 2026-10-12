import Link from "next/link";
import {
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products?: number;
  };
}

interface VisualSubcategoryRailProps {
  categorySlug: string;
  categoryName: string;
  subcategories: SubcategoryItem[];
  currentSubcategory?: string;
  campusSlugOrName?: string;
}

export default function VisualSubcategoryRail({
  categorySlug,
  categoryName,
  subcategories,
  currentSubcategory,
  campusSlugOrName,
}: VisualSubcategoryRailProps) {
  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  const buildSubcategoryUrl = (subSlug?: string) => {
    const params = new URLSearchParams();
    params.set("category", categorySlug);
    if (subSlug) {
      params.set("subcategory", subSlug);
    }
    if (campusSlugOrName) {
      params.set("campus", campusSlugOrName);
    }
    return `/search?${params.toString()}`;
  };

  return (
    <section className="mb-8" aria-label="Explore Subcategories">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-primary" />
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Explore {categoryName} Subcategories
          </h2>
        </div>
        <Link
          href={buildSubcategoryUrl()}
          className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
        >
          <span>All in {categoryName}</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Visual Subcategory Pills Rail */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 no-scrollbar">
        {/* All Pill */}
        <Link
          href={buildSubcategoryUrl()}
          className={`group shrink-0 inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all active:scale-95 shadow-xs ${
            !currentSubcategory
              ? "border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
              : "border-gray-200/80 bg-white text-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:border-white/10 dark:bg-[#10141b] dark:text-gray-300 dark:hover:bg-white/[0.04]"
          }`}
        >
          <Sparkles size={14} className={!currentSubcategory ? "text-primary" : "text-gray-400 group-hover:text-primary"} />
          <span>All {categoryName}</span>
        </Link>

        {/* Individual Real Subcategories */}
        {subcategories.map((sub) => {
          const isSelected = currentSubcategory === sub.slug;
          return (
            <Link
              key={sub.id}
              href={buildSubcategoryUrl(sub.slug)}
              className={`group shrink-0 inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all active:scale-95 shadow-xs ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                  : "border-gray-200/80 bg-white text-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:border-white/10 dark:bg-[#10141b] dark:text-gray-300 dark:hover:bg-white/[0.04]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
              <span>{sub.name}</span>
              {typeof sub._count?.products === "number" && sub._count.products > 0 && (
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  {sub._count.products}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
