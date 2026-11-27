import Link from "next/link";
import {
  Car,
  BookOpen,
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
  { id: "vehicles", label: "Vehicles", href: "/search?category=vehicles", icon: Car },
  { id: "fashion", label: "Fashion", href: "/search?category=fashion", icon: Shirt },
  { id: "furniture", label: "Furniture", href: "/search?category=furniture-hostel", icon: Sofa },
  { id: "gaming", label: "Gaming", href: "/search?category=gaming-entertainment", icon: Gamepad2 },
  { id: "services", label: "Services", href: "/search?category=services&listingType=SERVICE", icon: Wrench },
  { id: "accessories", label: "Accessories", href: "/search?category=accessories", icon: Headphones },
];

export default function VisualCategoryRail() {
  return (
    <section className="border-b border-[#E4DCD3] bg-[#EFE5DA]" aria-label="Explore campus categories">
      <div className="container mx-auto px-3 sm:px-4">
        <nav className="flex items-stretch gap-2 overflow-x-auto py-2 no-scrollbar sm:justify-between sm:gap-3" aria-label="Product categories">
          {VISUAL_CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            const isForYou = index === 0;

            return (
              <Link
                key={category.id}
                href={category.href}
                aria-current={isForYou ? "page" : undefined}
                title={category.label}
                className={"category-pill group flex min-w-[68px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-center transition-colors sm:min-w-0 sm:flex-1 sm:px-1 " + (
                  isForYou
                    ? "bg-[#17645F] text-white"
                    : "text-[#526663] hover:bg-[#F3EEE8] hover:text-[#17645F]"
                )}
              >
                <Icon size={21} strokeWidth={isForYou ? 2 : 1.8} aria-hidden="true" />
                <span className="max-w-full truncate text-[10px] font-semibold sm:text-[11px]">
                  {category.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
