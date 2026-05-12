"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { createNotification } from "./notification";
import { logActivity } from "@/lib/logger";
import { requireSameUser } from "@/lib/auth";

export async function requestServiceQuote(data: {
  serviceDetailId: string;
  userId: string;
  content: string;
}) {
  try {
    await requireSameUser(data.userId);

    if (!data.content.trim()) {
      throw new Error("Inquiry content is required");
    }

    // 1. Fetch service detail to get provider info
    const service = await prisma.serviceDetail.findUnique({
      where: { id: data.serviceDetailId },
      include: { product: true }
    });

    if (!service) throw new Error("Service not found");
    if (service.product.sellerId === data.userId) {
      throw new Error("You cannot request a quote from yourself");
    }

    // 2. Create Quote Request
    const quote = await withRetry(() => prisma.quoteRequest.create({
      data: {
        serviceDetailId: data.serviceDetailId,
        userId: data.userId,
        content: data.content,
        status: "PENDING",
      }
    }));

    // 3. Notify Provider
    await createNotification({
      userId: service.product.sellerId,
      type: "SERVICE_QUOTE",
      title: "New Service Inquiry! 🛠️",
      content: `Someone is interested in your "${service.product.title}". Reply with a quote.`,
      link: `/dashboard/services/quotes/${quote.id}`,
    });

    await logActivity({
      userId: data.userId,
      actionType: "QUOTE_REQUESTED",
      productId: service.productId,
      targetUserId: service.product.sellerId,
    });

    return { success: true, quoteId: quote.id };
  } catch (err: any) {
    console.error("Service quote failed:", err);
    return { success: false, error: err.message };
  }
}

export async function getServiceProviderStats(userId: string) {
  try {
    await requireSameUser(userId);

    return await withRetry(() => prisma.serviceDetail.findMany({
      where: { product: { sellerId: userId } },
      include: {
        _count: {
          select: { quoteRequests: true }
        }
      }
    }));
  } catch {
    return [];
  }
}
