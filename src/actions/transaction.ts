"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";
import { requireSameUser } from "@/lib/auth";

export async function createTransactionRecord(data: {
  buyerId: string;
  sellerId: string;
  productId?: string;
  type: "SALE" | "RENT" | "SERVICE" | "EXCHANGE";
  source?: "DIRECT" | "ORDER" | "OFFER" | "RENTAL" | "EXCHANGE" | "SERVICE_QUOTE";
  amount?: number;
  orderId?: string;
  rentalId?: string;
  offerId?: string;
  exchangeOfferId?: string;
}) {
  try {
    const currentUser = await requireSameUser(data.buyerId).catch(async (buyerError) => {
      try {
        return await requireSameUser(data.sellerId);
      } catch {
        throw buyerError;
      }
    });

    const record = await withRetry(() => prisma.transactionRecord.create({
      data: {
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        productId: data.productId,
        orderId: data.orderId,
        rentalId: data.rentalId,
        offerId: data.offerId,
        exchangeOfferId: data.exchangeOfferId,
        source: data.source || "DIRECT",
        type: data.type,
        status: "PENDING",
        amount: data.amount,
        metadata: { createdBy: currentUser.uid },
      }
    }));
    return { success: true, recordId: record.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateTransactionStatus(recordId: string, userId: string, status: "COMPLETED" | "CANCELLED" | "NO_RESPONSE") {
  try {
    await requireSameUser(userId);

    const record = await prisma.transactionRecord.findUnique({
      where: { id: recordId }
    });

    if (!record) return { success: false, error: "Record not found" };
    if (record.buyerId !== userId && record.sellerId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const isBuyer = record.buyerId === userId;
    const nextData: any = {
      status,
      ...(isBuyer ? { confirmedByBuyer: status === "COMPLETED" } : { confirmedBySeller: status === "COMPLETED" }),
    };

    if (status === "COMPLETED") {
      nextData.completedAt = new Date();
      nextData.reportWindowEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    if (status === "CANCELLED" || status === "NO_RESPONSE") {
      nextData.cancelledAt = new Date();
    }

    await prisma.transactionRecord.update({
      where: { id: recordId },
      data: nextData
    });

    // Update Seller Success Rate
    if (status === "COMPLETED") {
      await updateSellerMetrics(record.sellerId);
    }

    await logActivity({
      userId,
      actionType: "PROFILE_UPDATED", // Generic for now, or add TRANSACTION_UPDATED
      metadata: { recordId, status },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function updateSellerMetrics(sellerId: string) {
  try {
    const records = await prisma.transactionRecord.findMany({
      where: { sellerId }
    });

    const total = records.length;
    const completed = records.filter(r => r.status === "COMPLETED").length;
    const successRate = total > 0 ? (completed / total) * 100 : 0;

    await prisma.profile.update({
      where: { userId: sellerId },
      data: {
        successfulDeals: completed,
        successRate: successRate,
      }
    });

    // Also trigger trust score recalculation
    const { calculateTrustScore } = await import("./trust");
    await calculateTrustScore(sellerId);
  } catch (err) {
    console.error("Failed to update seller metrics:", err);
  }
}
