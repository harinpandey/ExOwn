"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sanitizeString } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function getPublicSellerReviews(sellerId: string) {
  try {
    const rows = await withRetry(() => prisma.sellerReview.findMany({
      where: { sellerId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        author: { select: { id: true, name: true, image: true } },
        transactionRecord: { select: { product: { select: { title: true } } } },
      },
    }));
    const [total, aggregate] = await Promise.all([
      prisma.sellerReview.count({ where: { sellerId } }),
      prisma.sellerReview.aggregate({ where: { sellerId }, _avg: { rating: true } }),
    ]);
    const average = aggregate._avg.rating || 0;
    return { reviews: rows, total, average };
  } catch (error) {
    console.error("[Reviews] Could not load seller reviews:", error);
    return { reviews: [], total: 0, average: 0 };
  }
}

export async function getReviewableTransactions() {
  try {
    const actor = await requireUser();
    return await withRetry(() => prisma.transactionRecord.findMany({
      where: {
        buyerId: actor.uid,
        status: "COMPLETED",
        confirmedByBuyer: true,
        confirmedBySeller: true,
        review: null,
      },
      orderBy: { completedAt: "desc" },
      select: {
        id: true,
        sellerId: true,
        product: { select: { title: true } },
        seller: { select: { name: true } },
      },
      take: 20,
    }));
  } catch {
    return [];
  }
}

export async function submitSellerReview(transactionRecordId: string, rating: number, comment: string) {
  try {
    const actor = await requireUser();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { success: false, error: "Choose a rating from 1 to 5 stars." };
    }
    const cleanComment = sanitizeString(comment || "").trim();
    if (cleanComment.length > 1000) {
      return { success: false, error: "Review must be 1,000 characters or less." };
    }

    const transaction = await prisma.transactionRecord.findUnique({
      where: { id: transactionRecordId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        status: true,
        confirmedByBuyer: true,
        confirmedBySeller: true,
      },
    });
    if (!transaction || transaction.buyerId !== actor.uid) {
      return { success: false, error: "Only the buyer in this transaction can leave this review." };
    }
    if (transaction.status !== "COMPLETED" || !transaction.confirmedByBuyer || !transaction.confirmedBySeller) {
      return { success: false, error: "Reviews unlock after both buyer and seller confirm the deal is completed." };
    }

    await withRetry(() => prisma.sellerReview.create({
      data: {
        transactionRecordId,
        authorId: actor.uid,
        sellerId: transaction.sellerId,
        rating,
        comment: cleanComment || null,
      },
    }));

    const aggregate = await prisma.sellerReview.aggregate({
      where: { sellerId: transaction.sellerId },
      _avg: { rating: true },
    });
    await prisma.profile.upsert({
      where: { userId: transaction.sellerId },
      update: { rating: aggregate._avg.rating || 0 },
      create: { userId: transaction.sellerId, rating: aggregate._avg.rating || 0 },
    });

    revalidatePath("/profile/" + transaction.sellerId);
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, error: "You have already reviewed this completed deal." };
    }
    console.error("[Reviews] Could not submit review:", error);
    return { success: false, error: "Review could not be submitted. Please try again." };
  }
}
