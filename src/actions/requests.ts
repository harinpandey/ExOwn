"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBuyingRequest(userId: string, data: {
  title: string;
  description: string;
  budget?: number;
  category?: string;
  listingType?: "SELL" | "RENT" | "SERVICE";
}) {
  try {
    const request = await withRetry(() => prisma.buyingRequest.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        budget: data.budget,
        category: data.category,
        listingType: data.listingType || "SELL",
      }
    }));

    revalidatePath("/requests");
    return { success: true, request };
  } catch (err: any) {
    console.error("Error creating buying request:", err);
    return { success: false, error: err.message };
  }
}

export async function getBuyingRequests(limit = 20) {
  try {
    return await prisma.buyingRequest.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            verificationLevel: true,
            trustScore: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (err) {
    console.error("Error fetching buying requests:", err);
    return [];
  }
}

export async function toggleRequestStatus(requestId: string, userId: string, isActive: boolean) {
  try {
    await prisma.buyingRequest.update({
      where: { id: requestId, userId },
      data: { isActive }
    });
    revalidatePath("/requests");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
