import "server-only";

import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const GUEST_CART_COOKIE = "__exown_guest_cart";
const GUEST_CART_MAX_AGE = 60 * 60 * 24 * 30;

export type CartIdentity =
  | { type: "user"; userId: string; guestId?: string; newGuestId?: never }
  | { type: "guest"; guestId: string; userId?: never; newGuestId: boolean };

export const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          status: true,
          inventory: true,
          pickupLocation: true,
          sellerId: true,
          categoryId: true,
          subcategoryId: true,
          category: { select: { name: true, slug: true } },
        },
      },
    },
  },
} as const;

export async function getCartIdentity(req: NextRequest): Promise<CartIdentity> {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    return {
      type: "user",
      userId: currentUser.uid,
      guestId: req.cookies.get(GUEST_CART_COOKIE)?.value,
    };
  }

  const existingGuestId = req.cookies.get(GUEST_CART_COOKIE)?.value;
  if (existingGuestId) {
    return { type: "guest", guestId: existingGuestId, newGuestId: false };
  }

  return { type: "guest", guestId: randomUUID(), newGuestId: true };
}

export function setGuestCartCookie(res: NextResponse, identity: CartIdentity) {
  if (identity.type === "user" && identity.guestId) {
    res.cookies.set(GUEST_CART_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return;
  }

  if (identity.type !== "guest" || !identity.newGuestId) return;

  res.cookies.set(GUEST_CART_COOKIE, identity.guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_CART_MAX_AGE,
  });
}

export async function getOrCreateCart(identity: CartIdentity) {
  if (identity.type === "user") {
    const userCart = await prisma.cart.upsert({
      where: { userId: identity.userId },
      update: {},
      create: { userId: identity.userId },
      include: cartInclude,
    });

    if (identity.guestId) {
      const guestCart = await prisma.cart.findUnique({
        where: { guestId: identity.guestId },
        include: cartInclude,
      });

      if (guestCart && guestCart.id !== userCart.id && guestCart.items.length > 0) {
        await prisma.$transaction(async (tx) => {
          for (const item of guestCart.items) {
            const product = item.product;
            if (product.status !== "LIVE" || product.inventory < 1) continue;

            const existing = await tx.cartItem.findUnique({
              where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
              select: { quantity: true },
            });
            const quantity = Math.min(product.inventory, (existing?.quantity || 0) + item.quantity);

            await tx.cartItem.upsert({
              where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
              update: { quantity, priceSnapshot: item.priceSnapshot },
              create: {
                cartId: userCart.id,
                productId: item.productId,
                quantity,
                priceSnapshot: item.priceSnapshot,
              },
            });
          }

          await tx.cart.delete({ where: { id: guestCart.id } });
          await recalculateCartSubtotal(tx, userCart.id);
        });

        return prisma.cart.findUniqueOrThrow({
          where: { id: userCart.id },
          include: cartInclude,
        });
      }
    }

    return userCart;
  }

  return prisma.cart.upsert({
    where: { guestId: identity.guestId },
    update: {},
    create: { guestId: identity.guestId },
    include: cartInclude,
  });
}

export async function findCart(identity: CartIdentity) {
  return prisma.cart.findUnique({
    where: identity.type === "user" ? { userId: identity.userId } : { guestId: identity.guestId },
    include: cartInclude,
  });
}

export async function recalculateCartSubtotal(tx: any, cartId: string) {
  const items = await tx.cartItem.findMany({
    where: { cartId },
    select: { quantity: true, priceSnapshot: true },
  });

  const subtotal = items.reduce((sum: number, item: { quantity: number; priceSnapshot: number }) => {
    return sum + item.quantity * item.priceSnapshot;
  }, 0);

  await tx.cart.update({
    where: { id: cartId },
    data: { subtotal },
  });

  return subtotal;
}

export function serializeCart(cart: any) {
  return {
    id: cart.id,
    userId: cart.userId,
    guestId: cart.guestId,
    subtotal: cart.subtotal,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    items: cart.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      lineTotal: item.quantity * item.priceSnapshot,
      product: item.product,
    })),
  };
}
