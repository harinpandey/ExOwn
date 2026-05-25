import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Heart, MessageSquare } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import HeroBanner from "@/components/home/HeroBanner";
import { Suspense } from "react";
import TrendingDeals from "@/components/home/TrendingDeals";
import RecentlyViewedSection from "@/components/home/RecentlyViewedSection";
import { SectionSkeleton } from "@/components/ui/ProductSkeleton";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-6">
        <HeroBanner />
      </section>

      {/* Shop by Category */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs-safe font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">Shop by Category</h2>
          <Link href="/search" className="text-xs-safe font-extrabold text-primary hover:underline uppercase tracking-widest">
            All Categories
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2.5">
          {CATEGORIES.map((category) => (
            <Link 
              key={category.id} 
              href={`/search?category=${category.id}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-primary/5 transition-all group active:scale-95 touch-manipulation min-h-[90px] justify-center"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-955 rounded-xl group-hover:bg-white dark:group-hover:bg-gray-900 transition-colors">
                <category.icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-950/30 rounded-lg text-orange-600 dark:text-orange-400">
              <Zap size={18} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Trending Deals</h2>
          </div>
          <Link href="/search?sort=trending" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <Suspense fallback={<SectionSkeleton count={4} />}>
          <TrendingDeals />
        </Suspense>
      </section>

      {/* Recently Viewed (Client Side Only) */}
      <RecentlyViewedSection />

      {/* Trust & Safety Features */}
      <section className="container mx-auto px-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Designed For Student Safety First</h2>
            <p className="text-xs-safe text-gray-500 dark:text-gray-400 font-medium">ExOwn operates exclusively within college campus communities to eliminate spam and fake listings.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Campus Verification</h3>
                <p className="text-xs-safe text-gray-500 dark:text-gray-400">Every user must register with an official university email to trade on the platform.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Verified Trust Score</h3>
                <p className="text-xs-safe text-gray-500 dark:text-gray-400">AI-generated trust ratings based on successful campus deals and response metrics.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Direct Campus Chat</h3>
                <p className="text-xs-safe text-gray-500 dark:text-gray-400">Chat directly and arrange a safe face-to-face handoff on your physical campus.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
