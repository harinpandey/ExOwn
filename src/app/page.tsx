import { Suspense } from "react";
import Link from "next/link";
import {
  Flame,
  Zap,
  Clock,
  RefreshCw,
  Building2,
  Handshake,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";

import VisualCategoryRail from "@/components/home/VisualCategoryRail";
import HeroCampaign from "@/components/home/HeroCampaign";
import QuickActionRail from "@/components/home/QuickActionRail";
import TrendingDeals from "@/components/home/TrendingDeals";
import MovingOutDeals from "@/components/home/MovingOutDeals";
import RecentlyAdded from "@/components/home/RecentlyAdded";
import PopularRentals from "@/components/home/PopularRentals";
import VerifiedSellers from "@/components/home/VerifiedSellers";
import RecentlyViewedSection from "@/components/home/RecentlyViewedSection";
import CampusSpotlight from "@/components/home/CampusSpotlight";
import ProductShelf from "@/components/ui/ProductShelf";
import { SectionSkeleton } from "@/components/ui/ProductSkeleton";

export const dynamic = "force-dynamic";

const trustPillars = [
  {
    icon: ShieldCheck,
    title: "Campus Verified Profiles",
    description: "Every student profile displays authentic university email or student ID verification status.",
  },
  {
    icon: Lock,
    title: "Public Campus Meetups",
    description: "Built-in safety guidance encouraging daylight meetups at library foyers and campus food courts.",
  },
  {
    icon: CheckCircle2,
    title: "Zero Advance Transfers",
    description: "Transparent negotiation tools keeping students safe from online payment scams.",
  },
];

export default function Home() {
  return (
    <div className="pb-16 text-gray-900 dark:text-white">
      {/* 1. Visual Category Rail (Merchandising Top Bar) */}
      <VisualCategoryRail />

      {/* 2. Hero Campaign (Campus Tech Drop & Key Themes) */}
      <HeroCampaign />

      {/* 3. Quick Action Rail (Buy, Sell, Rent, Housing, Post a Want) */}
      <QuickActionRail />

      {/* 4. Trending on Campus Shelf */}
      <ProductShelf
        eyebrow="Campus Activity"
        icon={<Flame size={14} className="text-orange-500" />}
        title="Trending on Campus"
        description="Most viewed and active student listings across your university."
        href="/search?sort=trending"
        action="View All"
      >
        <Suspense fallback={<SectionSkeleton count={5} />}>
          <TrendingDeals />
        </Suspense>
      </ProductShelf>

      {/* 5. Moving Out Clearance Shelf (Signature ExOwn Campus Experience) */}
      <ProductShelf
        eyebrow="Graduating Seniors"
        icon={<Zap size={14} className="text-amber-500" />}
        title="Moving Out Deals"
        description="Seniors and relocating students clearing their rooms with instant hostel pickup."
        href="/search?movingOut=true"
        action="Explore Deals"
      >
        <Suspense fallback={<SectionSkeleton count={5} />}>
          <MovingOutDeals />
        </Suspense>
      </ProductShelf>

      {/* 6. Recently Viewed Listings (If any stored locally) */}
      <RecentlyViewedSection />

      {/* 7. Verified Sellers Shelf */}
      <ProductShelf
        eyebrow="Trusted Members"
        icon={<ShieldCheck size={14} className="text-blue-500" />}
        title="Verified Seller Listings"
        description="Listings posted by peers with institutional identity verification."
        href="/search"
        action="Explore Verified"
      >
        <Suspense fallback={<SectionSkeleton count={5} />}>
          <VerifiedSellers />
        </Suspense>
      </ProductShelf>

      {/* 8. Fresh Listings (Just Listed) */}
      <ProductShelf
        eyebrow="Latest Arrivals"
        icon={<Clock size={14} className="text-emerald-500" />}
        title="Freshly Listed"
        description="Items added recently to keep the campus marketplace fresh."
        href="/search?sort=newest"
        action="Newest"
      >
        <Suspense fallback={<SectionSkeleton count={5} />}>
          <RecentlyAdded />
        </Suspense>
      </ProductShelf>

      {/* 9. Popular Rentals Shelf */}
      <ProductShelf
        eyebrow="Flexible Terms"
        icon={<RefreshCw size={14} className="text-cyan-500" />}
        title="Campus Rentals"
        description="Bicycles, mini-fridges, and equipment available on semester rental terms."
        href="/search?listingType=RENT"
        action="All Rentals"
      >
        <Suspense fallback={<SectionSkeleton count={5} />}>
          <PopularRentals />
        </Suspense>
      </ProductShelf>

      {/* 10. Campus Services & Housing Discovery Feature Grid */}
      <section className="border-y border-gray-200/80 bg-gray-50/70 py-14 dark:border-white/10 dark:bg-[#0c1017]">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <span className="text-[11px] font-black uppercase tracking-wider text-primary">Campus Living</span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
              Housing & Student Services
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Link
              href="/search?category=properties"
              className="group flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs transition hover:border-primary/50 hover:shadow-lg dark:border-white/10 dark:bg-[#10141b]"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 mb-4">
                  <Building2 size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition dark:text-white">
                  Student Housing & PGs
                </h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-gray-600 dark:text-gray-400">
                  Find verified student accommodations, flats, and rooms with zero broker fees.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-black text-primary">
                Explore Housing <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/requests"
              className="group flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs transition hover:border-primary/50 hover:shadow-lg dark:border-white/10 dark:bg-[#10141b]"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 mb-4">
                  <Handshake size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition dark:text-white">
                  Roommates & Want Board
                </h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-gray-600 dark:text-gray-400">
                  Connect with compatible batchmates or broadcast what equipment you need to borrow or buy.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-black text-primary">
                Browse Board <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/search?listingType=SERVICE"
              className="group flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs transition hover:border-primary/50 hover:shadow-lg dark:border-white/10 dark:bg-[#10141b]"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-4">
                  <Zap size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition dark:text-white">
                  Peer Campus Services
                </h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-gray-600 dark:text-gray-400">
                  Laptop repair, OS installation, note-printing, tutoring, and student-run campus services.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-black text-primary">
                Browse Services <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Campus Spotlight (Real Sponsored Content, gracefully collapses if none) */}
      <Suspense fallback={null}>
        <CampusSpotlight />
      </Suspense>

      {/* 12. Trust & Safety Foundation Section */}
      <section className="container mx-auto px-4 py-14">
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-10 shadow-xs dark:border-white/10 dark:bg-[#10141b]">
          <div className="mb-8">
            <span className="text-[11px] font-black uppercase tracking-wider text-primary">Marketplace Integrity</span>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Built for Campus Trust & Safety
            </h2>
            <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
              How ExOwn protects students and eliminates marketplace friction.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {trustPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-600 dark:text-gray-400">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
