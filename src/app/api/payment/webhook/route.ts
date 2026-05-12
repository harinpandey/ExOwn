import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("Invalid Razorpay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const payload = event.payload;

    console.log(`[RAZORPAY-WEBHOOK] Event received: ${event.event}`, { id: event.account_id });

    switch (event.event) {
      case "payment.captured": {
        const paymentData = payload.payment.entity;
        const orderId = paymentData.order_id;
        const amount = paymentData.amount / 100; // Convert to INR

        // Update Payment record
        const payment = await prisma.payment.update({
          where: { razorpayOrderId: orderId },
          data: {
            paymentStatus: "SUCCESS",
            transactionId: paymentData.id,
            webhookPayload: event,
          },
        });

        // Handle Subscription upgrade if applicable
        if (payment.subscriptionId) {
          await prisma.subscription.update({
            where: { id: payment.subscriptionId },
            data: { 
              status: "ACTIVE",
              startDate: new Date(),
              // Expiry date should be calculated based on plan
            },
          });
        }

        // Handle Listing Boost if applicable
        await prisma.listingBoost.updateMany({
          where: { paymentId: payment.id },
          data: { status: "ACTIVE" },
        });

        break;
      }

      case "payment.failed": {
        const paymentData = payload.payment.entity;
        const orderId = paymentData.order_id;

        await prisma.payment.update({
          where: { razorpayOrderId: orderId },
          data: {
            paymentStatus: "FAILED",
            webhookPayload: event,
          },
        });

        // Notify user about failure could be added here
        break;
      }

      case "subscription.authenticated":
      case "subscription.activated": {
        const subData = payload.subscription.entity;
        await prisma.subscription.update({
          where: { razorpayOrderId: subData.id },
          data: { 
            status: "ACTIVE",
            updatedAt: new Date(),
          },
        });
        break;
      }

      case "subscription.charged": {
        const subData = payload.subscription.entity;
        const paymentData = payload.payment.entity;
        
        // Record recurring payment
        await prisma.payment.create({
          data: {
            userId: subData.notes.userId, // Assuming userId is passed in notes
            amount: paymentData.amount / 100,
            paymentStatus: "SUCCESS",
            transactionId: paymentData.id,
            razorpayOrderId: subData.id,
            webhookPayload: event,
          }
        });
        break;
      }

      case "subscription.cancelled":
      case "subscription.expired": {
        const subData = payload.subscription.entity;
        await prisma.subscription.update({
          where: { razorpayOrderId: subData.id },
          data: { status: "EXPIRED" },
        });
        break;
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[RAZORPAY-WEBHOOK-ERROR]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
