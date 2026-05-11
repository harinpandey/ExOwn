"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";
import { createNotification } from "@/actions/notification";
import { ExchangeStatus } from "@prisma/client";

export async function createExchangeOffer(data: {
  productId: string;
  buyerId: string;
  offeredTitle: string;
  offeredDescription: string;
  offeredImages: string[];
  cashDifference?: number;
}) {
  try {
    const { productId, buyerId, offeredTitle, offeredDescription, offeredImages, cashDifference } = data;

    // 1. Validation
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true, isExchangeAllowed: true, title: true }
    });

    if (!product) throw new Error("Product not found");
    if (product.sellerId === buyerId) throw new Error("Cannot exchange with yourself");
    if (!product.isExchangeAllowed) throw new Error("Exchange not allowed for this listing");

    // 2. Create Offer
    const offer = await withRetry(() => prisma.exchangeOffer.create({
      data: {
        productId,
        buyerId,
        offeredTitle,
        offeredDescription,
        offeredImages,
        cashDifference,
      }
    }));

    // 3. Notify Seller
    await createNotification({
      userId: product.sellerId,
      title: "New Exchange Proposal! ♻️",
      content: `Someone wants to trade their "${offeredTitle}" for your "${product.title}".`,
      type: "EXCHANGE_OFFER",
      link: `/requests?tab=exchanges&offerId=${offer.id}`
    });

    // 4. Log Activity
    await logActivity({
      userId: buyerId,
      actionType: "EXCHANGE_PROPOSAL_SENT",
      productId,
      metadata: { offerId: offer.id }
    });

    return { success: true, offer };
  } catch (err: any) {
    console.error("Exchange creation error:", err);
    return { success: false, error: err.message };
  }
}

export async function respondToExchangeOffer(userId: string, offerId: string, status: ExchangeStatus) {
  try {
    const offer = await prisma.exchangeOffer.findUnique({
      where: { id: offerId },
      include: { product: true }
    });

    if (!offer) throw new Error("Offer not found");
    if (offer.product.sellerId !== userId) throw new Error("Unauthorized");

    // 1. Update Status
    await withRetry(() => prisma.exchangeOffer.update({
      where: { id: offerId },
      data: { status }
    }));

    // 2. Notify Buyer
    const statusLabels = {
      ACCEPTED: "ACCEPTED ✅",
      REJECTED: "DECLINED ❌",
      COUNTERED: "COUNTERED 🔄",
      COMPLETED: "COMPLETED 🎉",
      PENDING: "PENDING ⏳"
    };

    await createNotification({
      userId: offer.buyerId,
      title: `Exchange Update: ${statusLabels[status]}`,
      content: `Your proposal for "${offer.product.title}" has been ${status.toLowerCase()}.`,
      type: "EXCHANGE_UPDATE",
      link: `/requests?tab=sent_exchanges`
    });

    // 3. Log Activity
    await logActivity({
      userId,
      actionType: `EXCHANGE_PROPOSAL_${status}`,
      productId: offer.productId,
      metadata: { offerId }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Exchange response error:", err);
    return { success: false, error: err.message };
  }
}

export async function getExchangeOffers(userId: string, type: "SENT" | "RECEIVED") {
  try {
    if (type === "SENT") {
      return await prisma.exchangeOffer.findMany({
        where: { buyerId: userId },
        include: { product: true },
        orderBy: { createdAt: "desc" }
      });
    } else {
      return await prisma.exchangeOffer.findMany({
        where: { product: { sellerId: userId } },
        include: { product: true, buyer: true },
        orderBy: { createdAt: "desc" }
      });
    }
  } catch (err) {
    console.error("Error fetching exchange offers:", err);
    return [];
  }
}
