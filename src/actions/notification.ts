"use server";

import prisma, { withRetry } from "@/lib/prisma";

export async function createNotification(data: {
  userId: string;
  type: "MESSAGE" | "OFFER" | "SYSTEM" | "RENTAL_REQUEST" | "RENTAL_APPROVED" | "RENTAL_REMINDER" | "SERVICE_QUOTE" | "PAYMENT_SUCCESS" | "SUBSCRIPTION_EXPIRY";
  title: string;
  content: string;
  link?: string;
}) {
  try {
    return await withRetry(() => prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        content: data.content,
        link: data.link,
      }
    }));
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function getUserNotifications(userId: string) {
  try {
    return await withRetry(() => prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function getUnreadCount(userId: string) {
  try {
    return await withRetry(() => prisma.notification.count({
      where: { userId, isRead: false }
    }));
  } catch (error) {
    return 0;
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await withRetry(() => prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    }));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await withRetry(() => prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    }));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
