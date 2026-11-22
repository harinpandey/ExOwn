"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/** Seller-only grant/revoke. Phone numbers are never returned to the buyer without an active grant. */
export async function setPhoneShare(productId: string, buyerId: string, allow: boolean) {
  try {
    const actor = await requireUser();
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true, title: true },
    });
    if (!product) return { success: false, error: "Listing not found." };
    if (product.sellerId !== actor.uid) {
      return { success: false, error: "Only the listing seller can share their phone number." };
    }
    if (!buyerId || buyerId === actor.uid) {
      return { success: false, error: "Choose the buyer from this conversation." };
    }

    if (allow) {
      await withRetry(() => prisma.phoneShare.upsert({
        where: { productId_buyerId: { productId, buyerId } },
        update: { sellerId: actor.uid, grantedAt: new Date(), revokedAt: null },
        create: { productId, sellerId: actor.uid, buyerId },
      }));
    } else {
      await withRetry(() => prisma.phoneShare.updateMany({
        where: { productId, sellerId: actor.uid, buyerId, revokedAt: null },
        data: { revokedAt: new Date() },
      }));
    }

    revalidatePath(`/chat/${buyerId}`);
    revalidatePath(`/product/${productId}`);
    return { success: true, shared: allow };
  } catch (error: any) {
    console.error("[PhoneShare] Could not update seller phone access:", error);
    return { success: false, error: error?.message === "Unauthorized" ? "Sign in to manage phone sharing." : "Could not update phone access. Please try again." };
  }
}

/** For the seller, returns grant state. For the buyer, returns the phone only after the seller grants access. */
export async function getPhoneShareState(productId: string, partnerId: string) {
  try {
    const actor = await requireUser();
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true, seller: { select: { phone: true } } },
    });
    if (!product) return { success: false, shared: false, phone: null };
    const isSeller = product.sellerId === actor.uid;
    const buyerId = isSeller ? partnerId : actor.uid;
    if (!isSeller && partnerId !== product.sellerId) {
      return { success: false, shared: false, phone: null };
    }

    const grant = await prisma.phoneShare.findUnique({
      where: { productId_buyerId: { productId, buyerId } },
      select: { revokedAt: true },
    });
    const shared = !!grant && !grant.revokedAt;
    return {
      success: true,
      isSeller,
      shared,
      phone: !isSeller && shared ? (product.seller.phone?.trim() || null) : null,
    };
  } catch (error) {
    console.error("[PhoneShare] Could not read phone access:", error);
    return { success: false, shared: false, phone: null };
  }
}
