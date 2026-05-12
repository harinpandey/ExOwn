"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";

export async function createTransactionRecord(data: {
  buyerId: string;
  sellerId: string;
  productId?: string;
  type: "SALE" | "RENT" | "SERVICE";
}) {
  try {
    const record = await withRetry(() => prisma.transactionRecord.create({
      data: {
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        productId: data.productId,
        type: data.type,
        status: "PENDING",
      }
    }));
    return { success: true, recordId: record.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateTransactionStatus(recordId: string, userId: string, status: "COMPLETED" | "CANCELLED" | "NO_RESPONSE") {
  try {
    const record = await prisma.transactionRecord.findUnique({
      where: { id: recordId }
    });

    if (!record) return { success: false, error: "Record not found" };
    if (record.buyerId !== userId && record.sellerId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.transactionRecord.update({
      where: { id: recordId },
      data: { status }
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
