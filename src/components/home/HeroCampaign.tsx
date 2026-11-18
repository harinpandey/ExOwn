"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Building2,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Package,
  Plane,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";

const featuredSlides = [
  {
    eyebrow: "STUDENT LIVING",
    title: "A better place to call home.",
    description: "Explore PGs, rooms and student-friendly stays around your campus.",
    action: "Explore housing",
    href: "/housing",
    icon: Building2,
    visualLabel: "Find your space",
  },
  {
    eyebrow: "ROOMMATE FINDER",
    title: "Find a flatmate who fits.",
    description: "Meet campus peers looking for a comfortable shared space.",
    action: "Find roommates",
    href: "/roommates",
    icon: Users,
    visualLabel: "Meet your people",
  },
  {
    eyebrow: "CAMPUS TRAVEL",
    title: "Make the next break count.",
    description: "Explore useful travel options for your next student journey.",
    action: "Plan your trip",
    href: "/travel",
    icon: Plane,
    visualLabel: "Travel with ease",
  },
  {
    eyebrow: "LPU CAMPUS UPDATES",
    title: "Stay in the campus loop.",
    description: "Catch up on news, notices and stories from the LPU community.",
    action: "Read LPU News",
    href: "/lpu-news",
    icon: Newspaper,
    visualLabel: "Know what's happening",
  },
];

