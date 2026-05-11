"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import crypto from "crypto";

const BOOST_PRICES = {
  THREE_DAY: 99,
  SEVEN_DAY: 199,
  THIRTY_DAY: 499,
};

const BOOST_DURATIONS = {
  THREE_DAY: 3,
  SEVEN_DAY: 7,
  THIRTY_DAY: 30,
};

export async function createBoostOrder(productId: string, sellerId: string, boostType: "THREE_DAY" | "SEVEN_DAY" | "THIRTY_DAY") {
  try {
    const amount = BOOST_PRICES[boostType];
    
    // 1. Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `boost_${productId}_${Date.now()}`,
    });

    // 2. Store PENDING boost and payment record
    await withRetry(() => prisma.$transaction([
      prisma.listingBoost.create({
        data: {
          productId,
          sellerId,
          boostType,
          status: "PENDING",
          endDate: new Date(Date.now() + BOOST_DURATIONS[boostType] * 24 * 60 * 60 * 1000),
          paymentId: order.id, // Storing orderId temporarily in paymentId field or separate
        }
      }),
      prisma.payment.create({
        data: {
          userId: sellerId,
          amount: amount,
          razorpayOrderId: order.id,
          paymentStatus: "PENDING",
        }
      })
    ]));

    return { success: true, order };
  } catch (err: any) {
    console.error("Error creating boost order:", err);
    return { success: false, error: err.message };
  }
}

export async function verifyBoostPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      throw new Error("Invalid signature");
    }

    await withRetry(() => prisma.$transaction([
      prisma.listingBoost.updateMany({
        where: { paymentId: razorpay_order_id },
        data: { status: "ACTIVE" }
      }),
      prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          paymentStatus: "SUCCESS",
          transactionId: razorpay_payment_id,
        }
      })
    ]));

    return { success: true };
  } catch (err: any) {
    console.error("Boost verification failed:", err);
    return { success: false, error: err.message };
  }
}
