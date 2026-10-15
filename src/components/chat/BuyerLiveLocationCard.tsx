"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { Navigation, Clock, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  subscribeToLiveLocation,
  type BuyerLiveLocation,
  type LiveLocationSubscriptionHandle,
} from "@/lib/live-location-listener";

const LiveLocationMap = dynamic(() => import("@/components/chat/LiveLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-48 md:h-56 w-full rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center text-xs text-gray-400 font-medium">
      Loading live map...
    </div>
  ),
});

interface BuyerLiveLocationCardProps {
  sessionId: string;
  expiresAt: string | Date;
  startedAt?: string | Date;
  isCurrentUserSender: boolean;
}

export default function BuyerLiveLocationCard({
  sessionId,
  expiresAt,
  isCurrentUserSender,
}: BuyerLiveLocationCardProps) {
  const isFeatureEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_LOCATION === "true";

  const [currentLocation, setCurrentLocation] = useState<BuyerLiveLocation | null>(null);
  const [sessionState, setSessionState] = useState<"WAITING" | "ACTIVE" | "STOPPED" | "EXPIRED" | "ERROR">("WAITING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const subscriptionHandleRef = useRef<LiveLocationSubscriptionHandle | null>(null);
  const expiryDate = useMemo(() => new Date(expiresAt), [expiresAt]);

  // Countdown timer for UX
  useEffect(() => {
    const updateCountdown = () => {
      const diffSeconds = Math.max(0, Math.floor((expiryDate.getTime() - Date.now()) / 1000));
      setRemainingSeconds(diffSeconds);
      if (diffSeconds <= 0 && sessionState !== "STOPPED") {
        setSessionState("EXPIRED");
        if (subscriptionHandleRef.current) {
          subscriptionHandleRef.current.unsubscribe();
          subscriptionHandleRef.current = null;
        }
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiryDate, sessionState]);

  // Subscribe to Phase 5D listener
  useEffect(() => {
    if (!isFeatureEnabled || !sessionId) return;

    // Check if session has already expired before subscribing
    if (Date.now() >= expiryDate.getTime()) {
      setSessionState("EXPIRED");
      return;
    }

    const handle = subscribeToLiveLocation(sessionId, {
      onNoCurrentLocation: () => {
        setSessionState("WAITING");
      },
      onLocationUpdate: (loc) => {
        setCurrentLocation(loc);
        setSessionState("ACTIVE");
      },
      onSessionEnded: (reason) => {
        if (reason === "SESSION_STOPPED") {
          setSessionState("STOPPED");
        } else if (reason === "SESSION_EXPIRED") {
          setSessionState("EXPIRED");
        }
      },
      onError: (err) => {
        if (err.code === "SESSION_STOPPED") {
          setSessionState("STOPPED");
        } else if (err.code === "SESSION_EXPIRED") {
          setSessionState("EXPIRED");
        } else if (err.code === "PERMISSION_DENIED") {
          // May be an already finished session or unauthorized
          setSessionState("STOPPED");
        } else {
          setSessionState("ERROR");
          setErrorMessage(err.message || "Live location updates unavailable.");
        }
      },
    });

    subscriptionHandleRef.current = handle;

    return () => {
      if (subscriptionHandleRef.current) {
        subscriptionHandleRef.current.unsubscribe();
        subscriptionHandleRef.current = null;
      }
    };
  }, [sessionId, isFeatureEnabled, expiryDate]);

  if (!isFeatureEnabled) return null;

  const mm = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (remainingSeconds % 60).toString().padStart(2, "0");

  return (
    <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-900 rounded-3xl border border-orange-200/80 dark:border-gray-800 shadow-md overflow-hidden text-gray-900 dark:text-gray-100 my-1">
      {/* Card Header */}
      <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-orange-50/40 dark:bg-orange-950/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
            <MapPin size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-tight">
                {sessionState === "STOPPED"
                  ? "Live location ended"
                  : sessionState === "EXPIRED"
                  ? "Live location expired"
                  : isCurrentUserSender
                  ? "Your Live Location"
                  : "Seller Live Location"}
              </span>
              {sessionState === "ACTIVE" && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
            {currentLocation && sessionState === "ACTIVE" && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                Updated {formatDistanceToNow(currentLocation.updatedAt, { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        {sessionState === "ACTIVE" || sessionState === "WAITING" ? (
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
            {mm}:{ss}
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
            {sessionState}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3 space-y-3">
        {sessionState === "WAITING" ? (
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-2 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/60 text-primary flex items-center justify-center animate-pulse">
              <Navigation size={18} />
            </div>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Waiting for seller&apos;s location…
            </p>
            <p className="text-[11px] text-gray-400 max-w-xs">
              The seller has started sharing. The live map will appear as soon as the first coordinate is received.
            </p>
          </div>
        ) : sessionState === "ACTIVE" && currentLocation ? (
          <div className="space-y-1.5">
            <LiveLocationMap lat={currentLocation.lat} lng={currentLocation.lng} />
            <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
              <span>Moving coordinate marker</span>
              <span>Campus Privacy Shield active</span>
            </div>
          </div>
        ) : sessionState === "STOPPED" ? (
          <div className="p-4 flex items-center gap-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
            <CheckCircle2 size={16} className="text-gray-400 flex-shrink-0" />
            <span>This live location sharing session was stopped.</span>
          </div>
        ) : sessionState === "EXPIRED" ? (
          <div className="p-4 flex items-center gap-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
            <Clock size={16} className="text-gray-400 flex-shrink-0" />
            <span>This 15-minute live location session has expired.</span>
          </div>
        ) : (
          <div className="p-4 flex items-center gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage || "Live location updates are currently unavailable."}</span>
          </div>
        )}
      </div>
    </div>
  );
}
