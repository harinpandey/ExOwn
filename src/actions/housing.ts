"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { resolveCampusId } from "@/lib/campus";
import { requireUser } from "@/lib/auth";

export interface HousingFilterParams {
  campus?: string;
  type?: string;
  minRent?: number;
  maxRent?: number;
  gender?: string;
  amenities?: string[];
}

/**
 * Public housing discovery is deliberately campus-scoped and LIVE-only.
 * Empty/error results stay empty; demo listings must never look like genuine
 * student housing or expose invented owner contact information.
 */
export async function getHousingListings(params: HousingFilterParams = {}) {
  try {
    if (!process.env.DATABASE_URL) return [];

    const campusId = await resolveCampusId(params.campus);
    if (!campusId) return [];

    const where: any = {
      status: "LIVE",
      campusId,
    };

    if (params.type && params.type !== "ALL") {
      where.type = params.type;
    }

    if (params.minRent !== undefined || params.maxRent !== undefined) {
      where.monthlyRent = {};
      if (params.minRent !== undefined) where.monthlyRent.gte = params.minRent;
      if (params.maxRent !== undefined) where.monthlyRent.lte = params.maxRent;
    }

    if (params.gender && params.gender !== "ANY") {
      where.OR = [
        { preferredGender: params.gender },
        { preferredGender: "ANY" },
        { preferredGender: null },
      ];
    }

    if (params.amenities?.length) {
      where.amenities = { hasEvery: params.amenities };
    }

    const listings = await withRetry(() =>
      prisma.housingListing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          campus: { select: { name: true, slug: true } },
          owner: { select: { name: true, trustScore: true, isVerified: true } },
        },
      })
    );

    return listings.map((listing) => ({
      ...listing,
      distance: "Campus area",
    }));
  } catch (error) {
    console.error("[Action:getHousingListings] Failed to fetch campus housing:", error);
    return [];
  }
}


/**
 * Reveal a housing owner's phone only after an authenticated member explicitly
 * requests it. Public housing results never contain the owner's phone number.
 */
export async function revealHousingOwnerPhone(listingId: string) {
  try {
    await requireUser();

    const listing = await prisma.housingListing.findFirst({
      where: { id: listingId, status: "LIVE" },
      select: { owner: { select: { phone: true } } },
    });

    if (!listing) return { success: false, error: "Housing listing not found." };

    const phone = listing.owner.phone?.trim();
    if (!phone) return { success: false, error: "The owner has not added a contact number." };

    return { success: true, phone };
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return { success: false, error: "Sign in to view the owner's contact number." };
    }
    console.error("[Action:revealHousingOwnerPhone] Failed to reveal contact:", error);
    return { success: false, error: "Unable to load the owner's contact number." };
  }
}
