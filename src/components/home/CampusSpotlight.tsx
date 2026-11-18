"use client";

import { useEffect, useState } from "react";
import CampusAdCarousel, { type CampusAdSlide } from "@/components/home/CampusAdCarousel";

// These campaigns render immediately, so the homepage never waits for the ads database
// before it has something useful and visual to show.
const featuredCampaigns: CampusAdSlide[] = [
  {
    id: "exown-tech",
    sponsorName: "ExOwn Marketplace",
    title: "Your next upgrade costs less.",
    description: "Discover student-friendly laptops, phones and everyday tech from campus sellers.",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=88",
    linkUrl: "/search?category=computers-laptops",
    cta: "Explore tech deals",
    isSponsored: false,
  },
  {
    id: "exown-housing",
    sponsorName: "ExOwn Housing",
    title: "A better room. A better semester.",
    description: "Find PGs, rooms and student-friendly stays near your campus.",
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=88",
    linkUrl: "/housing",
    cta: "Find your space",
    isSponsored: false,
  },
  {
    id: "exown-roommates",
    sponsorName: "ExOwn Roommate Finder",
    title: "Good spaces start with good people.",
    description: "Meet campus peers looking for a compatible roommate or flatmate.",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=88",
    linkUrl: "/roommates",
    cta: "Find roommates",
    isSponsored: false,
  },
  {
    id: "exown-rentals",
    sponsorName: "ExOwn Rentals",
    title: "Need it for a semester? Rent it.",
    description: "Cycles, appliances and useful hostel essentials without buying new.",
    imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=88",
    linkUrl: "/search?listingType=RENT",
    cta: "Browse rentals",
    isSponsored: false,
  },
  {
    id: "exown-moving-out",
    sponsorName: "ExOwn Campus Deals",
    title: "Moving out? Give good things a second life.",
    description: "Pass on furniture, books and useful essentials to another student.",
    imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=88",
    linkUrl: "/search?movingOut=true",
    cta: "Shop moving-out deals",
    isSponsored: false,
  },
  {
    id: "exown-travel",
    sponsorName: "ExOwn Travel",
    title: "Your next campus break starts here.",
    description: "Explore travel options for weekends, holidays and the journey home.",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=88",
    linkUrl: "/travel",
    cta: "Plan your trip",
    isSponsored: false,
  },
  {
    id: "exown-campus-news",
    sponsorName: "ExOwn Campus Updates",
    title: "Stay in the know. Stay in the loop.",
    description: "Catch useful updates, stories and announcements from your campus.",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=88",
    linkUrl: "/lpu-news",
    cta: "Read campus news",
    isSponsored: false,
  },
];

function isCampusAd(value: unknown): value is CampusAdSlide {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    typeof item.sponsorName === "string" &&
    typeof item.imageUrl === "string" &&
    typeof item.linkUrl === "string" &&
    typeof item.cta === "string" &&
    item.isSponsored === true
  );
}

export default function CampusSpotlight() {
  const [ads, setAds] = useState<CampusAdSlide[]>(featuredCampaigns);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSponsoredAds() {
      try {
        const response = await fetch("/api/ads?placement=HOMEPAGE", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const result: unknown = await response.json();
        if (!result || typeof result !== "object" || !("ads" in result)) return;

        const incoming = (result as { ads?: unknown }).ads;
        if (Array.isArray(incoming)) {
          const validAds = incoming.filter(isCampusAd);
          if (validAds.length > 0) setAds(validAds);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.warn("[CampusSpotlight] Keeping featured campaigns; sponsored ads could not be loaded.");
        }
      }
    }

    void loadSponsoredAds();
    return () => controller.abort();
  }, []);

  return <CampusAdCarousel ads={ads} />;
}
