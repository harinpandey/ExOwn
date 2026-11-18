"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AdPlacement } from "@prisma/client";

export type AdminAdInput = {
  title: string;
  sponsorName: string;
  imageUrl: string;
  linkUrl: string;
  placement: "HOMEPAGE" | "CATEGORY" | "SEARCH";
  startDate: string;
  endDate: string;
};

function validImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function validDestination(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function getAdminAds() {
  await requireAdmin();
  return withRetry(() =>
    prisma.ad.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        sponsorName: true,
        imageUrl: true,
        linkUrl: true,
        placement: true,
        isActive: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    })
  );
}

export async function createAdminAd(input: AdminAdInput) {
  await requireAdmin();

  const title = input.title.trim().slice(0, 90);
  const sponsorName = input.sponsorName.trim().slice(0, 60);
  const imageUrl = input.imageUrl.trim();
  const linkUrl = input.linkUrl.trim();
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  if (!title || !sponsorName) {
    return { success: false as const, error: "Add a campaign title and sponsor name." };
  }
  if (!validImageUrl(imageUrl)) {
    return { success: false as const, error: "Use a valid public HTTPS image URL." };
  }
  if (!validDestination(linkUrl)) {
    return { success: false as const, error: "Use an internal path or a valid HTTP/HTTPS destination." };
  }
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
    return { success: false as const, error: "Check the campaign start and end dates." };
  }
  if (!["HOMEPAGE", "CATEGORY", "SEARCH"].includes(input.placement)) {
    return { success: false as const, error: "Choose a valid ad placement." };
  }

  try {
    const ad = await withRetry(() =>
      prisma.ad.create({
        data: {
          title,
          sponsorName,
          imageUrl,
          linkUrl,
          placement: input.placement as AdPlacement,
          startDate,
          endDate,
          // New banners stay off until an admin reviews the live preview and activates them.
          isActive: false,
        },
        select: {
          id: true,
          title: true,
          sponsorName: true,
          imageUrl: true,
          linkUrl: true,
          placement: true,
          isActive: true,
          startDate: true,
          endDate: true,
          createdAt: true,
        },
      })
    );

    revalidatePath("/");
    revalidatePath("/admin/ads");
    return {
      success: true as const,
      ad: {
        ...ad,
        startDate: ad.startDate.toISOString(),
        endDate: ad.endDate.toISOString(),
        createdAt: ad.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[AdminAds] Create failed:", error);
    return { success: false as const, error: "Could not save the banner. Check the database connection and try again." };
  }
}

export async function toggleAdminAd(id: string, isActive: boolean) {
  await requireAdmin();
  if (!id || id.length > 100) {
    return { success: false as const, error: "Invalid ad identifier." };
  }

  try {
    const ad = await withRetry(() =>
      prisma.ad.update({
        where: { id },
        data: { isActive },
        select: { id: true, isActive: true, placement: true },
      })
    );
    revalidatePath("/");
    revalidatePath("/admin/ads");
    return { success: true as const, ad };
  } catch (error) {
    console.error("[AdminAds] Status update failed:", error);
    return { success: false as const, error: "Could not update this banner." };
  }
}
