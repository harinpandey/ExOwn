/**
 * Buyer-side Realtime Live Location Listener.
 *
 * Requirements:
 * - Subscribes to /liveLocationSessions/{sessionId}/location/current in named database "exown".
 * - Uses existing client Firestore `db` from @/lib/firebase.
 * - Authenticated Firebase user required.
 * - Validates every snapshot: requires strictly lat, lng, updatedAt (Firestore Timestamp).
 * - Rejects malformed snapshots or unexpected extra fields.
 * - Minimal UI-facing coordinate object: { lat, lng, updatedAt: Date }.
 * - Distinct NO_CURRENT_LOCATION state when document does not exist yet.
 * - No coordinate history or breadcrumb accumulation.
 * - Idempotent, leak-free unsubscribe().
 * - Reconciles permission-denied errors against GET /api/live-location/status (exactly once, no polling loop).
 * - Zero coordinate or snapshot logging.
 */

import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot, type Firestore, type DocumentReference, type Unsubscribe } from "firebase/firestore";
import type { Auth } from "firebase/auth";
import { isLiveLocationClientEnabled } from "@/lib/live-location-tracker";

export interface BuyerLiveLocation {
  lat: number;
  lng: number;
  updatedAt: Date;
}

export type BuyerLiveLocationErrorCode =
  | "FEATURE_DISABLED"
  | "UNAUTHENTICATED"
  | "INVALID_SESSION_ID"
  | "MALFORMED_LOCATION_DATA"
  | "PERMISSION_DENIED"
  | "NETWORK_UNAVAILABLE"
  | "SESSION_STOPPED"
  | "SESSION_EXPIRED"
  | "SESSION_NOT_FOUND"
  | "UNAUTHORIZED"
  | "UNKNOWN_ERROR";

export interface BuyerLiveLocationError {
  code: BuyerLiveLocationErrorCode;
  message: string;
}

export interface LiveLocationSubscriberCallbacks {
  onLocationUpdate?: (location: BuyerLiveLocation) => void;
  onNoCurrentLocation?: () => void;
  onError?: (error: BuyerLiveLocationError) => void;
  onSessionEnded?: (reason: "SESSION_STOPPED" | "SESSION_EXPIRED") => void;
}

export interface LiveLocationSubscriptionHandle {
  unsubscribe: () => void;
  isSubscribed: () => boolean;
}

export interface StatusCheckResult {
  httpStatus: number;
  status?: string;
  error?: string;
}

export interface BuyerSubscriptionDependencies {
  firestoreDb?: Firestore | null;
  authInstance?: Auth | null;
  onSnapshotFn?: typeof onSnapshot;
  docFn?: (db: Firestore, ...pathSegments: string[]) => DocumentReference;
  isFlagEnabledFn?: () => boolean;
  fetchStatusFn?: (sessionId: string) => Promise<StatusCheckResult>;
}

/**
 * Validates and extracts minimal location data from raw Firestore document data.
 * Rejects snapshots containing extra fields, malformed coordinates, or invalid timestamps.
 */
