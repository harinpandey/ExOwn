"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { logActivity } from "@/lib/logger";
import crypto from "crypto";
import { requireSameUser } from "@/lib/auth";

const PLAN_PRICES = {
  FREE: 0,
  PRO_SELLER: 499, // ₹499
  CAMPUS_BUSINESS: 1999, // ₹1999
};

export async function createSubscriptionOrder(userId: string, planType: "PRO_SELLER" | "CAMPUS_BUSINESS") {
  try {
    await requireSameUser(userId);

    const amount = PLAN_PRICES[planType];
    
    // 1. Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `sub_${userId}_${Date.now()}`,
    });

    // 2. Store PENDING subscription and payment record
    await withRetry(() => prisma.$transaction([
      prisma.subscription.upsert({
        where: { userId },
        update: {
          planType,
          status: "PENDING",
          razorpayOrderId: order.id,
        },
        create: {
          userId,
          planType,
          status: "PENDING",
          razorpayOrderId: order.id,
        }
      }),
      prisma.payment.create({
        data: {
          userId,
          amount: amount,
          razorpayOrderId: order.id,
          paymentStatus: "PENDING",
        }
      })
    ]));

    await logActivity({
      userId,
      actionType: "SUBSCRIPTION_STARTED",
      metadata: { planType, orderId: order.id }
    });

    return { success: true, order };
  } catch (err: any) {
    console.error("Error creating subscription order:", err);
    return { success: false, error: err.message };
  }
}

export async function verifySubscriptionPayment(userId: string, data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    await requireSameUser(userId);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // 2. Update DB: Payment & Subscription
    await withRetry(() => prisma.$transaction(async (tx) => {
      // Find the subscription to get the plan type
      const sub = await tx.subscription.findUnique({
        where: { userId }
      });

      if (!sub) throw new Error("Subscription record not found");

      // Update Subscription
      await tx.subscription.update({
        where: { userId },
        data: {
          status: "ACTIVE",
          paymentId: razorpay_payment_id,
          startDate: new Date(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
      });

      // Update Payment
      await tx.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          paymentStatus: "SUCCESS",
          transactionId: razorpay_payment_id,
        }
      });

      // Update User Plan
      // We don't have a direct 'plan' field on User yet, 
      // but we can add it or just rely on the Subscription relation.
      // The user requested 'Update User Account: plan upgraded'.
    }));

    await logActivity({
      userId,
      actionType: "PAYMENT_SUCCESS",
      paymentId: razorpay_payment_id,
      metadata: { orderId: razorpay_order_id }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Payment verification failed:", err);
    return { success: false, error: err.message };
  }
}

export async function getSubscription(userId: string) {
  try {
    await requireSameUser(userId);

    return await withRetry(() => prisma.subscription.findUnique({
      where: { userId }
    }));
  } catch (err) {
    console.error("Error fetching subscription:", err);
    return null;
  }
}
