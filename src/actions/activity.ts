"use server";

import prisma from "@/lib/prisma";

export async function trackActivity(userId: string, type: string, entityId?: string, metadata?: any) {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        type,
        entityId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      }
    });
    return { success: true };
  } catch (err) {
    console.error("Error tracking activity:", err);
    return { success: false };
  }
}

export async function getRecentlyViewed(userId: string, limit: number = 4) {
  try {
    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
        type: "VIEWED",
        entityId: { not: null }
      },
      orderBy: { createdAt: "desc" },
      take: limit * 2, // Fetch more to filter duplicates
      distinct: ["entityId"],
      include: {
        // We can't directly include 'product' because activity is generic, 
        // so we fetch product details separately if needed or use entityId.
      }
    });

    const productIds = activities.map(a => a.entityId!).filter(Boolean);
    if (productIds.length === 0) return [];

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: "LIVE"
      },
      include: {
        seller: {
          select: { isVerified: true }
        }
      }
    });

    // Re-sort to match activity order
    return productIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean)
      .slice(0, limit);

  } catch (err) {
    console.error("Error fetching recently viewed:", err);
    return [];
  }
}
