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
  Car,
  Briefcase,
  Layers,
  LucideIcon,
} from "lucide-react";

interface CategoryHeroProps {
  name: string;
  slug: string;
  liveCount: number;
  campusName?: string;
}

const CATEGORY_VISUALS: Record<
  string,
  {
    icon: LucideIcon;
    accent: string;
    description: string;
  }
> = {
  "computers-laptops": {
    icon: Laptop,
    accent: "from-blue-500/20 to-indigo-600/20 text-blue-500 border-blue-500/30",
    description: "MacBooks, student laptops, chargers, coding setups, and workstation accessories.",
  },
  "mobiles-gadgets": {
    icon: Smartphone,
    accent: "from-cyan-500/20 to-blue-600/20 text-cyan-500 border-cyan-500/30",
    description: "Smartphones, tablets, e-readers, smartwatches, and everyday campus mobile gadgets.",
  },
  "books-sports-hobbies": {
    icon: BookOpen,
    accent: "from-amber-500/20 to-orange-600/20 text-amber-500 border-amber-500/30",
    description: "Course textbooks, engineering guides, competitive exam books, sports kits, and hobbies.",
  },
  "bikes-transport": {
    icon: Bike,
    accent: "from-emerald-500/20 to-teal-600/20 text-emerald-500 border-emerald-500/30",
    description: "Geared campus cycles, single-speed bicycles, helmets, locks, and local commute essentials.",
  },
  "furniture-hostel": {
    icon: Sofa,
    accent: "from-purple-500/20 to-pink-600/20 text-purple-500 border-purple-500/30",
    description: "Study tables, ergonomic chairs, bed tables, shoe racks, and hostel room essentials.",
  },
  "gaming-entertainment": {
    icon: Gamepad2,
    accent: "from-rose-500/20 to-red-600/20 text-rose-500 border-rose-500/30",
    description: "Gaming consoles, controllers, monitors, gaming mice, headphones, and mechanical keyboards.",
  },
  fashion: {
    icon: Shirt,
    accent: "from-violet-500/20 to-purple-600/20 text-violet-500 border-violet-500/30",
    description: "Campus wear, university hoodies, lab coats, sneakers, backpacks, and student fashion.",
  },
  "electronics-appliances": {
    icon: Headphones,
    accent: "from-pink-500/20 to-rose-600/20 text-pink-500 border-pink-500/30",
    description: "Kettles, monitors, extension boxes, desk lamps, headphones, and student electronics.",
  },
  properties: {
    icon: Building2,
    accent: "from-indigo-500/20 to-blue-600/20 text-indigo-500 border-indigo-500/30",
    description: "Hostel rooms, PG accommodations, flats near campus, and roommate matching.",
  },
  services: {
    icon: Wrench,
    accent: "from-amber-600/20 to-yellow-500/20 text-amber-500 border-amber-500/30",
    description: "Laptop repair, design & printing, campus tutors, project guidance, and student skills.",
  },
  cars: {
    icon: Car,
    accent: "from-slate-500/20 to-zinc-600/20 text-slate-400 border-slate-500/30",
    description: "Cars, carpools, and campus vehicle transit opportunities.",
  },
  jobs: {
    icon: Briefcase,
    accent: "from-teal-500/20 to-cyan-600/20 text-teal-500 border-teal-500/30",
    description: "Campus internships, student assistantships, and part-time university gigs.",
  },
};

export default function CategoryHero({
  name,
  slug,
  liveCount,
  campusName,
}: CategoryHeroProps) {
  const visual = CATEGORY_VISUALS[slug] || {
    icon: Layers,
    accent: "from-primary/20 to-blue-600/20 text-primary border-primary/30",
    description: `Browse verified student listings in ${name}.`,
  };

  const Icon = visual.icon;

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-br from-white via-gray-50/60 to-gray-100/50 p-6 sm:p-8 shadow-sm dark:border-white/10 dark:from-[#10141b] dark:via-[#131922] dark:to-[#0c1017]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          {/* 2.5D visual container */}
          <div
            className={`relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br border shadow-md ${visual.accent}`}
          >
            <Icon size={34} className="object-25d drop-shadow-md" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                {name}
              </h1>
              {campusName && (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  {campusName}
                </span>
              )}
            </div>
            <p className="max-w-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
              {visual.description}
            </p>
          </div>
        </div>

        {/* Live inventory badge */}
        <div className="shrink-0 flex items-center sm:flex-col sm:items-end justify-between border-t border-gray-100 pt-3 dark:border-white/5 sm:border-t-0 sm:pt-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Available on Campus
          </span>
          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {liveCount} {liveCount === 1 ? "Listing" : "Listings"}
          </span>
        </div>
      </div>
    </div>
  );
}
