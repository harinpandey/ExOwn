import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Handshake,
  HomeIcon,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Users,
  Zap,
} from "lucide-react";
import { Suspense } from "react";
import { CATEGORIES } from "@/lib/constants";
import HeroBanner from "@/components/home/HeroBanner";
import TrendingDeals from "@/components/home/TrendingDeals";
import RecentlyAdded from "@/components/home/RecentlyAdded";
import PopularRentals from "@/components/home/PopularRentals";
import VerifiedSellers from "@/components/home/VerifiedSellers";
import RecentlyViewedSection from "@/components/home/RecentlyViewedSection";
import MiddlePromoCarousel from "@/components/home/MiddlePromoCarousel";
import ActiveCampusBanner from "@/components/home/ActiveCampusBanner";
import { SectionSkeleton } from "@/components/ui/ProductSkeleton";

export const dynamic = "force-dynamic";

const quickActions = [
  { label: "Buy", href: "/search?listingType=SELL", icon: ShoppingBag, tone: "bg-blue-600 text-white" },
  { label: "Sell", href: "/sell", icon: Plus, tone: "bg-blue-600 text-white" },
  { label: "Rent", href: "/search?listingType=RENT", icon: HomeIcon, tone: "bg-amber-500 text-white" },
  { label: "Exchange", href: "/search?exchange=true", icon: RefreshCw, tone: "bg-cyan-600 text-white" },
  { label: "Housing", href: "/search?category=properties", icon: Building2, tone: "bg-purple-600 text-white" },
  { label: "Roommate", href: "/requests", icon: Users, tone: "bg-indigo-600 text-white" },
];

const trustSignals = [
  { title: "College verified", description: "Profiles show understandable verification signals instead of vague scores." },
  { title: "Listing reports", description: "Every listing can be reported for fake, scam, spam or wrong information." },
  { title: "Campus handoff", description: "ExOwn nudges students toward safer public campus meetups." },
];

const howItWorks = [
  { title: "Discover", description: "Search by product, category, campus, listing type and price." },
  { title: "Trust", description: "Check verification, seller history, location and listing freshness." },
  { title: "Connect", description: "Chat, make an offer, agree the handoff and complete the deal." },
];

export default function Home() {
  return (
    <div className="pb-20 text-gray-900 dark:text-white">
      <HeroBanner />

      <section className="container mx-auto -mt-8 px-4">
        <div className="relative z-10 grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-[#10141b]/95 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex min-h-[86px] flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 text-gray-900 transition hover:-translate-y-0.5 hover:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.tone}`}>
                  <Icon size={19} />
                </span>
                <span className="flex items-center justify-between text-sm font-black">
                  {action.label}
                  <ArrowRight size={14} className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <ActiveCampusBanner />

      <section className="container mx-auto px-4 pb-14">
        <SectionHeader
          kicker="Explore"
          title="Categories"
          description="Jump into the most common student marketplace categories."
          href="/search"
          action="All categories"
        />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/search?category=${category.id}`}
              className="group flex min-h-[104px] flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:bg-blue-50 dark:border-white/10 dark:bg-[#10141b] dark:hover:bg-primary/[0.06] active:scale-95"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition group-hover:bg-primary/20 group-hover:text-primary dark:bg-white/[0.06] dark:text-white/52">
                <category.icon size={21} />
              </span>
              <span className="text-[11px] font-black leading-tight text-gray-800 transition group-hover:text-primary dark:text-white/72 dark:group-hover:text-white">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-14">
        <SectionHeader
          kicker="Campus activity"
          title="Trending on your campus"
          description="Fresh discovery based on marketplace activity and recent listings."
          href="/search?sort=trending"
          action="View all"
          icon={<Zap size={18} />}
        />
        <Suspense fallback={<SectionSkeleton count={5} />}>
          <TrendingDeals />
        </Suspense>
      </section>

      <RecentlyViewedSection />

      <MiddlePromoCarousel />

      <section className="container mx-auto px-4 py-14">
        <SectionHeader
          kicker="Picked for you"
          title="Verified seller picks"
          description="A deterministic first version of recommendations using seller verification signals."
          href="/search"
          action="Explore"
          icon={<ShieldCheck size={18} />}
        />
        <Suspense fallback={<SectionSkeleton count={5} />}>
          <VerifiedSellers />
        </Suspense>
      </section>

      <section className="container mx-auto px-4 pb-14">
        <SectionHeader
          kicker="Fresh listings"
          title="Just listed"
          description="Recent products should stay visible so the marketplace never feels stale."
          href="/search?sort=newest"
          action="Newest"
        />
        <Suspense fallback={<SectionSkeleton count={5} />}>
          <RecentlyAdded />
        </Suspense>
      </section>

      <section className="border-y border-gray-200 bg-gray-100 py-16 dark:border-white/10 dark:bg-[#0c1017]">
        <div className="container mx-auto grid gap-5 px-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <FeaturePanel
            title="Student housing"
            description="PGs, hostels, flats and rooms need a dedicated discovery flow, separate from normal product listings."
            href="/search?category=properties"
            action="Explore housing"
            icon={<Building2 size={24} />}
            large
          />
          <FeaturePanel
            title="Roommates"
            description="Start with campus requests, then evolve into compatibility profiles with budget and move-in signals."
            href="/requests"
            action="Find matches"
            icon={<Users size={24} />}
          />
          <FeaturePanel
            title="Campus services"
            description="Tutors, laundry, repairs, tiffin, printing and student services should become qualified leads."
            href="/search?listingType=SERVICE"
            action="Browse services"
            icon={<Handshake size={24} />}
          />
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <SectionHeader
          kicker="Rentals"
          title="Popular rentals"
          description="Rentable listings get their own section so users can scan availability quickly."
          href="/search?listingType=RENT"
          action="All rentals"
        />
        <Suspense fallback={<SectionSkeleton count={5} />}>
          <PopularRentals />
        </Suspense>
      </section>

      <section className="container mx-auto grid gap-5 px-4 py-14 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#10141b]">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck size={22} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-primary">Trust and safety</p>
              <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Understandable trust signals</h2>
            </div>
          </div>
          <div className="grid gap-3">
            {trustSignals.map((signal) => (
              <div key={signal.title} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white">{signal.title}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-gray-600 dark:text-white/52">{signal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#10141b]">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Search size={22} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-primary">How ExOwn works</p>
              <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Discover, trust, connect</h2>
            </div>
          </div>
          <div className="grid gap-3">
            {howItWorks.map((step, index) => (
              <div key={step.title} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-gray-600 dark:text-white/52">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  kicker,
  title,
  description,
  href,
  action,
  icon,
}: {
  kicker: string;
  title: string;
  description: string;
  href: string;
  action: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
          {icon}
          {kicker}
        </p>
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-gray-600 dark:text-white/52">{description}</p>
      </div>
      <Link href={href} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 transition hover:border-primary hover:text-primary dark:border-white/10 dark:bg-[#10141b] dark:text-white">
        {action}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function FeaturePanel({
  title,
  description,
  href,
  action,
  icon,
  large,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
  icon: ReactNode;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex min-h-[230px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary dark:border-white/10 dark:bg-[#10141b] ${large ? "lg:min-h-[300px]" : ""}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <div>
        <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-3 text-sm font-semibold leading-6 text-gray-600 dark:text-white/52">{description}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
          {action}
          <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
