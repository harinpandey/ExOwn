"use server";

import prisma from "@/lib/prisma";
import { requireSameUser } from "@/lib/auth";
import { resolveCampusId } from "@/lib/campus";

export async function trackActivity(userId: string, type: string, entityId?: string, metadata?: any) {
  try {
    const actor = await requireSameUser(userId);
    userId = actor.uid;
    // Increment product views if it's a VIEWED activity
    if (type === "VIEWED" && entityId) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const alreadyViewed = await prisma.userActivity.findFirst({
        where: {
          userId,
          type: "VIEWED",
          entityId,
          createdAt: { gte: twentyFourHoursAgo }
        }
      });

      if (!alreadyViewed) {
        await prisma.product.update({
          where: { id: entityId },
          data: { views: { increment: 1 } }
        });
      }
    }

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

export async function getRecentlyViewed(userId: string, campus: string, limit: number = 4) {
  try {
    const viewer = await requireSameUser(userId);
    const campusId = await resolveCampusId(campus);
    if (!campusId) return [];

    const activities = await prisma.userActivity.findMany({
      where: {
        userId: viewer.uid,
        type: "VIEWED",
        entityId: { not: null }
      },
      orderBy: { createdAt: "desc" },
      take: limit * 2,
      distinct: ["entityId"],
    });

    const productIds = activities.map((activity) => activity.entityId!).filter(Boolean);
    if (productIds.length === 0) return [];

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: "LIVE",
        campusId,
      },
      include: {
        seller: {
          select: { isVerified: true }
        }
      }
    });

    return productIds
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching recently viewed:", error);
    return [];
  }
}
