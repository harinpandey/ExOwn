"use client";

import { useState, useEffect, useRef } from "react";
import { Navigation, StopCircle, Clock, AlertCircle, Shield } from "lucide-react";
import { toast } from "react-hot-toast";
import { startSellerLiveLocationSession, type SellerLiveLocationSessionHandle } from "@/lib/live-location-publisher";
import { sendLiveLocationSessionStartedMessage } from "@/actions/chat";

interface SellerLiveLocationControlProps {
  productId: string;
  partnerId: string;
  currentUserId: string;
  onSessionStarted?: () => void;
}

export default function SellerLiveLocationControl({
  productId,
  partnerId,
  currentUserId,
  onSessionStarted,
}: SellerLiveLocationControlProps) {
  const isFeatureEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_LOCATION === "true";

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [stopSyncFailed, setStopSyncFailed] = useState(false);

  const sessionHandleRef = useRef<SellerLiveLocationSessionHandle | null>(null);

  // Clean local tracking on component unmount
  useEffect(() => {
    return () => {
      if (sessionHandleRef.current) {
        sessionHandleRef.current.stop();
        sessionHandleRef.current = null;
      }
    };
  }, []);

  // Countdown timer for UX
  useEffect(() => {
    if (!expiresAt || !activeSessionId) return;

    const updateTimer = () => {
      const diffSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setRemainingSeconds(diffSeconds);
      if (diffSeconds <= 0) {
        setIsExpired(true);
        if (sessionHandleRef.current) {
          sessionHandleRef.current.stop();
          sessionHandleRef.current = null;
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, activeSessionId]);

  if (!isFeatureEnabled) return null;

  const handleConfirmStart = async () => {
    setIsConfirmOpen(false);
    setIsStarting(true);

    try {
      const conversationId = [currentUserId, partnerId].sort().join(":");

      const res = await fetch("/api/live-location/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          buyerId: partnerId,
          conversationId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errMsg = data.error || "Failed to start live location session.";
        toast.error(errMsg);
        return;
      }

      const { id: sessionId, expiresAt: expiresAtIso } = data.session;
      const expiresAtDate = new Date(expiresAtIso);

      // Secure handoff to private chat thread
      await sendLiveLocationSessionStartedMessage(partnerId, sessionId);
      onSessionStarted?.();

      // Start Phase 5B/5C tracking & publishing
      const handle = startSellerLiveLocationSession({
        sessionId,
        expiresAt: expiresAtDate,
        onError: async (err) => {
          if (err.code === "PERMISSION_DENIED" || (err as any).code === "UNSUPPORTED_BROWSER") {
            toast.error("Location permission denied. Live sharing stopped.");
            handle.stop();
            sessionHandleRef.current = null;
            setActiveSessionId(null);
            // Safely stop server session so an empty active session is not left behind
            await fetch("/api/live-location/stop", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId }),
            }).catch(() => {});
          } else if (err.code === "SESSION_EXPIRED") {
            setIsExpired(true);
            setActiveSessionId(null);
          } else {
            toast.error(err.message || "Live location error.");
          }
        },
      });

      sessionHandleRef.current = handle;
      setActiveSessionId(sessionId);
      setExpiresAt(expiresAtDate);
      setIsExpired(false);
      toast.success("Live location sharing active.");
    } catch (err: any) {
      console.error("Start live location failed:", err);
      toast.error(err.message || "Failed to start live location.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    if (isStopping || !activeSessionId) return;
    setIsStopping(true);

    try {
      // 1. Immediately stop local browser GPS and publishing for user privacy
      if (sessionHandleRef.current) {
        sessionHandleRef.current.stop();
        sessionHandleRef.current = null;
      }

      // 2. Synchronize server stop state
      const res = await fetch("/api/live-location/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server stop synchronization failed.");
      }

      setStopSyncFailed(false);
      setActiveSessionId(null);
      setExpiresAt(null);
      toast.success("Live location sharing stopped.");
    } catch (err: any) {
      console.error("Stop live location failed:", err);
      setStopSyncFailed(true);
      toast.error(err.message || "GPS stopped, but server stop sync failed. Please retry.");
    } finally {
      setIsStopping(false);
    }
  };

  const mm = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (remainingSeconds % 60).toString().padStart(2, "0");

  return (
    <>
      {/* Active Sharing State */}
      {stopSyncFailed && activeSessionId ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold">
            <AlertCircle size={13} className="text-rose-600 flex-shrink-0" />
            <span className="hidden sm:inline">GPS stopped; server sync failed</span>
            <span className="sm:hidden">Sync failed</span>
          </div>

          <button
            onClick={handleStop}
            disabled={isStopping}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors disabled:opacity-50"
          >
            <span>{isStopping ? "Retrying..." : "Retry stop"}</span>
          </button>
        </div>
      ) : activeSessionId && !isExpired ? (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 text-orange-700 dark:text-orange-400 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="hidden sm:inline">Live sharing</span>
            <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
              ({mm}:{ss})
            </span>
          </div>

          <button
            onClick={handleStop}
            disabled={isStopping}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors disabled:opacity-50"
          >
            <StopCircle size={12} />
            <span>{isStopping ? "..." : "Stop"}</span>
          </button>
        </div>
      ) : isExpired && activeSessionId ? (
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-gray-500 font-medium">
            <Clock size={12} />
            <span>Expired</span>
          </div>
          <button
            onClick={() => {
              setActiveSessionId(null);
              setExpiresAt(null);
            }}
            className="text-[11px] text-primary font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : (
        /* Dormant Seller Control Button */
        <button
          onClick={() => setIsConfirmOpen(true)}
          disabled={isStarting}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 rounded-xl border border-orange-200/80 dark:border-orange-800/60 transition-all shadow-sm"
        >
          <Navigation size={13} className={isStarting ? "animate-spin" : ""} />
          <span>{isStarting ? "Starting..." : "Share Live Location"}</span>
        </button>
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
              <Shield size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                Share Live Location?
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Share your live location with this buyer? Your location will be shared privately for up to{" "}
                <span className="font-bold text-gray-900 dark:text-white">15 minutes</span>. You can stop sharing at
                any time.
              </p>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-amber-600" />
                <span>Only the current moving coordinate is shared. No history or private address is exposed.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStart}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-primary hover:bg-orange-600 rounded-xl shadow-md shadow-primary/20 transition-all"
              >
                Start Sharing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