export function parseAndValidateLocationSnapshot(data: unknown): BuyerLiveLocation | null {
  if (!data || typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;
  const keys = Object.keys(obj);

  // Require strictly lat, lng, and updatedAt and NO extra fields
  if (keys.length !== 3 || !("lat" in obj) || !("lng" in obj) || !("updatedAt" in obj)) {
    return null;
  }

  const { lat, lng, updatedAt } = obj;

  if (
    typeof lat !== "number" ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90 ||
    typeof lng !== "number" ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  let updatedAtDate: Date | null = null;
  if (updatedAt && typeof (updatedAt as any).toDate === "function") {
    updatedAtDate = (updatedAt as any).toDate();
  } else if (updatedAt instanceof Date) {
    updatedAtDate = updatedAt;
  } else if (typeof (updatedAt as any)?.seconds === "number") {
    updatedAtDate = new Date((updatedAt as any).seconds * 1000);
  }

  if (!updatedAtDate || isNaN(updatedAtDate.getTime())) {
    return null;
  }

  return {
    lat,
    lng,
    updatedAt: updatedAtDate,
  };
}

/**
 * Authoritative single lifecycle status check via server status API.
 */
export async function fetchSessionStatus(sessionId: string): Promise<StatusCheckResult> {
  try {
    const res = await fetch(`/api/live-location/status?sessionId=${encodeURIComponent(sessionId)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return {
      httpStatus: res.status,
      status: data.session?.status,
      error: data.error,
    };
  } catch (err: any) {
    return {
      httpStatus: 0,
      error: err?.message || "Network error fetching session status",
    };
  }
}

/**
 * Subscribes to the current coordinate of an active live location session.
 */
export function subscribeToLiveLocation(
  sessionId: string,
  callbacks: LiveLocationSubscriberCallbacks,
  deps?: BuyerSubscriptionDependencies
): LiveLocationSubscriptionHandle {
  // 1. Feature Flag Guard
  const isFlagEnabled = deps?.isFlagEnabledFn ? deps.isFlagEnabledFn() : isLiveLocationClientEnabled();
  if (!isFlagEnabled) {
    callbacks.onError?.({
      code: "FEATURE_DISABLED",
      message: "Live location is currently disabled.",
    });
    return {
      unsubscribe: () => {},
      isSubscribed: () => false,
    };
  }

  // 2. SessionId Validation
  if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
    callbacks.onError?.({
      code: "INVALID_SESSION_ID",
      message: "A valid sessionId is required to subscribe to live location.",
    });
    return {
      unsubscribe: () => {},
      isSubscribed: () => false,
    };
  }
  const validSessionId = sessionId.trim();

  // 3. Client Authentication Guard
  const authClient = deps?.authInstance !== undefined ? deps.authInstance : auth;
  if (!authClient?.currentUser) {
    callbacks.onError?.({
      code: "UNAUTHENTICATED",
      message: "You must be signed in to view live location.",
    });
    return {
      unsubscribe: () => {},
      isSubscribed: () => false,
    };
  }

  // 4. Firestore Client Guard
  const dbClient = deps?.firestoreDb !== undefined ? deps.firestoreDb : db;
  if (!dbClient) {
    callbacks.onError?.({
      code: "UNKNOWN_ERROR",
      message: "Firestore database client is unavailable.",
    });
    return {
      unsubscribe: () => {},
      isSubscribed: () => false,
    };
  }

  let isUnsubscribed = false;
  let rawUnsubscribe: Unsubscribe | null = null;
  let hasCheckedStatus = false;

  const docFn = deps?.docFn ?? (doc as any);
  const onSnapshotFn = deps?.onSnapshotFn ?? onSnapshot;

  const docRef = docFn(
    dbClient,
    "liveLocationSessions",
    validSessionId,
    "location",
    "current"
  );

  const detachRawListener = () => {
    if (rawUnsubscribe) {
      try {
        rawUnsubscribe();
      } catch {
        // Safe swallow
      }
      rawUnsubscribe = null;
    }
  };

  const handleUnsubscribe = () => {
    if (isUnsubscribed) return;
    isUnsubscribed = true;
    detachRawListener();
  };

  try {
    rawUnsubscribe = onSnapshotFn(
      docRef,
      (snapshot: any) => {
        if (isUnsubscribed) return;

        if (!snapshot.exists()) {
          // Document has not yet been published by the seller
          callbacks.onNoCurrentLocation?.();
          return;
        }

        const validatedLocation = parseAndValidateLocationSnapshot(snapshot.data());
        if (validatedLocation) {
          callbacks.onLocationUpdate?.(validatedLocation);
        } else {
          callbacks.onError?.({
            code: "MALFORMED_LOCATION_DATA",
            message: "Received invalid location data from session.",
          });
        }
      },
      async (error: any) => {
        if (isUnsubscribed) return;

        const errorCode = typeof error?.code === "string" ? error.code.toLowerCase() : "";
        const errorMessage = typeof error?.message === "string" ? error.message.toLowerCase() : "";

        // Permission-denied triggers exactly ONE safe status check against server lifecycle API
        if (errorCode.includes("permission-denied") || errorMessage.includes("permission-denied")) {
          if (!hasCheckedStatus) {
            hasCheckedStatus = true;
            detachRawListener();

            const checkStatus = deps?.fetchStatusFn ?? fetchSessionStatus;
            try {
              const statusRes = await checkStatus(validSessionId);
              if (isUnsubscribed) return;
              isUnsubscribed = true;

              if (statusRes.status === "STOPPED") {
                callbacks.onSessionEnded?.("SESSION_STOPPED");
                callbacks.onError?.({
                  code: "SESSION_STOPPED",
                  message: "Live location sharing was stopped by the seller.",
                });
                return;
              }

              if (statusRes.status === "EXPIRED") {
                callbacks.onSessionEnded?.("SESSION_EXPIRED");
                callbacks.onError?.({
                  code: "SESSION_EXPIRED",
                  message: "Live location session has expired.",
                });
                return;
              }

              if (statusRes.httpStatus === 403) {
                callbacks.onError?.({
                  code: "UNAUTHORIZED",
                  message: "You are not authorized to view this live location session.",
                });
                return;
              }

              if (statusRes.httpStatus === 404) {
                callbacks.onError?.({
                  code: "SESSION_NOT_FOUND",
                  message: "Live location session was not found.",
                });
                return;
              }

              // Fallback if status returned ACTIVE but rules denied or other error
              callbacks.onError?.({
                code: "PERMISSION_DENIED",
                message: "Permission to access live location was denied.",
              });
            } catch {
              if (isUnsubscribed) return;
              callbacks.onError?.({
                code: "PERMISSION_DENIED",
                message: "Permission to access live location was denied.",
              });
            }
          }
          return;
        }

        if (
          errorCode.includes("unavailable") ||
          errorCode.includes("deadline-exceeded") ||
          errorMessage.includes("network") ||
          errorMessage.includes("offline")
        ) {
          callbacks.onError?.({
            code: "NETWORK_UNAVAILABLE",
            message: "Network unavailable. Live location updates are temporarily disconnected.",
          });
          return;
        }

        callbacks.onError?.({
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred while listening to live location.",
        });
      }
    );
  } catch (err: any) {
    callbacks.onError?.({
      code: "UNKNOWN_ERROR",
      message: err?.message || "Failed to start live location listener.",
    });
    return {
      unsubscribe: () => {},
      isSubscribed: () => false,
    };
  }

  return {
    unsubscribe: handleUnsubscribe,
    isSubscribed: () => !isUnsubscribed,
  };
}
