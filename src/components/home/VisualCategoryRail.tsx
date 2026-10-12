import Link from "next/link";
import {
  Laptop,
  Smartphone,
  BookOpen,
  Bike,
  Sofa,
  Gamepad2,
  Shirt,
  Headphones,
  Building2,
  Wrench,
  LucideIcon,
} from "lucide-react";

interface CategoryMeta {
  id: string;
  slug: string;
  name: string;
  shortLabel: string;
  icon: LucideIcon;
  accent: string;
}

const VISUAL_CATEGORIES: CategoryMeta[] = [
  {
    id: "computers-laptops",
    slug: "computers-laptops",
    name: "Computers & Laptops",
    shortLabel: "Laptops",
    icon: Laptop,
    accent: "from-blue-500/20 to-indigo-600/20 text-blue-500 border-blue-500/30",
  },
  {
    id: "mobiles-gadgets",
    slug: "mobiles-gadgets",
    name: "Mobiles & Gadgets",
    shortLabel: "Mobiles",
    icon: Smartphone,
    accent: "from-cyan-500/20 to-blue-600/20 text-cyan-500 border-cyan-500/30",
  },
  {
    id: "books-sports-hobbies",
    slug: "books-sports-hobbies",
    name: "Books & Study Material",
    shortLabel: "Books",
    icon: BookOpen,
    accent: "from-amber-500/20 to-orange-600/20 text-amber-500 border-amber-500/30",
  },
  {
    id: "bikes-transport",
    slug: "bikes-transport",
    name: "Cycles & Transport",
    shortLabel: "Cycles",
    icon: Bike,
    accent: "from-emerald-500/20 to-teal-600/20 text-emerald-500 border-emerald-500/30",
  },
  {
    id: "furniture-hostel",
    slug: "furniture-hostel",
    name: "Hostel Furniture",
    shortLabel: "Furniture",
    icon: Sofa,
    accent: "from-purple-500/20 to-pink-600/20 text-purple-500 border-purple-500/30",
  },
  {
    id: "gaming-entertainment",
    slug: "gaming-entertainment",
    name: "Gaming & Entertainment",
    shortLabel: "Gaming",
    icon: Gamepad2,
    accent: "from-rose-500/20 to-red-600/20 text-rose-500 border-rose-500/30",
  },
  {
    id: "fashion",
    slug: "fashion",
    name: "Campus Fashion",
    shortLabel: "Fashion",
    icon: Shirt,
    accent: "from-violet-500/20 to-purple-600/20 text-violet-500 border-violet-500/30",
  },
  {
    id: "audio",
    slug: "electronics-appliances",
    name: "Audio & Accessories",
    shortLabel: "Audio",
    icon: Headphones,
    accent: "from-pink-500/20 to-rose-600/20 text-pink-500 border-pink-500/30",
  },
  {
    id: "properties",
    slug: "properties",
    name: "Hostel & Rooms",
    shortLabel: "Rooms / PG",
    icon: Building2,
    accent: "from-indigo-500/20 to-blue-600/20 text-indigo-500 border-indigo-500/30",
  },
  {
    id: "services",
    slug: "services",
    name: "Campus Services",
    shortLabel: "Services",
    icon: Wrench,
    accent: "from-amber-600/20 to-yellow-500/20 text-amber-500 border-amber-500/30",
  },
];

export default function VisualCategoryRail() {
  return (
    <section className="container mx-auto px-4 py-6" aria-label="Visual Categories">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Explore by Category
        </h2>
        <Link
          href="/search"
          className="text-xs font-black text-primary hover:underline"
        >
          All Categories &rarr;
        </Link>
      </div>

      {/* Horizontal Rail: smooth swipe on mobile, clean row on desktop */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar sm:grid sm:grid-cols-5 md:grid-cols-10 sm:overflow-visible">
        {VISUAL_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/search?category=${cat.slug}`}
              className="group relative flex min-w-[76px] flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200/80 bg-white p-2.5 text-center shadow-xs transition hover:border-primary/50 hover:bg-gray-50/80 hover:shadow-md dark:border-white/10 dark:bg-[#10141b] dark:hover:border-primary/50 dark:hover:bg-white/[0.04] sm:min-w-0 active:scale-95"
            >
              {/* 2.5D visual container */}
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br border shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 ${cat.accent}`}>
                <Icon size={22} className="object-25d transition-transform group-hover:rotate-3" />
              </div>

              <span className="text-[11px] font-bold text-gray-800 transition group-hover:text-primary dark:text-gray-200 dark:group-hover:text-white truncate max-w-full">
                {cat.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
