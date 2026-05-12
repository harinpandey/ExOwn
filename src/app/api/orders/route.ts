import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { cartInclude } from "@/lib/commerce";
import { enforceRateLimit } from "@/lib/rate-limit";
import { razorpay } from "@/lib/razorpay";
import { invalidateCachePrefix } from "@/lib/cache";

export const dynamic = "force-dynamic";

const ORDER_INCLUDE = {
  payment: {
    select: {
      id: true,
      amount: true,
      currency: true,
      paymentStatus: true,
      transactionId: true,
      razorpayOrderId: true,
      createdAt: true,
    },
  },
  items: {
    include: {
      product: {
        select: {
          id: true,
          title: true,
          images: true,
          sellerId: true,
          pickupLocation: true,
        },
      },
    },
  },
} as const;

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function verifyRazorpayPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw Object.assign(new Error("Razorpay key secret is not configured"), { status: 500 });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

async function fetchVerifiedPayment(paymentId: string) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw Object.assign(new Error("Razorpay credentials are not configured"), { status: 500 });
  }

  const payment = await razorpay.payments.fetch(paymentId);
  if (!payment || payment.status !== "captured") {
    throw Object.assign(new Error("Payment is not captured"), { status: 402 });
  }

  return payment;
}

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, {
    namespace: "orders:read",
    limit: 60,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ success: true, data: [] });
  }

  const orders = await prisma.order.findMany({
    where: { userId: currentUser.uid },
    orderBy: { createdAt: "desc" },
    include: ORDER_INCLUDE,
  });

  return NextResponse.json({ success: true, data: orders });
}

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, {
    namespace: "payments",
    limit: 6,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const currentUser = await requireUser();
    const body = await req.json();
    const razorpayOrderId = stringValue(body.razorpay_order_id || body.razorpayOrderId);
    const razorpayPaymentId = stringValue(body.razorpay_payment_id || body.razorpayPaymentId);
    const razorpaySignature = stringValue(body.razorpay_signature || body.razorpaySignature);
    const shippingAddress = body.shippingAddress;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ success: false, error: "Payment verification fields are required" }, { status: 400 });
    }

    if (!shippingAddress || typeof shippingAddress !== "object" || Array.isArray(shippingAddress)) {
      return NextResponse.json({ success: false, error: "shippingAddress must be an object" }, { status: 400 });
    }

    if (!verifyRazorpayPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }

    const gatewayPayment = await fetchVerifiedPayment(razorpayPaymentId);

    const order = await prisma.$transaction(async (tx) => {
      const existingPayment = await tx.payment.findUnique({
        where: { transactionId: razorpayPaymentId },
        include: { order: { include: ORDER_INCLUDE } },
      });

      if (existingPayment?.order) {
        if (existingPayment.userId !== currentUser.uid) {
          throw Object.assign(new Error("Payment belongs to another user"), { status: 403 });
        }
        return existingPayment.order;
      }

      if (existingPayment?.subscriptionId) {
        throw Object.assign(new Error("Payment already belongs to another commerce flow"), { status: 409 });
      }

      const cart = await tx.cart.findUnique({
        where: { userId: currentUser.uid },
        include: cartInclude,
      });

      if (!cart || cart.items.length === 0) {
        throw Object.assign(new Error("Cart is empty"), { status: 400 });
      }

      for (const item of cart.items) {
        if (item.product.sellerId === currentUser.uid) {
          throw Object.assign(new Error("Cannot checkout your own listing"), { status: 400 });
        }
        if (item.product.status !== "LIVE" || item.product.inventory < item.quantity) {
          throw Object.assign(new Error(`Product is no longer available: ${item.product.title}`), { status: 409 });
        }
      }

      const serverTotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const serverTotalPaise = Math.round(serverTotal * 100);
      const gatewayAmount = Number(gatewayPayment.amount);

      if (gatewayAmount !== serverTotalPaise) {
        throw Object.assign(new Error("Payment amount does not match server-side cart total"), { status: 409 });
      }

      const payment = existingPayment ?? await tx.payment.create({
        data: {
          userId: currentUser.uid,
          amount: serverTotal,
          currency: gatewayPayment.currency || "INR",
          paymentStatus: "SUCCESS",
          transactionId: razorpayPaymentId,
          razorpayOrderId,
          webhookPayload: gatewayPayment as any,
        },
      });

      if (payment.userId !== currentUser.uid) {
        throw Object.assign(new Error("Payment belongs to another user"), { status: 403 });
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: "SUCCESS",
          amount: serverTotal,
          currency: gatewayPayment.currency || "INR",
          transactionId: razorpayPaymentId,
          razorpayOrderId,
          webhookPayload: gatewayPayment as any,
        },
      });

      const createdOrder = await tx.order.create({
        data: {
          userId: currentUser.uid,
          paymentId: payment.id,
          status: "PAID",
          total: serverTotal,
          shippingAddress,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price,
            })),
          },
        },
        include: ORDER_INCLUDE,
      });

      for (const item of cart.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            status: "LIVE",
            inventory: { gte: item.quantity },
          },
          data: {
            inventory: { decrement: item.quantity },
          },
        });

        if (updated.count !== 1) {
          throw Object.assign(new Error(`Inventory changed during checkout: ${item.product.title}`), { status: 409 });
        }

        if (item.product.inventory - item.quantity <= 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: { status: "SOLD" },
          });
        }
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { subtotal: 0 } });

      return createdOrder;
    });

    invalidateCachePrefix("products:");
    invalidateCachePrefix("search:");
    invalidateCachePrefix("home:");

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    const status = Number(error.status) || (error.message === "Unauthorized" ? 401 : 500);
    console.error("[api/orders] Checkout failed", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to place order" }, { status });
  }
}
