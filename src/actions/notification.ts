"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { requireSameUser } from "@/lib/auth";

export async function createNotification(data: {
  userId: string;
  type:
    | "MESSAGE"
    | "OFFER"
    | "SYSTEM"
    | "RENTAL_REQUEST"
    | "RENTAL_APPROVED"
    | "RENTAL_REMINDER"
    | "SERVICE_QUOTE"
    | "PAYMENT_SUCCESS"
    | "SUBSCRIPTION_EXPIRY"
    | "TRANSACTION_UPDATE"
    | "VERIFICATION_STATUS"
    | "HOUSING_INQUIRY"
    | "ROOMMATE_MATCH";
  title: string;
  content: string;
  link?: string;
}) {
  try {
    return await withRetry(() =>
      prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          content: data.content,
          link: data.link,
        },
      })
    );
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function getUserNotifications(userId: string) {
  try {
    await requireSameUser(userId);

    return await withRetry(() =>
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function getUnreadCount(userId: string) {
  try {
    await requireSameUser(userId);

    return await withRetry(() =>
      prisma.notification.count({
        where: { userId, isRead: false },
      })
    );
  } catch {
    return 0;
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    if (!notification) return { success: false };
    await requireSameUser(notification.userId);

    await withRetry(() =>
      prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      })
    );
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await requireSameUser(userId);

    await withRetry(() =>
      prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })
    );
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    if (!notification) return { success: false };
    await requireSameUser(notification.userId);

    await withRetry(() =>
      prisma.notification.delete({
        where: { id: notificationId },
      })
    );
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function clearAllNotifications(userId: string) {
  try {
    await requireSameUser(userId);

    await withRetry(() =>
      prisma.notification.deleteMany({
        where: { userId },
      })
    );
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function seedDemoNotifications(userId: string) {
  try {
    await requireSameUser(userId);

    const demos = [
      {
        type: "OFFER" as const,
        title: "⚡ Price Drop Alert: MacBook Air M1",
        content: "A MacBook Air M1 in your wishlist dropped by ₹3,500! Check out the updated listing now.",
        link: "/search?q=MacBook",
      },
      {
        type: "RENTAL_APPROVED" as const,
        title: "✅ Rental Request Approved!",
        content: "Rohan accepted your rental request for the Mini Refrigerator (3-Month Semester Rental).",
        link: "/search?listingType=RENT",
      },
      {
        type: "VERIFICATION_STATUS" as const,
        title: "🛡️ Campus Seller Verified",
        content: "Congratulations! Your university student ID has been verified. You now carry the Trusted Student badge.",
        link: "/profile",
      },
      {
        type: "MESSAGE" as const,
        title: "💬 New message from Priya (LPU BH-3)",
        content: "'Hey! Is the Engineering Physics textbook still available for instant pickup today?'",
        link: "/chat",
      },
      {
        type: "SYSTEM" as const,
        title: "🎉 Welcome to ExOwn Campus Marketplace",
        content: "Buy, sell, and rent directly within your campus community with zero platform commission fees!",
        link: "/",
      },
    ];

    await Promise.all(
      demos.map((d) =>
        prisma.notification.create({
          data: {
            userId,
            type: d.type,
            title: d.title,
            content: d.content,
            link: d.link,
          },
        })
      )
    );

    return { success: true };
  } catch (err) {
    console.error("Error seeding notifications:", err);
    return { success: false };
  }
}
