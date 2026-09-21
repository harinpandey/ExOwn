"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSameUser } from "@/lib/auth";
import { sanitizeString, validateLength, validateRange } from "@/lib/validation";

export async function createBuyingRequest(userId: string, data: {
  title: string;
  description: string;
  budget?: number;
  category?: string;
  listingType?: "SELL" | "RENT" | "SERVICE";
}) {
  try {
    await requireSameUser(userId);

    const title = sanitizeString(data.title);
    const description = sanitizeString(data.description);
    const category = data.category ? sanitizeString(data.category) : undefined;
    const budget = data.budget === undefined ? undefined : Number(data.budget);

    if (!validateLength(title, 3, 120)) {
      return { success: false, error: "Request title must be between 3 and 120 characters." };
    }
    if (!validateLength(description, 10, 1500)) {
      return { success: false, error: "Request description must be between 10 and 1500 characters." };
    }
    if (budget !== undefined && !validateRange(budget, 1, 1000000)) {
      return { success: false, error: "Budget must be between ₹1 and ₹1,000,000." };
    }

    const request = await withRetry(() => prisma.buyingRequest.create({
      data: {
        userId,
        title,
        description,
        budget,
        category,
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
    await requireSameUser(userId);

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
