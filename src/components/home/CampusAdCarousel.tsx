"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, Megaphone } from "lucide-react";

export interface CampusAdSlide {
  id: string;
  title: string;
  description: string;
  sponsorName: string;
  imageUrl: string;
  linkUrl: string;
  cta: string;
  isSponsored: boolean;
}

function getSafeLink(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "/search";
  } catch {
    return "/search";
  }
}

function AdCard({ ad, eager = false }: { ad: CampusAdSlide; eager?: boolean }) {
  const safeLink = getSafeLink(ad.linkUrl);
  const isExternal = safeLink.startsWith("https://") || safeLink.startsWith("http://");
  const content = (
    <article className="group relative isolate flex h-[240px] w-[min(580px,88vw)] shrink-0 snap-start overflow-hidden rounded-[22px] border border-[#E2E8E5] bg-[#14231C] shadow-[0_2px_10px_rgba(19,34,29,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(19,34,29,0.12)] sm:h-[270px] sm:w-[min(580px,45vw)]">
      {ad.imageUrl ? (
        <img
          src={ad.imageUrl}
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
      ) : null}
      <div className="campus-ad-overlay absolute inset-0 z-10" />
      <div className="relative z-20 flex h-full w-full flex-col items-start justify-between p-5 text-white sm:p-6">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
              <Megaphone size={13} />
              <span className="truncate">{ad.sponsorName || "ExOwn"}</span>
            </div>
            <span className="mt-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
              {ad.isSponsored ? "Sponsored" : "Featured"}
            </span>
          </div>
          {ad.isSponsored && (
            <span className="shrink-0 rounded-md border border-white/25 bg-black/20 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white/90">
              AD
            </span>
          )}
        </div>

        <div className="max-w-[76%]">
          <h3 className="line-clamp-2 text-[23px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[27px]">
            {ad.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-white/80 sm:text-[13px]">
            {ad.description}
          </p>
          <span className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-[#1E5646] transition group-hover:bg-[#E6F2EE]">
            {ad.cta}
            {isExternal ? <ExternalLink size={13} /> : <ArrowRight size={13} />}
          </span>
        </div>
      </div>
    </article>
  );

  if (/^https?:\/\//i.test(ad.linkUrl)) {
    return <a href={safeLink} target="_blank" rel="noopener noreferrer" className="block">{content}</a>;
  }

  return <Link href={safeLink} className="block">{content}</Link>;
}

export default function CampusAdCarousel({ ads }: { ads: CampusAdSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    const child = track?.children.item(index) as HTMLElement | null;
    if (!track || !child) return;
    track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  }, []);

  const next = useCallback(() => {
    if (!ads.length) return;
    scrollToIndex((activeIndex + 1) % ads.length);
  }, [activeIndex, ads.length, scrollToIndex]);

  const previous = useCallback(() => {
    if (!ads.length) return;
    scrollToIndex((activeIndex - 1 + ads.length) % ads.length);
  }, [activeIndex, ads.length, scrollToIndex]);

  useEffect(() => {
    if (isPaused || ads.length < 2) return;
    const timer = window.setInterval(next, 5600);
    return () => window.clearInterval(timer);
  }, [ads.length, isPaused, next]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || !track.children.length) return;
    const first = track.children[0] as HTMLElement;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "16") || 16;
    const step = first.getBoundingClientRect().width + gap;
    if (step > 0) {
      setActiveIndex(Math.min(ads.length - 1, Math.max(0, Math.round(track.scrollLeft / step))));
    }
  };

  if (!ads.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8" aria-label="Campus advertisements">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#4A5D56] dark:text-[#B4C5BC]">
            <span className="h-2 w-2 rounded-full bg-[#1E5646] dark:bg-[#91CDB0]" />
            Featured on ExOwn
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#13221D] dark:text-[#E8F0EB] sm:text-2xl">
            Good things are happening on campus.
          </h2>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="mr-1 text-[10px] font-semibold text-[#4A5D56] dark:text-[#B4C5BC]">More to explore</span>
          <button
            type="button"
            onClick={previous}
            aria-label="Previous campus ad"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8E5] bg-white text-[#1E5646] transition hover:bg-[#E6F2EE] dark:border-[#2A4136] dark:bg-[#14231C] dark:text-[#91CDB0] dark:hover:bg-[#20362B]"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next campus ad"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8E5] bg-white text-[#1E5646] transition hover:bg-[#E6F2EE] dark:border-[#2A4136] dark:bg-[#14231C] dark:text-[#91CDB0] dark:hover:bg-[#20362B]"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false);
        }}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-3"
        role="region"
        aria-roledescription="carousel"
        aria-label="Sponsored and featured campus banners"
      >
        {ads.map((ad, index) => <AdCard key={ad.id} ad={ad} eager={index < 2} />)}
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5" aria-label="Choose an ad">
        {ads.map((ad, index) => (
          <button
            key={ad.id}
            type="button"
            onClick={() => scrollToIndex(index)}
            aria-label={`Show banner ${index + 1}`}
            aria-current={activeIndex === index ? "true" : undefined}
            className={`h-2 rounded-full transition-all ${activeIndex === index ? "w-6 bg-[#1E5646] dark:bg-[#91CDB0]" : "w-2 bg-[#D5DFDA] hover:bg-[#9CB2A7] dark:bg-[#385347]"}`}
          />
        ))}
      </div>
    </section>
  );
}
