import Link from "next/link";
import {
  Bike,
  BookOpen,
  Building2,
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CategoryMeta {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const VISUAL_CATEGORIES: CategoryMeta[] = [
  { id: "for-you", label: "For You", href: "/", icon: Sparkles },
  { id: "mobiles", label: "Mobiles", href: "/search?category=mobiles-gadgets", icon: Smartphone },
  { id: "laptops", label: "Laptops", href: "/search?category=computers-laptops", icon: Laptop },
  { id: "electronics", label: "Electronics", href: "/search?category=electronics-appliances", icon: Monitor },
  { id: "books", label: "Books", href: "/search?category=books-sports-hobbies", icon: BookOpen },
  { id: "cycles", label: "Cycles", href: "/search?category=bikes-transport", icon: Bike },
  { id: "fashion", label: "Fashion", href: "/search?category=fashion", icon: Shirt },
  { id: "furniture", label: "Furniture", href: "/search?category=furniture-hostel", icon: Sofa },
  { id: "gaming", label: "Gaming", href: "/search?category=gaming-entertainment", icon: Gamepad2 },
  { id: "rooms", label: "Rooms & PGs", href: "/housing", icon: Building2 },
  { id: "services", label: "Services", href: "/search?listingType=SERVICE", icon: Wrench },
  { id: "accessories", label: "Accessories", href: "/search?category=electronics-appliances", icon: Headphones },
];

export default function VisualCategoryRail() {
  return (
    <section
      className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#090c12]"
      aria-label="Explore campus categories"
    >
      <div className="container mx-auto px-3 sm:px-4">
        <nav className="flex items-stretch gap-2 overflow-x-auto no-scrollbar sm:justify-between sm:gap-3">
          {VISUAL_CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            const isForYou = index === 0;

            return (
              <Link
                key={category.id}
                href={category.href}
                aria-current={isForYou ? "page" : undefined}
                title={category.label}
                className={`group relative flex min-w-[68px] shrink-0 flex-col items-center justify-center gap-1.5 px-2.5 pb-3 pt-4 text-center transition-colors sm:min-w-0 sm:flex-1 sm:px-1 ${
                  isForYou
                    ? "text-primary"
                    : "text-gray-700 hover:text-primary dark:text-white/70 dark:hover:text-primary"
                }`}
              >
                <Icon
                  size={25}
                  strokeWidth={isForYou ? 2.25 : 1.8}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
                <span className="max-w-full truncate text-[10px] font-bold sm:text-[11px]">
                  {category.label}
                </span>
                {isForYou && (
                  <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
