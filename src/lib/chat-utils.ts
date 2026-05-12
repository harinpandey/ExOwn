/**
 * Abstraction layer for messaging.
 * Currently uses Polling (Server Actions), but can be easily migrated
 * to WebSockets (Socket.io) or Firebase Realtime Database.
 */

import { sendMessage, getChatHistory, getConversations } from "@/actions/chat";

export const chatService = {
  /**
   * Fetches messages between two users.
   * Can be replaced with a subscription model in the future.
   */
  async fetchMessages(userId: string, partnerId: string) {
    return await getChatHistory(userId, partnerId);
  },

  /**
   * Sends a message.
   * Can be replaced with a WebSocket emit in the future.
   */
  async send(senderId: string, receiverId: string, content: string) {
    return await sendMessage(senderId, receiverId, content);
  },

  /**
   * Fetches list of all active conversations for a user.
   */
  async fetchConversations(userId: string) {
    return await getConversations(userId);
  },

  /**
   * Future-proof hook for real-time updates.
   * For now, this just returns a cleanup function doing nothing.
   */
  subscribeToMessages(userId: string, partnerId: string, callback: (message: any) => void) {
    // Real-time subscriptions placeholder
    return () => {};
  }
};
