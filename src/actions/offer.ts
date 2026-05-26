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
      select: { sellerId: true, title: true }
    });

    if (!product) throw new Error("Product not found");

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
        title: "New Offer Received! 💰",
        content: `You received an offer of ₹${data.price.toLocaleString('en-IN')} for "${product.title}"`,
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
        product: { select: { sellerId: true, title: true } }
      }
    });

    if (!offer) throw new Error("Offer not found");
    if (offer.product.sellerId !== userId) throw new Error("Unauthorized");

    await prisma.offer.update({
      where: { id: offerId },
      data: { status }
    });

    // Notify buyer
    try {
      const { createNotification } = await import("./notification");
      await createNotification({
        userId: offer.buyerId,
        type: "OFFER",
        title: status === "ACCEPTED" ? "Offer Accepted! 🎉" : "Offer Rejected",
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
