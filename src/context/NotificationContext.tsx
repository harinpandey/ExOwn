"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUnreadCount,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  seedDemoNotifications,
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

const DEFAULT_DEMO_NOTIFS: NotificationItem[] = [
  {
    id: "demo-1",
    type: "OFFER",
    title: "⚡ Price Drop Alert: MacBook Air M1",
    content: "A MacBook Air M1 in your wishlist dropped by ₹3,500! Check out the updated listing now.",
    link: "/search?q=MacBook",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: "demo-2",
    type: "RENTAL_APPROVED",
    title: "✅ Rental Request Approved!",
    content: "Rohan accepted your rental request for the Mini Refrigerator (3-Month Semester Rental).",
    link: "/search?listingType=RENT",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: "demo-3",
    type: "VERIFICATION_STATUS",
    title: "🛡️ Campus Seller Verified",
    content: "Congratulations! Your university student ID has been verified. You now carry the Trusted Student badge.",
    link: "/profile",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "demo-4",
    type: "MESSAGE",
    title: "💬 New message from Priya (LPU BH-3)",
    content: "'Hey! Is the Engineering Physics textbook still available for instant pickup today?'",
    link: "/chat",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotif: (id: string) => Promise<void>;
  clearAllNotifs: () => Promise<void>;
  seedDemoNotifs: () => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_DEMO_NOTIFS);
  const [unreadCount, setUnreadCount] = useState(2);
  const [loading, setLoading] = useState(false);
  useFcm(); // Initialize FCM foreground listener

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications(DEFAULT_DEMO_NOTIFS);
      setUnreadCount(DEFAULT_DEMO_NOTIFS.filter((n) => !n.isRead).length);
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
      if (notifs && notifs.length > 0) {
        setNotifications(notifs);
        setUnreadCount(systemCount + chatCount);
      } else {
        // Fallback demo data if DB has no notifications yet
        setNotifications(DEFAULT_DEMO_NOTIFS);
        setUnreadCount(DEFAULT_DEMO_NOTIFS.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Failed to refresh notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markRead = async (id: string) => {
    if (user && !id.startsWith("demo-")) {
      await markAsRead(id);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (user) {
      await markAllAsRead(user.uid);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id: string) => {
    if (user && !id.startsWith("demo-")) {
      await deleteNotification(id);
    }
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      const next = prev.filter((n) => n.id !== id);
      if (target && !target.isRead) {
        setUnreadCount((cnt) => Math.max(0, cnt - 1));
      }
      return next;
    });
  };

  const clearAllNotifs = async () => {
    if (user) {
      await clearAllNotifications(user.uid);
    }
    setNotifications([]);
    setUnreadCount(0);
  };

  const seedDemoNotifs = async () => {
    if (user) {
      await seedDemoNotifications(user.uid);
      await refreshNotifications();
    } else {
      setNotifications(DEFAULT_DEMO_NOTIFS);
      setUnreadCount(DEFAULT_DEMO_NOTIFS.filter((n) => !n.isRead).length);
    }
  };

  useEffect(() => {
    refreshNotifications();
    if (user) {
      const interval = setInterval(refreshNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user, refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        refreshNotifications,
        markRead,
        markAllRead,
        deleteNotif,
        clearAllNotifs,
        seedDemoNotifs,
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
