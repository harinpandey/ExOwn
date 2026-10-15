"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { requireSameUser } from "@/lib/auth";
import { sanitizeString } from "@/lib/validation";


export async function getConversations(userId: string) {
  try {
    await requireSameUser(userId);

    const messages = await withRetry(() => prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } }
      }
    }));


    // Group by conversation partner to create a unique list of conversations
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      let displayLastMessage = msg.content;
      try {
        if (msg.content.includes("LIVE_LOCATION_STARTED")) {
          const parsed = JSON.parse(msg.content);
          if (parsed.type === "LIVE_LOCATION_STARTED") {
            displayLastMessage = "📍 Live location shared";
          }
        }
      } catch {
        // normal text
      }

      if (!conversationsMap.has(partner.id)) {
        conversationsMap.set(partner.id, {
          partner,
          lastMessage: displayLastMessage,
          lastMessageTime: msg.createdAt,
          unreadCount: msg.receiverId === userId && !msg.isRead ? 1 : 0
        });
      } else {
        const existing = conversationsMap.get(partner.id);
        if (msg.receiverId === userId && !msg.isRead) {
          existing.unreadCount += 1;
        }
      }

    });

    const partnerIds = Array.from(conversationsMap.keys());
    if (partnerIds.length > 0) {
      // Fetch latest offers involving the user and these partners to show listing thumbnail
      const recentOffers = await prisma.offer.findMany({
        where: {
          OR: [
            { buyerId: userId, product: { sellerId: { in: partnerIds } } },
            { buyerId: { in: partnerIds }, product: { sellerId: userId } },
          ],
        },
        include: {
          product: {
            select: { id: true, title: true, price: true, images: true, status: true, sellerId: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      for (const offer of recentOffers) {
        const otherUserId = offer.buyerId === userId ? offer.product.sellerId : offer.buyerId;
        const conv = conversationsMap.get(otherUserId);
        if (conv && !conv.product) {
          conv.product = offer.product;
          conv.offerStatus = offer.status;
          conv.offerPrice = offer.price;
        }
      }
    }

    return Array.from(conversationsMap.values());
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

export async function getChatHistory(userId: string, partnerId: string) {
  try {
    await requireSameUser(userId);

    const messages = await withRetry(() => prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: "asc"
      }
    }));

    // Mark messages from partner as read
    await withRetry(() => prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    }));


    return messages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  try {
    await requireSameUser(senderId);

    const cleanContent = sanitizeString(content);
    if (!cleanContent.trim()) {
      return { success: false, error: "Message cannot be empty" };
    }

    const message = await withRetry(() => prisma.message.create({
      data: {
        senderId,
        receiverId,
        content: cleanContent
      },
      include: {
        sender: { select: { name: true } }
      }
    }));


    // Create Notification
    try {
      const { createNotification } = await import("./notification");
      await createNotification({
        userId: receiverId,
        type: "MESSAGE",
        title: "New Message",
        content: `${message.sender.name || 'Someone'} sent you a message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        link: `/chat?partner=${senderId}`
      });
    } catch (notifErr) {
      console.error("Failed to create message notification:", notifErr);
    }

    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}
export async function getTotalUnreadCount(userId: string) {
  try {
    await requireSameUser(userId);

    return await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });
  } catch {
    return 0;
  }
}

export async function getConversationContext(userId: string, partnerId: string, productId?: string) {
  try {
    await requireSameUser(userId);

    // 1. Fetch partner profile (minimized & safe)
    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        name: true,
        image: true,
        isVerified: true,
        verificationLevel: true,
        profile: {
          select: {
            collegeName: true,
            course: true,
          },
        },
      },
    });

    if (!partner) return null;

    // 2. Resolve Product context
    let product: any = null;
    if (productId) {
      product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          rentalDetail: true,
          seller: {
            select: { id: true, name: true, isVerified: true, verificationLevel: true },
          },
        },
      });
    }

    // If no explicit product was supplied, attempt to find the latest active offer or rental between them
    let activeOffer: any = null;
    let activeRental: any = null;
    let activeExchange: any = null;

    if (product) {
      // Find latest offer on this product between these 2 users
      activeOffer = await prisma.offer.findFirst({
        where: {
          productId: product.id,
          OR: [
            { buyerId: userId, product: { sellerId: partnerId } },
            { buyerId: partnerId, product: { sellerId: userId } },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      // Find rental if listing is rental
      if (product.listingType === "RENT") {
        activeRental = await prisma.rental.findFirst({
          where: {
            productId: product.id,
            OR: [
              { renterId: userId, ownerId: partnerId },
              { renterId: partnerId, ownerId: userId },
            ],
          },
          orderBy: { createdAt: "desc" },
        });
      }

      // Find exchange offer if allowed
      if (product.isExchangeAllowed) {
        activeExchange = await prisma.exchangeOffer.findFirst({
          where: {
            productId: product.id,
            buyerId: userId === product.sellerId ? partnerId : userId,
          },
          orderBy: { createdAt: "desc" },
        });
      }
    } else {
      // Search for any recent offer between these users
      activeOffer = await prisma.offer.findFirst({
        where: {
          OR: [
            { buyerId: userId, product: { sellerId: partnerId } },
            { buyerId: partnerId, product: { sellerId: userId } },
          ],
        },
        include: {
          product: {
            include: {
              rentalDetail: true,
              seller: { select: { id: true, name: true, isVerified: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (activeOffer?.product) {
        product = activeOffer.product;
      }
    }

    return {
      partner,
      product: product
        ? {
            id: product.id,
            title: product.title,
            price: product.price,
            images: product.images,
            status: product.status,
            listingType: product.listingType,
            condition: product.condition,
            pickupLocation: product.pickupLocation,
            sellerId: product.sellerId,
            rentalDetail: product.rentalDetail,
          }
        : null,
      offer: activeOffer || null,
      rental: activeRental || null,
      exchange: activeExchange || null,
    };
  } catch (error) {
    console.error("[getConversationContext] Error:", error);
    return null;
  }
}

export async function sendLiveLocationSessionStartedMessage(
  partnerId: string,
  sessionId: string
) {
  try {
    const { requireUser } = await import("@/lib/auth");
    const user = await requireUser();

    if (!sessionId || typeof sessionId !== "string") {
      return { success: false, error: "Invalid sessionId" };
    }

    // IDOR Protection: Verify session in PostgreSQL belongs to this seller and partner
    const session = await prisma.liveLocationSession.findFirst({
      where: {
        id: sessionId.trim(),
        OR: [
          { sellerId: user.uid },
          { sellerId: user.firebaseUid || user.uid },
        ],
        buyerId: partnerId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        productId: true,
        startedAt: true,
        expiresAt: true,
        status: true,
      },
    });

    if (!session) {
      return { success: false, error: "Unauthorized: Invalid or inactive session" };
    }

    // Idempotency check: don't create duplicate system messages for the same sessionId
    const existingMessage = await prisma.message.findFirst({
      where: {
        senderId: user.uid,
        receiverId: partnerId,
        content: { contains: session.id },
      },
    });

    if (existingMessage) {
      return { success: true, message: existingMessage, alreadySent: true };
    }

    const content = JSON.stringify({
      type: "LIVE_LOCATION_STARTED",
      sessionId: session.id,
      startedAt: session.startedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      productId: session.productId,
    });

    const message = await withRetry(() =>
      prisma.message.create({
        data: {
          senderId: user.uid,
          receiverId: partnerId,
          content,
        },
        include: {
          sender: { select: { name: true } },
        },
      })
    );

    try {
      const { createNotification } = await import("./notification");
      await createNotification({
        userId: partnerId,
        type: "MESSAGE",
        title: "Live Location Started",
        content: `${message.sender.name || "Seller"} shared their live location with you (valid for 15 min).`,
        link: `/chat/${user.uid}?product=${session.productId}`,
      });
    } catch (notifErr) {
      console.error("Failed to create live location notification:", notifErr);
    }

    return { success: true, message };
  } catch (err: any) {
    console.error("[sendLiveLocationSessionStartedMessage] Error:", err);
    return { success: false, error: err.message || "Failed to send live location message" };
  }
}
