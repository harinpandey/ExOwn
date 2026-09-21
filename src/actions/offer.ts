"use server";

import prisma from "@/lib/prisma";
import { requireSameUser } from "@/lib/auth";
import { sanitizeString, validateRange, validateLength } from "@/lib/validation";

export async function createOffer(data: {
  productId: string;
  buyerId: string;
  price: number;
  message?: string;
}) {
  try {
    await requireSameUser(data.buyerId);

    const price = Number(data.price);
    if (!validateRange(price, 1, 1000000)) {
      throw new Error("Offer price must be between ₹1 and ₹1,000,000.");
    }

    const message = data.message ? sanitizeString(data.message) : undefined;
    if (message && !validateLength(message, 1, 500)) {
      throw new Error("Message must be under 500 characters.");
    }

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { sellerId: true, title: true, status: true, inventory: true }
    });

    if (!product) throw new Error("Product not found");
    if (product.status !== "LIVE" || product.inventory < 1) {
      throw new Error("This listing is no longer available");
    }
    if (product.sellerId === data.buyerId) {
      throw new Error("You cannot make an offer on your own listing");
    }

    const existingPendingOffer = await prisma.offer.findFirst({
      where: {
        productId: data.productId,
        buyerId: data.buyerId,
        status: "PENDING",
      },
      select: { id: true },
    });

    if (existingPendingOffer) {
      throw new Error("You already have a pending offer for this listing");
    }

    const offer = await prisma.offer.create({
      data: {
        productId: data.productId,
        buyerId: data.buyerId,
        price,
        message,
      }
    });

    // Create Notification for seller
    try {
      const { createNotification } = await import("./notification");
      await createNotification({
        userId: product.sellerId,
        type: "OFFER",
        title: "New Offer Received",
        content: `You received an offer of ₹${price.toLocaleString('en-IN')} for "${product.title}"`,
        link: `/profile?tab=listings` // Or a dedicated offers page
      });
    } catch (notifErr) {
      console.error("Failed to trigger offer notification:", notifErr);
    }

    return { success: true, offer };
  } catch (error: any) {
    console.error("Error creating offer:", error);
    return { success: false, error: error.message };
  }
}

export async function updateOfferStatus(offerId: string, userId: string, status: "ACCEPTED" | "REJECTED") {
  try {
    await requireSameUser(userId);

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { 
        product: { select: { sellerId: true, title: true, status: true, inventory: true } }
      }
    });

    if (!offer) throw new Error("Offer not found");
    if (offer.product.sellerId !== userId) throw new Error("Unauthorized");
    if (offer.status !== "PENDING") throw new Error("Offer is already resolved");
    if (offer.product.status !== "LIVE" || offer.product.inventory < 1) {
      throw new Error("This listing is no longer available");
    }

    await prisma.$transaction(async (tx) => {
      await tx.offer.update({
        where: { id: offerId },
        data: { status }
      });

      if (status === "ACCEPTED") {
        await tx.offer.updateMany({
          where: {
            productId: offer.productId,
            id: { not: offerId },
            status: "PENDING",
          },
          data: { status: "REJECTED" },
        });

        await tx.transactionRecord.upsert({
          where: { offerId },
          update: {
            buyerId: offer.buyerId,
            sellerId: userId,
            productId: offer.productId,
            type: "SALE",
            source: "OFFER",
            amount: offer.price,
          },
          create: {
            buyerId: offer.buyerId,
            sellerId: userId,
            productId: offer.productId,
            offerId,
            type: "SALE",
            source: "OFFER",
            amount: offer.price,
          },
        });
      }
    });

    // Notify buyer
    try {
      const { createNotification } = await import("./notification");
      await createNotification({
        userId: offer.buyerId,
        type: "OFFER",
        title: status === "ACCEPTED" ? "Offer Accepted" : "Offer Rejected",
        content: `Your offer for "${offer.product.title}" has been ${status.toLowerCase()}.`,
        link: `/product/${offer.productId}`
      });
    } catch (notifErr) {
      console.error("Failed to trigger offer status notification:", notifErr);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating offer status:", error);
    return { success: false, error: error.message };
  }
}
