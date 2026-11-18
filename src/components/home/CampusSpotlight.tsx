import prisma, { withRetry } from "@/lib/prisma";
import CampusAdCarousel, { type CampusAdSlide } from "@/components/home/CampusAdCarousel";

const fallbackCampaigns: CampusAdSlide[] = [
  {
    id: "exown-tech",
    sponsorName: "ExOwn Marketplace",
    title: "Student tech, smarter prices.",
    description: "Explore laptops, phones, accessories and pre-owned gadgets from campus sellers.",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85",
    linkUrl: "/search?category=computers-laptops",
    cta: "Explore tech deals",
    isSponsored: false,
  },
  {
    id: "exown-housing",
    sponsorName: "ExOwn Housing",
    title: "Find your campus home.",
    description: "Browse PGs, rooms and student-friendly stays around your university.",
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85",
    linkUrl: "/housing",
    cta: "Browse housing",
    isSponsored: false,
  },
  {
    id: "exown-rentals",
    sponsorName: "ExOwn Rentals",
    title: "Rent what you need.",
    description: "From cycles to hostel essentials, find useful things for the semester.",
    imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=85",
    linkUrl: "/search?listingType=RENT",
    cta: "Explore rentals",
    isSponsored: false,
  },
  {
    id: "exown-moving-out",
    sponsorName: "ExOwn Campus Deals",
    title: "Moving out? Pass it on.",
    description: "Give your useful items a second campus life and make room for what's next.",
    imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
    linkUrl: "/search?movingOut=true",
    cta: "See moving-out deals",
    isSponsored: false,
  },
  {
    id: "exown-travel",
    sponsorName: "ExOwn Travel",
    title: "Make the next break count.",
    description: "Find useful options for your next train, bus or flight journey.",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
    linkUrl: "/travel",
    cta: "Plan your trip",
    isSponsored: false,
  },
];

export default async function CampusSpotlight() {
  let ads: CampusAdSlide[] = [];

  try {
    const now = new Date();
    const activeAds = await withRetry(() =>
      prisma.ad.findMany({
        where: {
          isActive: true,
          placement: "HOMEPAGE",
          startDate: { lte: now },
          endDate: { gte: now },
        },
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          linkUrl: true,
          sponsorName: true,
        },
      })
    );

    ads = activeAds.map((ad) => ({
      id: ad.id,
      title: ad.title,
      description: `Discover this sponsored offer from ${ad.sponsorName || "our campus partner"}.`,
      sponsorName: ad.sponsorName || "Campus partner",
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      cta: "Learn more",
      isSponsored: true,
    }));
  } catch (error) {
    console.error("[CampusSpotlight] Could not load live ad inventory:", error);
  }

  // Keep the placement useful even when ad inventory is empty or the database is offline.
  return <CampusAdCarousel ads={ads.length ? ads : fallbackCampaigns} />;
}
