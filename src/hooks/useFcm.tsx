"use client";

import { useEffect, useState } from "react";
import { getMessaging, onMessage, getToken } from "firebase/messaging";
import { app } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { saveFcmToken } from "@/actions/user";

export function useFcm() {
  const { user } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (!user || typeof window === "undefined" || !("Notification" in window)) return;

    const initializeFcm = async () => {
      try {
        const messaging = getMessaging(app);
        
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Get token
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY // You'll need to add this to .env
        });

        if (token) {
          setFcmToken(token);
          await saveFcmToken(user.uid, token);
        }

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          console.log("Foreground message received:", payload);
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl rounded-[2rem] pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-6 border border-primary/20`}>
              <div className="flex-1 w-0">
                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">
                  {payload.notification?.title || "New Notification"}
                </p>
                <p className="text-sm font-bold text-gray-500">
                  {payload.notification?.body}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="bg-gray-100 dark:bg-gray-800 rounded-xl p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ), { duration: 5000 });
        });
      } catch (err) {
        console.error("FCM Initialization error:", err);
      }
    };

    initializeFcm();
  }, [user]);

  return { fcmToken };
}
