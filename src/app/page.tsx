import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Star, Package } from "lucide-react";
import CategoryCard from "@/components/ui/CategoryCard";
import ProductCard from "@/components/ui/ProductCard";
import { CATEGORIES } from "@/lib/constants";
import { getTrendingProducts, getRecentlyAdded, getPopularRentals, getVerifiedSellersProducts } from "@/actions/product";
import HeroBanner from "@/components/home/HeroBanner";
import MarketplaceSwitcher from "@/components/home/MarketplaceSwitcher";
import { Suspense } from "react";
import TrendingDeals from "@/components/home/TrendingDeals";
import PopularRentals from "@/components/home/PopularRentals";
import RecentlyAdded from "@/components/home/RecentlyAdded";
import VerifiedSellers from "@/components/home/VerifiedSellers";
import RecentlyViewedSection from "@/components/home/RecentlyViewedSection";
import { SectionSkeleton } from "@/components/ui/ProductSkeleton";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-6">
        <HeroBanner />
      </section>

      <MarketplaceSwitcher />

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Shop by Category</h2>
          <Link href="/categories" className="text-sm font-black text-primary hover:underline uppercase tracking-widest">
            All Categories
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
          {CATEGORIES.map((category) => (
            <Link 
              key={category.id} 
              href={`/search?category=${category.id}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-primary/5 transition-all group"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-950 rounded-xl group-hover:bg-white dark:group-hover:bg-gray-900 transition-colors">
                <category.icon className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[10px] font-black text-center text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors uppercase tracking-tight line-clamp-1">
                {category.name.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Deals */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded-lg text-orange-600 dark:text-orange-400">
              <Zap size={20} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Trending Deals</h2>
          </div>
          <Link href="/search?sort=trending" className="text-primary font-semibold flex items-center gap-1 hover:underline">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <Suspense fallback={<SectionSkeleton count={4} />}>
          <TrendingDeals />
        </Suspense>
      </section>

      {/* Recently Viewed (Client Side Only) */}
      <RecentlyViewedSection />

      {/* Popular Rentals */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                <Star size={20} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Popular Rentals</h2>
            </div>
            <Link href="/search?listingType=RENT" className="text-primary font-semibold flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <Suspense fallback={<SectionSkeleton count={4} />}>
            <PopularRentals />
          </Suspense>
        </div>
      </section>

      {/* Recently Added */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Package size={20} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Recently Added</h2>
          </div>
          <Link href="/search?sort=recent" className="text-primary font-semibold flex items-center gap-1 hover:underline">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <Suspense fallback={<SectionSkeleton count={4} />}>
          <RecentlyAdded />
        </Suspense>
      </section>

      {/* Verified Sellers */}
      <section className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-blue-600 to-emerald-600 p-6 md:p-10 rounded-3xl text-white shadow-xl">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
              <ShieldCheck size={32} /> Verified Student Sellers
            </h2>
            <p className="text-blue-100 font-medium">Buy with confidence from fellow verified university students.</p>
          </div>
          <Link href="/search?verified=true" className="hidden md:flex bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
            Browse Verified
          </Link>
        </div>
        <Suspense fallback={<SectionSkeleton count={4} />}>
          <VerifiedSellers />
        </Suspense>
      </section>
    </div>
  );
}
