import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma, { withRetry } from "@/lib/prisma";
import { logEvent } from "@/lib/server-logger";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, {
    namespace: "payments:webhook",
    limit: 20,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!secret) {
      return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      logEvent("RAZORPAY_WEBHOOK_ERROR", "Invalid signature", { signature, expectedSignature });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { payload } = event;

    logEvent("RAZORPAY_WEBHOOK", `Event received: ${event.event}`, { eventId: event.id });

    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(payload.payment.entity);
        break;
      case "payment.failed":
        await handlePaymentFailed(payload.payment.entity);
        break;
      case "refund.processed":
        await handleRefundProcessed(payload.refund.entity);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function handlePaymentCaptured(payment: any) {
  const orderId = payment.order_id;
  const paymentId = payment.id;

  await withRetry(() => prisma.$transaction(async (tx) => {
    // 1. Update Payment Record
    const dbPayment = await tx.payment.update({
      where: { razorpayOrderId: orderId },
      data: {
        paymentStatus: "SUCCESS",
        transactionId: paymentId,
        webhookPayload: payment,
      }
    });

    // 2. Activate Subscription if applicable
    await tx.subscription.updateMany({
      where: { razorpayOrderId: orderId },
      data: {
        status: "ACTIVE",
        paymentId: paymentId,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    });

    // 3. Activate Boost if applicable
    await tx.listingBoost.updateMany({
      where: { paymentId: orderId },
      data: { status: "ACTIVE" }
    });

    await tx.order.updateMany({
      where: { paymentId: dbPayment.id },
      data: { status: "PAID" },
    });
    
    logEvent("RAZORPAY_WEBHOOK_SUCCESS", `Order ${orderId} successfully processed.`);
  }));
}

async function handlePaymentFailed(payment: any) {
  const orderId = payment.order_id;
  await withRetry(async () => {
    const dbPayment = await prisma.payment.update({
      where: { razorpayOrderId: orderId },
      data: { paymentStatus: "FAILED", webhookPayload: payment }
    });

    await prisma.order.updateMany({
      where: { paymentId: dbPayment.id },
      data: { status: "FAILED" },
    });
  });
}

async function handleRefundProcessed(refund: any) {
  const paymentId = refund.payment_id;
  await withRetry(async () => {
    const dbPayment = await prisma.payment.update({
      where: { transactionId: paymentId },
      data: { paymentStatus: "REFUNDED", webhookPayload: refund }
    });

    await prisma.order.updateMany({
      where: { paymentId: dbPayment.id },
      data: { status: "REFUNDED" },
    });
  });
}
