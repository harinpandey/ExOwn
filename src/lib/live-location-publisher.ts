/**
 * Seller-side Live Location Coordinate Publisher.
 *
 * Requirements:
 * - Browser/Client-only Firestore publishing for active seller sessions.
 * - Targets named Firestore database: "exown" via @/lib/firebase `db`.
 * - Document path: /liveLocationSessions/{sessionId}/location/current
 * - Payload contains exactly: { lat, lng, updatedAt: serverTimestamp() }
 * - No coordinate history or breadcrumb trails.
 * - Authenticated Firebase user required (checked via existing client `auth`).
 * - Double-validates coordinate sanity at publishing boundary.
 * - Feature flag guarded (process.env.NEXT_PUBLIC_ENABLE_LIVE_LOCATION === "true").
 * - Normalized typed error handling.
 * - Zero coordinate or sensitive data logging.
 * - Concurrency control with latest-location semantics (no queue backlog).
 * - Clean stop/cleanup integration with Phase 5B tracking engine.
 */

import { db, auth } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, type Firestore, type DocumentReference } from "firebase/firestore";
import type { Auth } from "firebase/auth";
import {
  isLiveLocationClientEnabled,
  isValidCoordinate,
  startLiveLocationTracking,
  type LiveLocationCoordinates,
  type LiveLocationError,
  type LiveLocationTrackerHandle,
} from "@/lib/live-location-tracker";

export type LiveLocationPublishErrorCode =
  | "FEATURE_DISABLED"
  | "UNAUTHENTICATED"
  | "INVALID_SESSION_ID"
  | "INVALID_COORDINATES"
  | "PERMISSION_DENIED"
  | "SESSION_STOPPED_OR_EXPIRED"
  | "NETWORK_UNAVAILABLE"
  | "UNKNOWN_PUBLISH_ERROR";

export interface LiveLocationPublishError {
  code: LiveLocationPublishErrorCode;
  message: string;
}

export interface PublishResult {
  success: boolean;
  error?: LiveLocationPublishError;
}

export interface PublishDependencies {
  firestoreDb?: Firestore | null;
  authInstance?: Auth | null;
  serverTimestampFn?: () => any;
  setDocFn?: (docRef: DocumentReference, data: any) => Promise<void>;
  docFn?: (db: Firestore, ...pathSegments: string[]) => DocumentReference;
  isFlagEnabledFn?: () => boolean;
}

export interface StartSellerSessionOptions {
  sessionId: string;
  expiresAt?: Date | string | number | null;
  onPublished?: (coordinates: LiveLocationCoordinates) => void;
  onError?: (error: LiveLocationPublishError | LiveLocationError) => void;
  minIntervalMs?: number;
  minDistanceMeters?: number;
  // Dependency injection for deterministic testing:
  startTrackerFn?: typeof startLiveLocationTracking;
  publishFn?: (sessionId: string, coordinates: { lat: number; lng: number }, deps?: PublishDependencies) => Promise<PublishResult>;
  publishDeps?: PublishDependencies;
}

export interface SellerLiveLocationSessionHandle {
  stop: () => void;
  isPublishing: () => boolean;
}

/**
 * Normalizes raw Firebase/Firestore errors into safe, user-friendly typed errors.
 * Never logs coordinate or sensitive document contents.
 */
export function normalizePublishError(err: unknown): LiveLocationPublishError {
  if (!err) {
    return {
      code: "UNKNOWN_PUBLISH_ERROR",
      message: "An unknown error occurred while updating live location.",
    };
  }

  const errorObj = err as any;
  const errorCode = typeof errorObj.code === "string" ? errorObj.code.toLowerCase() : "";
  const errorMessage = typeof errorObj.message === "string" ? errorObj.message : "";

  if (errorCode.includes("permission-denied") || errorMessage.includes("permission-denied")) {
    return {
      code: "PERMISSION_DENIED",
      message: "Location update rejected. You may not be the authorized seller, or the session is no longer active.",
    };
  }

  if (
    errorCode.includes("unavailable") ||
    errorCode.includes("deadline-exceeded") ||
    errorMessage.includes("network") ||
    errorMessage.includes("offline")
  ) {
    return {
      code: "NETWORK_UNAVAILABLE",
      message: "Network unavailable. Failed to publish live location update.",
    };
  }

  if (errorCode.includes("not-found")) {
    return {
      code: "INVALID_SESSION_ID",
      message: "Live location session was not found.",
    };
  }

  return {
    code: "UNKNOWN_PUBLISH_ERROR",
    message: "Failed to publish live location update.",
  };
}

/**
 * Publishes a single validated coordinate fix to Firestore /liveLocationSessions/{sessionId}/location/current.
 */
