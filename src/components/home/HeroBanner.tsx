"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  ChevronRight,
  Cpu,
  Gamepad2,
  Headphones,
  Laptop,
  MapPin,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Shirt,
  Sparkles,
  Watch,
  Zap,
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";

// Inside HeroBanner:
// const { selectedCampus, campusObj } = useLocation();

const heroSlides = [
  {
    id: 1,
    badge: "🔥 BIG CAMPUS SALE",
    badgeColor: "bg-red-500 text-white",
    title: "UP TO 60% OFF LAPTOPS & TECH",
    subtitle: "Refurbished MacBooks, i7 Gaming Laptops & Accessories from graduating seniors.",
    cta: "Shop Tech Deals",
    href: "/search?category=computers-laptops",
    gradient: "from-blue-600 via-indigo-700 to-purple-900",
    accentGlow: "rgba(59, 130, 246, 0.4)",
    image: "/exown-logo.png",
    tag: "ENDS IN 2 DAYS",
  },
  {
    id: 2,
    badge: "⚡ HOSTEL RENTALS",
    badgeColor: "bg-amber-400 text-black",
    title: "FRIDGES, CYCLES & TVS FROM ₹99/DAY",
    subtitle: "Rent semester essentials without heavy upfront buying costs. Direct student handoff.",
    cta: "Explore Rentals",
    href: "/search?listingType=RENT",
    gradient: "from-amber-600 via-orange-600 to-red-800",
    accentGlow: "rgba(245, 158, 11, 0.4)",
    image: "/exown-icon.png",
    tag: "ZERO DEPOSIT DEALS",
  },
  {
    id: 3,
    badge: "🏠 CAMPUS HOUSING & ROOMMATES",
    badgeColor: "bg-emerald-500 text-white",
    title: "FIND FLATMATES & PGS — 0% BROKERAGE",
    subtitle: "Browse verified hostel rooms, PGs, and compatible roommates near your campus.",
    cta: "Browse Housing",
    href: "/search?category=properties",
    gradient: "from-emerald-600 via-teal-700 to-cyan-900",
    accentGlow: "rgba(16, 185, 129, 0.4)",
    image: "/exown-icon.png",
    tag: "VERIFIED USERS ONLY",
  },
  {
    id: 4,
    badge: "📚 BOOK & NOTES EXCHANGE",
    badgeColor: "bg-purple-500 text-white",
    title: "SWAP TEXTBOOKS & SEMESTER NOTES",
    subtitle: "Exchange engineering, medical & law books with batchmates at zero cost.",
    cta: "Exchange Now",
    href: "/search?exchange=true",
    gradient: "from-purple-600 via-fuchsia-700 to-pink-900",
    accentGlow: "rgba(168, 85, 247, 0.4)",
    image: "/exown-logo.png",
    tag: "SWAP & SAVE",
  },
];

