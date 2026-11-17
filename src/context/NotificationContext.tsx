"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUnreadCount,
  getUserNotifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/actions/notification";
import { useFcm } from "@/hooks/useFcm";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markUnread: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotif: (id: string) => Promise<void>;
  clearAllNotifs: () => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  useFcm();

  const refreshNotifications = useCallback(async () => {
    // Wait until AuthProvider has established the server session.
    if (authLoading) return;

    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { getTotalUnreadCount } = await import("@/actions/chat");
      const [notifs, systemCount, chatCount] = await Promise.all([
        getUserNotifications(user.uid),
        getUnreadCount(user.uid),
        getTotalUnreadCount(user.uid),
      ]);

      // An empty database means no notifications, not a reason to show
      // fabricated sample messages in a real student's account.
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setUnreadCount(systemCount + chatCount);
    } catch (error) {
      console.error("[NotificationContext] Failed to refresh notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  const markRead = async (id: string) => {
    const target = notifications.find((item) => item.id === id);
    if (!user || !target || target.isRead) return;

    const result = await markAsRead(id);
    if (!result.success) return;

    setNotifications((current) =>
      current.map((item) => item.id === id ? { ...item, isRead: true } : item)
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  };

  const markUnread = async (id: string) => {
    const target = notifications.find((item) => item.id === id);
    if (!user || !target || !target.isRead) return;

    const result = await markAsUnread(id);
    if (!result.success) return;

    setNotifications((current) =>
      current.map((item) => item.id === id ? { ...item, isRead: false } : item)
    );
    setUnreadCount((current) => current + 1);
  };

  const markAllRead = async () => {
    if (!user) return;

    const unreadNotifications = notifications.filter((item) => !item.isRead).length;
    if (unreadNotifications === 0) return;

    const result = await markAllAsRead(user.uid);
    if (!result.success) return;

    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    // Keep unread chat messages in the global navbar count.
    setUnreadCount((current) => Math.max(0, current - unreadNotifications));
  };

  const deleteNotif = async (id: string) => {
    if (!user) return;

    const target = notifications.find((item) => item.id === id);
    if (!target) return;

    const result = await deleteNotification(id);
    if (!result.success) return;

    setNotifications((current) => current.filter((item) => item.id !== id));
    if (!target.isRead) {
      setUnreadCount((current) => Math.max(0, current - 1));
    }
  };

  const clearAllNotifs = async () => {
    if (!user) return;

    const unreadNotifications = notifications.filter((item) => !item.isRead).length;
    const result = await clearAllNotifications(user.uid);
    if (!result.success) return;

    setNotifications([]);
    // Clearing notification records must not clear unread chat conversations.
    setUnreadCount((current) => Math.max(0, current - unreadNotifications));
  };

  useEffect(() => {
    if (authLoading) return;

    void refreshNotifications();
    if (user) {
      const interval = window.setInterval(() => {
        void refreshNotifications();
      }, 60000);
      return () => window.clearInterval(interval);
    }
  }, [user?.uid, authLoading, refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        refreshNotifications,
        markRead,
        markUnread,
        markAllRead,
        deleteNotif,
        clearAllNotifs,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