export async function publishLiveLocation(
  sessionId: string,
  coordinates: { lat: number; lng: number },
  deps?: PublishDependencies
): Promise<PublishResult> {
  // 1. Feature Flag Guard
  const isFlagEnabled = deps?.isFlagEnabledFn ? deps.isFlagEnabledFn() : isLiveLocationClientEnabled();
  if (!isFlagEnabled) {
    return {
      success: false,
      error: {
        code: "FEATURE_DISABLED",
        message: "Live location publishing is currently disabled.",
      },
    };
  }

  // 2. SessionId Validation
  if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
    return {
      success: false,
      error: {
        code: "INVALID_SESSION_ID",
        message: "A valid sessionId is required to publish live location.",
      },
    };
  }
  const validSessionId = sessionId.trim();

  // 3. Boundary Coordinate Validation
  if (!coordinates || !isValidCoordinate(coordinates.lat, coordinates.lng)) {
    return {
      success: false,
      error: {
        code: "INVALID_COORDINATES",
        message: "Coordinates must be finite numbers within physical geographic bounds.",
      },
    };
  }

  // 4. Client Authentication Guard
  const authClient = deps?.authInstance !== undefined ? deps.authInstance : auth;
  if (!authClient?.currentUser) {
    return {
      success: false,
      error: {
        code: "UNAUTHENTICATED",
        message: "You must be signed in to publish live location.",
      },
    };
  }

  // 5. Firestore Client Availability Guard
  const dbClient = deps?.firestoreDb !== undefined ? deps.firestoreDb : db;
  if (!dbClient) {
    return {
      success: false,
      error: {
        code: "UNKNOWN_PUBLISH_ERROR",
        message: "Firestore database client is unavailable.",
      },
    };
  }

  // 6. Write exactly { lat, lng, updatedAt: serverTimestamp() } to /liveLocationSessions/{sessionId}/location/current
  const docFn = deps?.docFn ?? (doc as any);
  const setDocFn = deps?.setDocFn ?? setDoc;
  const serverTimestampFn = deps?.serverTimestampFn ?? serverTimestamp;

  try {
    const docRef = docFn(
      dbClient,
      "liveLocationSessions",
      validSessionId,
      "location",
      "current"
    );

    await setDocFn(docRef, {
      lat: coordinates.lat,
      lng: coordinates.lng,
      updatedAt: serverTimestampFn(),
    });

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: normalizePublishError(err),
    };
  }
}

/**
 * Wires Phase 5B tracking engine with Phase 5C Firestore publishing.
 * Coordinates GPS emission with latest-location delivery semantics.
 */
export function startSellerLiveLocationSession(
  options: StartSellerSessionOptions
): SellerLiveLocationSessionHandle {
  const sessionId = options.sessionId?.trim();
  if (!sessionId) {
    options.onError?.({
      code: "INVALID_SESSION_ID",
      message: "A valid sessionId is required to start a live location session.",
    });
    return {
      stop: () => {},
      isPublishing: () => false,
    };
  }

  const startTracker = options.startTrackerFn ?? startLiveLocationTracking;
  const publish = options.publishFn ?? publishLiveLocation;

  let isSessionStopped = false;
  let isPublishInProgress = false;
  let queuedLatestFix: LiveLocationCoordinates | null = null;

  const trackerHandle: LiveLocationTrackerHandle = startTracker({
    expiresAt: options.expiresAt,
    minIntervalMs: options.minIntervalMs,
    minDistanceMeters: options.minDistanceMeters,
    onLocation: async (coords: LiveLocationCoordinates) => {
      if (isSessionStopped) return;

      if (isPublishInProgress) {
        // Enforce latest-location semantics: only retain the newest fix, avoid queue backlog
        queuedLatestFix = coords;
        return;
      }

      isPublishInProgress = true;
      try {
        let currentToPublish: LiveLocationCoordinates | null = coords;

        while (currentToPublish && !isSessionStopped) {
          const toSend = currentToPublish;
          currentToPublish = null;
          queuedLatestFix = null;

          const res = await publish(
            sessionId,
            { lat: toSend.lat, lng: toSend.lng },
            options.publishDeps
          );

          if (isSessionStopped) break;

          if (res.success) {
            options.onPublished?.(toSend);
          } else if (res.error) {
            options.onError?.(res.error);
            // Drop queued fix if publishing encountered an error; do not backlog stale coordinates
            queuedLatestFix = null;
            break;
          }

          if (queuedLatestFix) {
            currentToPublish = queuedLatestFix;
            queuedLatestFix = null;
          }
        }
      } finally {
        isPublishInProgress = false;
      }
    },
    onError: (err: LiveLocationError) => {
      if (!isSessionStopped) {
        options.onError?.(err);
      }
    },
  });

  const stop = () => {
    if (isSessionStopped) return;
    isSessionStopped = true;
    queuedLatestFix = null;
    trackerHandle.stop();
  };

  return {
    stop,
    isPublishing: () => !isSessionStopped && trackerHandle.isTracking(),
  };
}