const subCategories = [
  { name: "Laptops", icon: Laptop, href: "/search?category=computers-laptops", color: "bg-blue-500/15 text-blue-500" },
  { name: "Gadgets", icon: Cpu, href: "/search?category=mobiles-gadgets", color: "bg-purple-500/15 text-purple-500" },
  { name: "Books & Swap", icon: BookOpen, href: "/search?category=books-sports-hobbies", color: "bg-emerald-500/15 text-emerald-500" },
  { name: "Gaming", icon: Gamepad2, href: "/search?category=gaming-entertainment", color: "bg-red-500/15 text-red-500" },
  { name: "PG & Rooms", icon: Building2, href: "/search?category=properties", color: "bg-amber-500/15 text-amber-500" },
  { name: "Rentals", icon: RefreshCw, href: "/search?listingType=RENT", color: "bg-cyan-500/15 text-cyan-500" },
  { name: "Audio", icon: Headphones, href: "/search?q=headphones", color: "bg-pink-500/15 text-pink-500" },
  { name: "Watches", icon: Watch, href: "/search?q=watch", color: "bg-indigo-500/15 text-indigo-500" },
  { name: "Fashion", icon: Shirt, href: "/search?q=clothing", color: "bg-teal-500/15 text-teal-500" },
  { name: "Services", icon: Zap, href: "/search?listingType=SERVICE", color: "bg-yellow-500/15 text-yellow-500" },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const { campusObj } = useLocation();

  // Auto-slide effect every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <section className="relative overflow-hidden bg-slate-100 text-slate-900 transition-colors dark:bg-[#07090d] dark:text-white">
      <div className="container mx-auto px-4 pt-4 pb-6">

        {/* ── Top Search Bar Strip (Flipkart style header inline search) ── */}
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search laptops, books, cycles, PG rooms, services..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-24 text-sm font-semibold text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary focus:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-white/40 dark:focus:border-primary dark:focus:bg-white/15"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 h-9 rounded-lg bg-primary px-4 text-xs font-black text-white transition hover:bg-primary-dark active:scale-95"
            >
              Search
            </button>
          </form>

          <div className="flex shrink-0 items-center justify-between gap-2 text-xs font-bold">
            <span className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
              <MapPin size={14} className="text-primary" />
              {campusObj.shortName}
            </span>
            <Link
              href={!user ? "/login?redirect=/sell" : "/sell"}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 font-black text-white shadow-lg transition hover:bg-primary-dark active:scale-95"
            >
              <Plus size={16} />
              + Sell Item
            </Link>
          </div>
        </div>

        {/* ── Main Auto-sliding Hero Banners + Side Banners ── */}
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          
          {/* Main Auto-Slider */}
          <div
            className="group relative flex min-h-[280px] sm:min-h-[340px] flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-10 shadow-2xl transition-all"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Background Slides */}
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-opacity duration-700 ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_70%)]" />
                <div className="absolute right-6 bottom-4 text-[120px] sm:text-[180px] font-black opacity-10 leading-none select-none">
                  ExOwn
                </div>
              </div>
            ))}

            {/* Active Slide Content */}
            <div className="relative z-20 flex flex-1 flex-col justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${heroSlides[currentSlide].badgeColor}`}>
                    {heroSlides[currentSlide].badge}
                  </span>
                  <span className="rounded-lg border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur">
                    {heroSlides[currentSlide].tag}
                  </span>
                </div>

                <h1 className="max-w-xl text-3xl font-black italic leading-none tracking-tight sm:text-4xl lg:text-5xl drop-shadow-md">
                  {heroSlides[currentSlide].title}
                </h1>

                <p className="mt-3 max-w-lg text-xs font-semibold leading-relaxed text-white/80 sm:text-sm">
                  {heroSlides[currentSlide].subtitle}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Link
                  href={heroSlides[currentSlide].href}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-black text-gray-900 shadow-xl transition hover:bg-gray-100 hover:scale-105 active:scale-95"
                >
                  {heroSlides[currentSlide].cta}
                  <ArrowRight size={15} />
                </Link>

                {/* Pause/Play indicator */}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/70 backdrop-blur transition hover:bg-black/60 hover:text-white"
                  title={isPaused ? "Play slide transition" : "Pause slide transition"}
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                </button>
              </div>
            </div>

            {/* Slider Controls (Left / Right Arrows) */}
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 z-30 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-black/70 active:scale-90"
              aria-label="Previous slide"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 z-30 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-black/70 active:scale-90"
              aria-label="Next slide"
            >
              <ArrowRight size={18} />
            </button>

            {/* Slide Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Side Promo Tiles (Flipkart style 2-card promo stack) */}
          <div className="hidden flex-col gap-4 lg:flex">
            {/* Promo Card 1 */}
            <Link
              href="/search?sort=trending"
              className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-5 transition hover:scale-[1.02] hover:border-primary/40 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <span className="rounded-md bg-yellow-400 px-2 py-0.5 text-[9px] font-black uppercase text-black">
                  🔥 Campus Hot
                </span>
                <Sparkles size={16} className="text-yellow-400 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-black text-yellow-300 uppercase tracking-wide">Refurbished Deals</p>
                <h3 className="text-lg font-black leading-tight text-white group-hover:text-primary transition">
                  MacBooks & Laptops
                </h3>
                <p className="mt-1 text-[11px] font-bold text-white/60">From ₹12,999 • Verified battery health</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-black text-primary">
                Shop Now <ChevronRight size={14} />
              </span>
            </Link>

            {/* Promo Card 2 */}
            <Link
              href="/search?listingType=SERVICE"
              className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900 via-teal-950 to-black p-5 transition hover:scale-[1.02] hover:border-emerald-400/40 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                  ✓ Verified Leads
                </span>
                <ShieldCheck size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-300 uppercase tracking-wide">Campus Services</p>
                <h3 className="text-lg font-black leading-tight text-white group-hover:text-emerald-300 transition">
                  Tutors & Printing
                </h3>
                <p className="mt-1 text-[11px] font-bold text-white/60">Direct student providers on campus</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400">
                Explore Services <ChevronRight size={14} />
              </span>
            </Link>
          </div>
        </div>

        {/* ── Flipkart-Style Rounded Sub-Category Strip (Like Screenshot 1) ── */}
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#10141b]/90">
          <div className="flex items-center justify-between px-3 pb-2 text-xs font-black uppercase tracking-wider text-gray-500 dark:text-white/50">
            <span>Explore Campus Categories</span>
            <Link href="/search" className="text-primary hover:underline">View All &rarr;</Link>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {subCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl p-2 text-center transition hover:-translate-y-1 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95"
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cat.color} transition group-hover:scale-110 shadow-sm`}>
                    <Icon size={22} />
                  </span>
                  <span className="text-[11px] font-black tracking-tight text-gray-700 transition group-hover:text-primary dark:text-white/90 dark:group-hover:text-white truncate max-w-full">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
