"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { logActivity, type ActivityAction } from "@/lib/logger";
import { createNotification } from "@/actions/notification";
import { ExchangeStatus } from "@prisma/client";
import { requireSameUser } from "@/lib/auth";
import { sanitizeString, validateLength, validateRange } from "@/lib/validation";

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
    const actor = await requireSameUser(buyerId);
    const canonicalBuyerId = actor.uid;

    // 1. Validation & Sanitization
    const title = sanitizeString(offeredTitle);
    const description = sanitizeString(offeredDescription);

    if (!validateLength(title, 3, 100)) {
      throw new Error("Title must be between 3 and 100 characters.");
    }
    if (!validateLength(description, 10, 1000)) {
      throw new Error("Description must be between 10 and 1000 characters.");
    }
    if (!offeredImages || offeredImages.length === 0) {
      throw new Error("At least one image is required");
    }
    if (offeredImages.length > 5) {
      throw new Error("You can upload up to 5 exchange images");
    }
    for (const img of offeredImages) {
      if (typeof img !== 'string' || !img.startsWith("http")) {
        throw new Error("Invalid image URL format.");
      }
    }

    const cleanCashDifference = cashDifference === undefined || cashDifference === null ? undefined : Number(cashDifference);
    if (cleanCashDifference !== undefined && !validateRange(cleanCashDifference, 0, 1000000)) {
      throw new Error("Cash difference must be between ₹0 and ₹1,000,000.");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true, isExchangeAllowed: true, title: true, status: true, inventory: true }
    });

    if (!product) throw new Error("Product not found");
    if (product.sellerId === canonicalBuyerId) throw new Error("Cannot exchange with yourself");
    if (product.status !== "LIVE" || product.inventory < 1) throw new Error("This listing is no longer available");
    if (!product.isExchangeAllowed) throw new Error("Exchange not allowed for this listing");

    const existingPendingOffer = await prisma.exchangeOffer.findFirst({
      where: { productId, buyerId: canonicalBuyerId, status: "PENDING" },
      select: { id: true },
    });
    if (existingPendingOffer) {
      throw new Error("You already have a pending exchange proposal for this listing.");
    }

    // 2. Create Offer
    const offer = await withRetry(() => prisma.exchangeOffer.create({
      data: {
        productId,
        buyerId: canonicalBuyerId,
        offeredTitle: title,
        offeredDescription: description,
        offeredImages,
        cashDifference: cleanCashDifference,
      }
    }));

    // 3. Notify Seller
    await createNotification({
      userId: product.sellerId,
      title: "New Exchange Proposal! ♻️",
      content: `Someone wants to trade their "${title}" for your "${product.title}".`,
      type: "OFFER",
      link: "/profile?tab=exchanges&view=RECEIVED"
    });

    // 4. Log Activity
    await logActivity({
      userId: canonicalBuyerId,
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
    const actor = await requireSameUser(userId);

    const offer = await prisma.exchangeOffer.findUnique({
      where: { id: offerId },
      include: { product: true }
    });

    if (!offer) throw new Error("Offer not found");
    if (offer.product.sellerId !== actor.uid) throw new Error("Unauthorized");

    const allowedTransitions: Record<ExchangeStatus, ExchangeStatus[]> = {
      PENDING: ["ACCEPTED", "REJECTED", "COUNTERED"],
      ACCEPTED: ["COMPLETED"],
      COUNTERED: ["ACCEPTED", "REJECTED"],
      REJECTED: [],
      COMPLETED: [],
    };

    if (!allowedTransitions[offer.status].includes(status)) {
      throw new Error("Invalid exchange status transition");
    }

    // 1. Update Status
    await withRetry(() => prisma.$transaction(async (tx) => {
      const updated = await tx.exchangeOffer.updateMany({
        where: { id: offerId, status: offer.status },
        data: { status },
      });
      if (updated.count !== 1) {
        throw new Error("This exchange proposal has already been reviewed.");
      }

      if (status === "ACCEPTED") {
        await tx.transactionRecord.upsert({
          where: { exchangeOfferId: offerId },
          update: {
            buyerId: offer.buyerId,
            sellerId: actor.uid,
            productId: offer.productId,
            type: "EXCHANGE",
            source: "EXCHANGE",
            amount: offer.cashDifference,
          },
          create: {
            buyerId: offer.buyerId,
            sellerId: actor.uid,
            productId: offer.productId,
            exchangeOfferId: offerId,
            type: "EXCHANGE",
            source: "EXCHANGE",
            amount: offer.cashDifference,
          },
        });
      }

      if (status === "COMPLETED") {
        await tx.transactionRecord.updateMany({
          where: { exchangeOfferId: offerId },
          data: {
            status: "COMPLETED",
            confirmedBySeller: true,
            completedAt: new Date(),
            reportWindowEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
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
      type: "OFFER",
      link: "/profile?tab=exchanges&view=SENT"
    });

    // 3. Log Activity
    const activityActionByStatus: Record<ExchangeStatus, ActivityAction> = {
      PENDING: "EXCHANGE_PROPOSAL_PENDING",
      ACCEPTED: "EXCHANGE_PROPOSAL_ACCEPTED",
      REJECTED: "EXCHANGE_PROPOSAL_REJECTED",
      COUNTERED: "EXCHANGE_PROPOSAL_COUNTERED",
      COMPLETED: "EXCHANGE_PROPOSAL_COMPLETED",
    };
    await logActivity({
      userId: actor.uid,
      actionType: activityActionByStatus[status],
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
    const actor = await requireSameUser(userId);

    const baseSelect = {
      id: true,
      productId: true,
      buyerId: true,
      offeredTitle: true,
      offeredDescription: true,
      offeredImages: true,
      cashDifference: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          seller: { select: { id: true, name: true, image: true } },
        },
      },
      buyer: { select: { id: true, name: true, image: true } },
    } as const;

    if (type === "SENT") {
      return await prisma.exchangeOffer.findMany({
        where: { buyerId: actor.uid },
        select: baseSelect,
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }

    return await prisma.exchangeOffer.findMany({
      where: { product: { sellerId: actor.uid } },
      select: baseSelect,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (err) {
    console.error("Error fetching exchange offers:", err);
    return [];
  }
}