export default function HeroCampaign() {
  const { user } = useAuth();
  const { campusObj } = useLocation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % featuredSlides.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const goToPrevious = () => {
    setActiveSlide((current) => (current - 1 + featuredSlides.length) % featuredSlides.length);
  };

  const goToNext = () => {
    setActiveSlide((current) => (current + 1) % featuredSlides.length);
  };

  const currentSlide = featuredSlides[activeSlide];
  const SlideIcon = currentSlide.icon;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-7 pt-6 sm:pb-9 sm:pt-8">
      <div className="grid gap-4 lg:grid-cols-[1.55fr_0.95fr]">
        <div className="grid min-h-[320px] overflow-hidden rounded-3xl border border-[#E2E8E5] bg-white shadow-[0_2px_8px_rgba(19,34,29,0.04)] dark:border-[#2A4136] dark:bg-[#14231C] sm:grid-cols-[1.15fr_0.85fr] lg:min-h-[356px]">
          <div className="flex flex-col items-start justify-center p-6 sm:p-8 lg:p-10">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E2E8E5] bg-[#F7F9F8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A5D56] dark:border-[#2A4136] dark:bg-[#101D17] dark:text-[#B4C5BC]">
              <Users size={13} className="text-[#1E5646] dark:text-[#91CDB0]" />
              {campusObj.shortName} · Student marketplace
            </span>
            <h1 className="max-w-xl text-[2.15rem] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#13221D] dark:text-[#E8F0EB] sm:text-4xl lg:text-[46px]">
              Good finds.
              <br />
              <span className="text-[#1E5646] dark:text-[#91CDB0]">Better campus deals.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#4A5D56] dark:text-[#B4C5BC] sm:text-base">
              Buy, sell, rent and exchange the things student life needs — right within your campus community.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/search"
                className="marketplace-button min-h-11 rounded-xl px-5 py-3 text-sm font-bold"
              >
                Explore marketplace <ArrowRight size={16} />
              </Link>
              <Link
                href={!user ? "/login?redirect=/sell" : "/sell"}
                className="marketplace-button-outline min-h-11 rounded-xl px-5 py-3 text-sm font-bold"
              >
                Start selling
              </Link>
            </div>
          </div>

          {/* Featured placement: rotating in-house ExOwn campaigns until ad inventory is connected. */}
          <div
            className="flex min-h-[320px] items-stretch bg-[#F7F9F8] p-4 dark:bg-[#101D17] sm:p-5 lg:p-6"
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured campus services"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsPaused(false);
              }
            }}
          >
            <div className="flex w-full flex-col justify-between rounded-2xl border border-[#E2E8E5] bg-white p-4 shadow-[0_1px_5px_rgba(19,34,29,0.035)] dark:border-[#2A4136] dark:bg-[#14231C] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4A5D56] dark:text-[#B4C5BC]">
                  <span className="h-2 w-2 rounded-full bg-[#1E5646] dark:bg-[#78B89C]" />
                  Featured on ExOwn
                </div>
                <span className="rounded-full bg-[#E6F2EE] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">
                  {String(activeSlide + 1).padStart(2, "0")} / {String(featuredSlides.length).padStart(2, "0")}
                </span>
              </div>

              <div className="relative flex flex-1 items-center py-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, y: 9 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="w-full"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="inline-flex rounded-full bg-[#F7F9F8] px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-[#4A5D56] dark:bg-[#101D17] dark:text-[#B4C5BC]">
                        {currentSlide.eyebrow}
                      </span>
                      <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl bg-[#E6F2EE] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">
                        <SlideIcon size={29} strokeWidth={1.65} />
                      </div>
                    </div>
                    <h2 className="max-w-[18rem] text-[22px] font-extrabold leading-[1.12] tracking-tight text-[#13221D] dark:text-[#E8F0EB] sm:text-2xl">
                      {currentSlide.title}
                    </h2>
                    <p className="mt-2 max-w-[19rem] text-xs leading-5 text-[#4A5D56] dark:text-[#B4C5BC]">
                      {currentSlide.description}
                    </p>
                    <Link
                      href={currentSlide.href}
                      className="marketplace-button mt-4 inline-flex min-h-10 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                    >
                      {currentSlide.action}
                      <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between border-t border-[#E2E8E5] pt-3 dark:border-[#2A4136]">
                <div className="flex items-center gap-1.5" aria-label="Choose featured slide">
                  {featuredSlides.map((slide, index) => (
                    <button
                      key={slide.eyebrow}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
                      aria-current={activeSlide === index ? "true" : undefined}
                      className={`h-2 rounded-full transition-all ${activeSlide === index ? "w-6 bg-[#1E5646] dark:bg-[#78B89C]" : "w-2 bg-[#D6E0DB] hover:bg-[#9DB5A9] dark:bg-[#385347] dark:hover:bg-[#628875]"}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <span className="mr-1 hidden text-[9px] font-medium text-[#4A5D56] dark:text-[#B4C5BC] sm:inline">
                    Auto rotate
                  </span>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    aria-label="Previous featured banner"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8E5] bg-white text-[#4A5D56] transition hover:bg-[#F7F9F8] dark:border-[#2A4136] dark:bg-[#14231C] dark:text-[#D4E2DA] dark:hover:bg-[#20362B]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    aria-label="Next featured banner"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8E5] bg-white text-[#4A5D56] transition hover:bg-[#F7F9F8] dark:border-[#2A4136] dark:bg-[#14231C] dark:text-[#D4E2DA] dark:hover:bg-[#20362B]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Link
            href="/search?listingType=RENT"
            className="group flex min-h-[154px] items-center justify-between gap-4 rounded-3xl border border-[#E2E8E5] bg-white p-5 shadow-[0_2px_8px_rgba(19,34,29,0.035)] transition hover:border-[#C8D6D0] hover:shadow-[0_4px_12px_rgba(19,34,29,0.055)] dark:border-[#2A4136] dark:bg-[#14231C] dark:hover:border-[#3C5D4D] lg:min-h-0"
          >
            <div className="relative z-10">
              <span className="inline-flex rounded-full bg-[#E6F2EE] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">Rent</span>
              <h2 className="mt-3 text-lg font-bold text-[#13221D] dark:text-[#E8F0EB]">Rent it. Return it.</h2>
              <p className="mt-1 text-xs leading-5 text-[#4A5D56] dark:text-[#B4C5BC]">Cycles, coolers and hostel essentials.</p>
              <span className="marketplace-button-outline mt-4 min-h-9 rounded-lg px-3 py-2 text-xs font-bold">
                Browse rentals <ArrowRight size={13} />
              </span>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F7F9F8] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">
              <Bike size={31} strokeWidth={1.6} />
            </div>
          </Link>

          <Link
            href={!user ? "/login?redirect=/sell" : "/sell"}
            className="group flex min-h-[154px] items-center justify-between gap-4 rounded-3xl border border-[#E2E8E5] bg-white p-5 shadow-[0_2px_8px_rgba(19,34,29,0.035)] transition hover:border-[#C8D6D0] hover:shadow-[0_4px_12px_rgba(19,34,29,0.055)] dark:border-[#2A4136] dark:bg-[#14231C] dark:hover:border-[#3C5D4D] lg:min-h-0"
          >
            <div className="relative z-10">
              <span className="inline-flex rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#92400E] dark:bg-[#493A1D] dark:text-[#F2D28C]">Make room</span>
              <h2 className="mt-3 text-lg font-bold text-[#13221D] dark:text-[#E8F0EB]">Pass it on.</h2>
              <p className="mt-1 text-xs leading-5 text-[#4A5D56] dark:text-[#B4C5BC]">Give useful things a second campus life.</p>
              <span className="marketplace-button-outline mt-4 min-h-9 rounded-lg px-3 py-2 text-xs font-bold">
                Start selling <ArrowRight size={13} />
              </span>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E6F2EE] text-[#1E5646] dark:bg-[#20362B] dark:text-[#91CDB0]">
              <Package size={31} strokeWidth={1.6} />
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 px-1 text-[11px] font-medium text-[#4A5D56] dark:text-[#B4C5BC] sm:text-xs">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#1E5646] dark:text-[#91CDB0]" /> Campus-focused community</span>
        <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-[#1E5646] dark:text-[#91CDB0]" /> Student-to-student exchange</span>
        <span className="inline-flex items-center gap-1.5"><RefreshCw size={14} className="text-[#1E5646] dark:text-[#91CDB0]" /> Buy, sell, rent and exchange</span>
      </div>
    </section>
  );
}
