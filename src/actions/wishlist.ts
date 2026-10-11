"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { requireSameUser } from "@/lib/auth";

import { revalidatePath } from "next/cache";

export async function toggleWishlist(userId: string, productId: string) {
  try {
    const authUser = await requireSameUser(userId);

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: authUser.uid,
          productId
        }
      }
    });

    if (existing) {
      await withRetry(() => prisma.wishlist.delete({
        where: { id: existing.id }
      }));
      
      // Update wishlist count on product
      await withRetry(() => prisma.product.update({
        where: { id: productId },
        data: { wishlistCount: { decrement: 1 } }
      }));


      revalidatePath(`/product/${productId}`);
      return { success: true, added: false };
    } else {
      await withRetry(() => prisma.wishlist.create({
        data: {
          userId: authUser.uid,
          productId
        }
      }));

      // Update wishlist count on product
      await withRetry(() => prisma.product.update({
        where: { id: productId },
        data: { wishlistCount: { increment: 1 } }
      }));


      revalidatePath(`/product/${productId}`);
      return { success: true, added: true };
    }
  } catch (error: any) {
    console.error("Error toggling wishlist:", error);
    return { success: false, error: error.message };
  }
}

export async function getWishlist(userId: string) {
  try {
    const authUser = await requireSameUser(userId);

    const wishlist = await withRetry(() => prisma.wishlist.findMany({
      where: { userId: authUser.uid },
      include: {
        product: {
          include: {
            seller: {
              select: {
                name: true,
                image: true,
                isVerified: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }));

    return wishlist.map(w => w.product);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
}

export async function isInWishlist(userId: string, productId: string) {
  try {
    const authUser = await requireSameUser(userId);

    const existing = await withRetry(() => prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: authUser.uid,
          productId
        }
      }
    }));
    return !!existing;

  } catch {
    return false;
  }
}
