"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUnreadCount, getUserNotifications, markAsRead } from "@/actions/notification";
import { useFcm } from "@/hooks/useFcm";

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  useFcm(); // Initialize FCM foreground listener

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { getTotalUnreadCount } = await import("@/actions/chat");
      const [notifs, systemCount, chatCount] = await Promise.all([
        getUserNotifications(user.uid),
        getUnreadCount(user.uid),
        getTotalUnreadCount(user.uid)
      ]);
      setNotifications(notifs);
      setUnreadCount(systemCount + chatCount);
    } catch (err) {
      console.error("Failed to refresh notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Poll for notifications every 60 seconds (MVP polling)
  useEffect(() => {
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user, refreshNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refreshNotifications, markRead, loading }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
