"use client";

import { useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  CheckCheck,
  Clock,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  BellOff,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "ALL" | "UNREAD" | "OFFERS" | "MESSAGES" | "SYSTEM";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotif,
    clearAllNotifs,
    seedDemoNotifs,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await seedDemoNotifs();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredNotifs = notifications.filter((notif) => {
    if (activeTab === "UNREAD") return !notif.isRead;
    if (activeTab === "OFFERS")
      return ["OFFER", "RENTAL_REQUEST", "RENTAL_APPROVED", "RENTAL_REMINDER"].includes(notif.type);
    if (activeTab === "MESSAGES") return notif.type === "MESSAGE";
    if (activeTab === "SYSTEM")
      return ["SYSTEM", "VERIFICATION_STATUS", "PAYMENT_SUCCESS"].includes(notif.type);
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "MESSAGE":
        return <MessageSquare className="text-blue-500" size={18} />;
      case "OFFER":
        return <Tag className="text-emerald-500" size={18} />;
      case "RENTAL_APPROVED":
      case "RENTAL_REQUEST":
        return <CheckCircle2 className="text-amber-500" size={18} />;
      case "VERIFICATION_STATUS":
        return <ShieldCheck className="text-purple-500" size={18} />;
      default:
        return <Bell className="text-blue-600" size={18} />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "OFFER":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "RENTAL_APPROVED":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "VERIFICATION_STATUS":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "MESSAGE":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090d] py-6 px-4 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#10141b] p-4 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-black">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-white/50 font-medium">
                Stay updated on campus deals, rentals & messages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition"
              >
                <CheckCheck size={15} />
                Mark all read
              </button>
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-xl border border-gray-200 dark:border-white/10 transition"
              title="Refresh / Seed test notifications"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>

            {notifications.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Clear all notifications?")) {
                    clearAllNotifs();
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition"
                title="Clear all notifications"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "ALL", label: `All (${notifications.length})` },
            { id: "UNREAD", label: `Unread (${unreadCount})` },
            { id: "OFFERS", label: "Deals & Rentals" },
            { id: "MESSAGES", label: "Messages" },
            { id: "SYSTEM", label: "System & Badges" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-[#10141b] text-gray-600 dark:text-white/70 border border-gray-200 dark:border-white/10 hover:border-blue-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifs.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifs.map((notif) => {
                const formattedTime =
                  typeof notif.createdAt === "string"
                    ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                    : formatDistanceToNow(notif.createdAt, { addSuffix: true });

                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`group relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm ${
                      notif.isRead
                        ? "bg-white dark:bg-[#10141b] border-gray-200 dark:border-white/10 opacity-75 hover:opacity-100"
                        : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-500/30 shadow-blue-500/5"
                    }`}
                  >
                    {/* Icon container */}
                    <div
                      className={`p-3 rounded-xl shrink-0 ${
                        notif.isRead
                          ? "bg-slate-100 dark:bg-white/[0.05]"
                          : "bg-white dark:bg-white/[0.08] shadow-sm"
                      }`}
                    >
                      {getIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded ${getBadgeColor(
                              notif.type
                            )}`}
                          >
                            {notif.type.replace("_", " ")}
                          </span>
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-white/40">
                          <Clock size={12} />
                          {formattedTime}
                        </span>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          notif.isRead
                            ? "text-gray-700 dark:text-white/80"
                            : "text-gray-900 dark:text-white font-extrabold"
                        }`}
                      >
                        {notif.title}
                      </h3>

                      <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-white/60 leading-relaxed">
                        {notif.content}
                      </p>

                      {/* Action Bar */}
                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-white/[0.06] pt-2 text-xs">
                        {notif.link ? (
                          <Link
                            href={notif.link}
                            onClick={() => markRead(notif.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View details <ExternalLink size={12} />
                          </Link>
                        ) : (
                          <span />
                        )}

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => markRead(notif.id)}
                            className="text-[11px] font-semibold text-gray-500 dark:text-white/50 hover:text-blue-600"
                          >
                            {notif.isRead ? "Mark unread" : "Mark as read"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteNotif(notif.id)}
                            className="text-gray-400 hover:text-red-500 transition"
                            title="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-[#10141b] rounded-3xl border border-gray-200 dark:border-white/10 p-10 sm:p-14 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BellOff size={32} />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-1">
              No notifications found
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-white/50 max-w-sm mx-auto mb-6">
              You are all caught up! Want to see how notification alerts look on your account?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleRefresh}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/20 inline-flex items-center gap-2"
              >
                <Sparkles size={15} />
                Generate Sample Notifications
              </button>
              <Link
                href="/"
                className="px-5 py-2.5 bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-white text-xs font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/[0.1] transition"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        )}

        {/* Security / Info Banner */}
        <div className="p-5 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent rounded-2xl border border-blue-500/15">
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Campus Instant Alerts</h4>
              <p className="text-[11px] text-gray-500 dark:text-white/60 leading-relaxed mt-0.5">
                ExOwn notifies you when someone makes an offer on your listing, accepts a rental request, or sends you a chat message. Real-time Firebase push alerts are enabled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
