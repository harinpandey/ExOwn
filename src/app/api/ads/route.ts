import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get("placement") || "HOMEPAGE";

  // Only the homepage placement is currently rendered by the public carousel.
  if (placement !== "HOMEPAGE") {
    return NextResponse.json(
      { ads: [] },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  try {
    const now = new Date();
    const activeAds = await prisma.ad.findMany({
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
    });

    const ads = activeAds.map((ad) => ({
      id: ad.id,
      title: ad.title,
      description: `Discover this offer from ${ad.sponsorName || "our campus partner"}.`,
      sponsorName: ad.sponsorName || "Campus partner",
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      cta: "Learn more",
      isSponsored: true,
    }));

    return NextResponse.json(
      { ads },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    // A missing or slow ads database must never blank the homepage promotion area.
    console.error("[PublicAds] Failed to load homepage campaigns:", error);
    return NextResponse.json(
      { ads: [] },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
