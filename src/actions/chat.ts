"use server";

import prisma from "@/lib/prisma";

export async function getConversations(userId: string) {
  try {
    const messages = await prisma.message.findMany({
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
    });

    // Group by conversation partner to create a unique list of conversations
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationsMap.has(partner.id)) {
        conversationsMap.set(partner.id, {
          partner,
          lastMessage: msg.content,
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

    return Array.from(conversationsMap.values());
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

export async function getChatHistory(userId: string, partnerId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    // Mark messages from partner as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return messages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  try {
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content
      }
    });
    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}
