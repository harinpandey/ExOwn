import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  type CartIdentity,
  cartInclude,
  getCartIdentity,
  getOrCreateCart,
  recalculateCartSubtotal,
  serializeCart,
  setGuestCartCookie,
} from "@/lib/commerce";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function quantityValue(value: unknown, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.floor(parsed);
}

async function cartJson(identity: CartIdentity, cart: any, status = 200) {
  const response = NextResponse.json({ success: true, data: serializeCart(cart) }, { status });
  setGuestCartCookie(response, identity);
  return response;
}

async function findOwnedCartItem(cartId: string, body: any) {
  const itemId = typeof body.itemId === "string" ? body.itemId : "";
  const productId = typeof body.productId === "string" ? body.productId : "";

  if (itemId) {
    return prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
      include: { product: true },
    });
  }

  if (productId) {
    return prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
      include: { product: true },
    });
  }

  return null;
}

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, {
    namespace: "cart",
    limit: 80,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const identity = await getCartIdentity(req);
  const cart = await getOrCreateCart(identity);
  const response = NextResponse.json({ success: true, data: serializeCart(cart) });
  setGuestCartCookie(response, identity);
  return response;
}

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, {
    namespace: "cart",
    limit: 80,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const identity = await getCartIdentity(req);
    const cart = await getOrCreateCart(identity);
    const body = await req.json();
    const productId = typeof body.productId === "string" ? body.productId : "";
    const quantity = Math.max(quantityValue(body.quantity, 1), 1);

    if (!productId) {
      return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        price: true,
        status: true,
        inventory: true,
        sellerId: true,
      },
    });

    if (!product || product.status !== "LIVE" || product.inventory < 1) {
      return NextResponse.json({ success: false, error: "Product is not available" }, { status: 404 });
    }

    if (identity.type === "user" && product.sellerId === identity.userId) {
      return NextResponse.json({ success: false, error: "You cannot add your own listing to cart" }, { status: 400 });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      select: { quantity: true },
    });
    const nextQuantity = (existing?.quantity || 0) + quantity;

    if (nextQuantity > product.inventory) {
      return NextResponse.json({ success: false, error: "Requested quantity exceeds available inventory" }, { status: 409 });
    }

    const updatedCart = await prisma.$transaction(async (tx) => {
      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        update: {
          quantity: nextQuantity,
          priceSnapshot: product.price,
        },
        create: {
          cartId: cart.id,
          productId,
          quantity,
          priceSnapshot: product.price,
        },
      });

      await recalculateCartSubtotal(tx, cart.id);

      return tx.cart.findUniqueOrThrow({
        where: { id: cart.id },
        include: cartInclude,
      });
    });

    const response = NextResponse.json({ success: true, data: serializeCart(updatedCart) }, { status: 201 });
    setGuestCartCookie(response, identity);
    return response;
  } catch (error) {
    console.error("[api/cart] Add item failed", error);
    return NextResponse.json({ success: false, error: "Failed to add item to cart" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const limited = await enforceRateLimit(req, {
    namespace: "cart",
    limit: 80,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const identity = await getCartIdentity(req);
    const cart = await getOrCreateCart(identity);
    const body = await req.json();
    const quantity = quantityValue(body.quantity, 1);
    const item = await findOwnedCartItem(cart.id, body);

    if (!item) {
      return NextResponse.json({ success: false, error: "Cart item not found" }, { status: 404 });
    }

    if (quantity > item.product.inventory) {
      return NextResponse.json({ success: false, error: "Requested quantity exceeds available inventory" }, { status: 409 });
    }

    const updatedCart = await prisma.$transaction(async (tx) => {
      if (quantity <= 0) {
        await tx.cartItem.delete({ where: { id: item.id } });
      } else {
        await tx.cartItem.update({
          where: { id: item.id },
          data: { quantity },
        });
      }

      await recalculateCartSubtotal(tx, cart.id);

      return tx.cart.findUniqueOrThrow({
        where: { id: cart.id },
        include: cartInclude,
      });
    });

    return cartJson(identity, updatedCart);
  } catch (error) {
    console.error("[api/cart] Update item failed", error);
    return NextResponse.json({ success: false, error: "Failed to update cart item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const limited = await enforceRateLimit(req, {
    namespace: "cart",
    limit: 80,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const identity = await getCartIdentity(req);
    const cart = await getOrCreateCart(identity);
    const url = new URL(req.url);
    const body = req.headers.get("content-type")?.includes("application/json")
      ? await req.json().catch(() => ({}))
      : {};
    const item = await findOwnedCartItem(cart.id, {
      itemId: body.itemId || url.searchParams.get("itemId"),
      productId: body.productId || url.searchParams.get("productId"),
    });

    if (!item) {
      return NextResponse.json({ success: false, error: "Cart item not found" }, { status: 404 });
    }

    const updatedCart = await prisma.$transaction(async (tx) => {
      await tx.cartItem.delete({ where: { id: item.id } });
      await recalculateCartSubtotal(tx, cart.id);

      return tx.cart.findUniqueOrThrow({
        where: { id: cart.id },
        include: cartInclude,
      });
    });

    return cartJson(identity, updatedCart);
  } catch (error) {
    console.error("[api/cart] Remove item failed", error);
    return NextResponse.json({ success: false, error: "Failed to remove cart item" }, { status: 500 });
  }
}
