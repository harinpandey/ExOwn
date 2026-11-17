"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { createNotification } from "./notification";
import { logActivity } from "@/lib/logger";
import { requireSameUser } from "@/lib/auth";
import { sanitizeString, validateLength } from "@/lib/validation";

export async function requestServiceQuote(data: {
  serviceDetailId: string;
  userId: string;
  content: string;
}) {
  try {
    const actor = await requireSameUser(data.userId);
    const requesterId = actor.uid;

    const content = sanitizeString(data.content);
    if (!validateLength(content, 1, 1000)) {
      throw new Error("Inquiry must be between 1 and 1000 characters.");
    }

    // 1. Fetch service detail to get provider info
    const service = await prisma.serviceDetail.findUnique({
      where: { id: data.serviceDetailId },
      include: {
        product: {
          select: { id: true, sellerId: true, title: true, status: true, listingType: true },
        },
      },
    });

    if (!service) throw new Error("Service not found");
    if (service.product.status !== "LIVE" || service.product.listingType !== "SERVICE") {
      throw new Error("This service listing is no longer available.");
    }
    if (service.product.sellerId === requesterId) {
      throw new Error("You cannot request a quote from yourself");
    }

    // 2. Create Quote Request
    const quote = await withRetry(() => prisma.quoteRequest.create({
      data: {
        serviceDetailId: data.serviceDetailId,
        userId: requesterId,
        content,
        status: "PENDING",
      }
    }));

    // 3. Notify Provider
    await createNotification({
      userId: service.product.sellerId,
      type: "SERVICE_QUOTE",
      title: "New Service Inquiry! 🛠️",
      content: `Someone is interested in your "${service.product.title}". Reply with a quote.`,
      link: "/profile?tab=serviceQuotes&view=RECEIVED",
    });

    await logActivity({
      userId: requesterId,
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
    const actor = await requireSameUser(userId);

    return await withRetry(() => prisma.serviceDetail.findMany({
      where: { product: { sellerId: actor.uid } },
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

export async function getServiceQuoteRequests(userId: string, direction: "SENT" | "RECEIVED") {
  try {
    const actor = await requireSameUser(userId);

    if (direction === "SENT") {
      return await withRetry(() => prisma.quoteRequest.findMany({
        where: { userId: actor.uid },
        select: {
          id: true,
          content: true,
          status: true,
          createdAt: true,
          serviceDetail: {
            select: {
              product: {
                select: {
                  id: true,
                  title: true,
                  seller: { select: { id: true, name: true, image: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }));
    }

    return await withRetry(() => prisma.quoteRequest.findMany({
      where: { serviceDetail: { product: { sellerId: actor.uid } } },
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, name: true, image: true } },
        serviceDetail: {
          select: {
            product: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }));
  } catch (error) {
    console.error("[getServiceQuoteRequests] Failed:", error);
    return [];
  }
}

export async function markServiceQuoteReplied(quoteRequestId: string, providerId: string) {
  try {
    const provider = await requireSameUser(providerId);
    const quote = await prisma.quoteRequest.findUnique({
      where: { id: quoteRequestId },
      select: {
        id: true,
        userId: true,
        status: true,
        serviceDetail: {
          select: {
            product: { select: { sellerId: true, title: true } },
          },
        },
      },
    });

    if (!quote || quote.serviceDetail.product.sellerId !== provider.uid) {
      return { success: false, error: "Quote request not found." };
    }
    if (quote.status !== "PENDING") {
      return { success: false, error: "This quote request has already been updated." };
    }

    const updated = await withRetry(() => prisma.quoteRequest.updateMany({
      where: { id: quote.id, status: "PENDING" },
      data: { status: "REPLIED" },
    }));
    if (updated.count !== 1) {
      return { success: false, error: "This quote request has already been updated." };
    }

    await createNotification({
      userId: quote.userId,
      type: "SERVICE_QUOTE",
      title: "Your service inquiry was replied to",
      content: "The provider has marked your inquiry as replied. Open your service requests to continue the conversation.",
      link: "/profile?tab=serviceQuotes&view=SENT",
    });

    await logActivity({
      userId: provider.uid,
      actionType: "SERVICE_QUOTE_REPLIED",
      metadata: { quoteRequestId: quote.id },
    });

    return { success: true };
  } catch (error) {
    console.error("[markServiceQuoteReplied] Failed:", error);
    return { success: false, error: "Unable to update this quote request." };
  }
}

export async function cancelServiceQuoteRequest(quoteRequestId: string, userId: string) {
  try {
    const requester = await requireSameUser(userId);
    const quote = await prisma.quoteRequest.findUnique({
      where: { id: quoteRequestId },
      select: {
        id: true,
        userId: true,
        status: true,
        serviceDetail: {
          select: {
            product: { select: { sellerId: true, title: true } },
          },
        },
      },
    });

    if (!quote || quote.userId !== requester.uid) {
      return { success: false, error: "Quote request not found." };
    }
    if (quote.status !== "PENDING") {
      return { success: false, error: "Only pending inquiries can be cancelled." };
    }

    const updated = await withRetry(() => prisma.quoteRequest.updateMany({
      where: { id: quote.id, userId: requester.uid, status: "PENDING" },
      data: { status: "CANCELLED" },
    }));
    if (updated.count !== 1) {
      return { success: false, error: "This quote request has already been updated." };
    }

    await createNotification({
      userId: quote.serviceDetail.product.sellerId,
      type: "SERVICE_QUOTE",
      title: "Service inquiry cancelled",
      content: "A student cancelled their inquiry for " + quote.serviceDetail.product.title + ".",
      link: "/profile?tab=serviceQuotes&view=RECEIVED",
    });

    await logActivity({
      userId: requester.uid,
      actionType: "SERVICE_QUOTE_CANCELLED",
      metadata: { quoteRequestId: quote.id },
    });

    return { success: true };
  } catch (error) {
    console.error("[cancelServiceQuoteRequest] Failed:", error);
    return { success: false, error: "Unable to cancel this quote request." };
  }
}
