"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, MessageSquare, Tag, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/notifications");
    }
    
    // In a real app, you'd fetch from DB. For now, we'll show a "No notifications" state
    // or mock some data if we want to wow the user.
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-primary transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
          </div>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            {notifications.length} New
          </span>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-4">
            {/* Notification items would go here */}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center shadow-xl">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell size={40} />
            </div>
            <h2 className="text-xl font-bold mb-2">All caught up!</h2>
            <p className="text-gray-500 max-w-xs mx-auto mb-8">
              No new notifications at the moment. We'll let you know when something important happens.
            </p>
            <Link 
              href="/"
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg inline-block"
            >
              Back to Marketplace
            </Link>
          </div>
        )}

        {/* Feature Teaser */}
        <div className="mt-12 p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl border border-primary/5">
          <div className="flex gap-4">
            <div className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm h-max">
              <ShieldAlert className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="font-bold mb-1">Safety First</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We'll notify you here for security alerts, account verification status, and deal updates. Keep an eye on this space!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
