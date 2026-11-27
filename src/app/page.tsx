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
import LpuNewsPreview from "@/components/home/LpuNewsPreview";
import TrendingDeals from "@/components/home/TrendingDeals";
import MovingOutDeals from "@/components/home/MovingOutDeals";
import RecentlyAdded from "@/components/home/RecentlyAdded";
import PopularRentals from "@/components/home/PopularRentals";
import VerifiedSellers from "@/components/home/VerifiedSellers";
import RecentlyViewedSection from "@/components/home/RecentlyViewedSection";
import CampusSpotlight from "@/components/home/CampusSpotlight";
import ProductShelf from "@/components/ui/ProductShelf";
import { SectionSkeleton } from "@/components/ui/ProductSkeleton";
import ScrollReveal from "@/components/ui/ScrollReveal";

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
    <div className="exown-home exown-shell pb-16">
      {/* 1. Visual Category Rail (Merchandising Top Bar) */}
      <VisualCategoryRail />

      {/* 3. Full-width image-led campus advertising */}
      <Suspense fallback={null}>
        <CampusSpotlight />
      </Suspense>

      {/* 3. LPU News (independent news database) */}
      <LpuNewsPreview />

      {/* 4. Trending on Campus Shelf */}
      <ProductShelf
        eyebrow="Campus Activity"
        icon={<Flame size={14} className="text-[#FF6845]" />}
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
        icon={<Zap size={14} className="text-[#FF6845]" />}
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
        icon={<ShieldCheck size={14} className="text-teal-500" />}
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
        icon={<RefreshCw size={14} className="text-[#17645F]" />}
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
      <section className="border-y border-[#E4DCD3] bg-[#F3EEE8] py-14">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <span className="inline-flex rounded-full bg-[#E5EFEC] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#17645F]">Campus Living</span>
            <h2 className="exown-section-title mt-2 font-extrabold tracking-tight text-[#183B38]">
              Housing & Student Services
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Link
              href="/housing"
              className="group flex flex-col justify-between rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-6 shadow-[0_1px_3px_rgba(19,34,29,0.035)] transition hover:-translate-y-0.5 hover:border-[#D2C6BB] hover:shadow-[0_4px_14px_rgba(19,34,29,0.06)]"
            >
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5EFEC] text-[#17645F]">
                  <Building2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#183B38] transition group-hover:text-[#17645F]">
                  Student Housing & PGs
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#526663]">
                  Browse active student accommodations, flats, and rooms around your campus.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#17645F]">
                Explore Housing <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/roommates"
              className="group flex flex-col justify-between rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-6 shadow-[0_1px_3px_rgba(19,34,29,0.035)] transition hover:-translate-y-0.5 hover:border-[#D2C6BB] hover:shadow-[0_4px_14px_rgba(19,34,29,0.06)]"
            >
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5EFEC] text-[#17645F]">
                  <Handshake size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#183B38] transition group-hover:text-[#17645F]">
                  Roommate Finder
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#526663]">
                  Find compatible campus peers for shared housing and flatmate connections.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#17645F]">
                Find Roommates <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/search?listingType=SERVICE"
              className="group flex flex-col justify-between rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-6 shadow-[0_1px_3px_rgba(19,34,29,0.035)] transition hover:-translate-y-0.5 hover:border-[#D2C6BB] hover:shadow-[0_4px_14px_rgba(19,34,29,0.06)]"
            >
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5EFEC] text-[#17645F]">
                  <Zap size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#183B38] transition group-hover:text-[#17645F]">
                  Peer Campus Services
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#526663]">
                  Laptop repair, OS installation, note-printing, tutoring, and student-run campus services.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#17645F]">
                Browse Services <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 12. Trust & Safety Foundation Section */}
      <section className="container mx-auto px-4 py-14">
        <div className="rounded-3xl border border-[#E4DCD3] bg-[#EFE5DA] p-6 shadow-[0_2px_10px_rgba(19,34,29,0.035)] sm:p-10">
          <div className="mb-8">
            <span className="inline-flex rounded-full bg-[#E5EFEC] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#17645F]">Marketplace Integrity</span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#183B38] sm:text-3xl">
              Built for Campus Trust & Safety
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#526663]">
              How ExOwn protects students and eliminates marketplace friction.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {trustPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <ScrollReveal key={pillar.title} delay={trustPillars.indexOf(pillar) * 70}>
                  <div className="rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center text-[#17645F]">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-[#183B38]">
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#526663]">
                      {pillar.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
