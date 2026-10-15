/**
 * Browser-side Live Location tracking engine for Sellers.
 *
 * Requirements:
 * - Browser-only (SSR-safe).
 * - Feature flag guarded (process.env.NEXT_PUBLIC_ENABLE_LIVE_LOCATION === "true").
 * - Validates coordinate sanity (finite lat [-90, 90], finite lng [-180, 180]).
 * - Emits first valid GPS fix immediately.
 * - Throttles subsequent emissions to >= 5 seconds AND >= 10 meters Haversine movement from the last emitted point.
 * - Evaluates delayed fixes against the last emitted position when the 5s window elapses.
 * - Idempotent stop/cleanup.
 * - Handles Geolocation errors with typed codes.
 * - Client session expiry cleanup.
 * - Zero Firestore writes or listeners.
 * - Zero coordinate logging.
 * - Zero reverse-geocoding.
 */

export type LiveLocationErrorCode =
  | "FEATURE_DISABLED"
  | "UNSUPPORTED_BROWSER"
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "SESSION_EXPIRED"
  | "UNKNOWN_ERROR";

export interface LiveLocationError {
  code: LiveLocationErrorCode;
  message: string;
}

export interface LiveLocationCoordinates {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface LiveLocationEngineOptions {
  onLocation: (location: LiveLocationCoordinates) => void;
  onError?: (error: LiveLocationError) => void;
  onAutoStop?: () => void;
  expiresAt?: Date | string | number | null;
  minIntervalMs?: number;
  minDistanceMeters?: number;
  nowFn?: () => number;
  setTimeoutFn?: (callback: () => void, ms: number) => any;
  clearTimeoutFn?: (timerId: any) => void;
}

export interface LiveLocationTrackerOptions {
  onLocation: (location: LiveLocationCoordinates) => void;
  onError?: (error: LiveLocationError) => void;
  expiresAt?: Date | string | number | null;
  minIntervalMs?: number;
  minDistanceMeters?: number;
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}

export interface LiveLocationTrackerHandle {
  stop: () => void;
  isTracking: () => boolean;
}

const EARTH_RADIUS_METERS = 6371000;

/**
 * Checks whether client-side Live Location is enabled via environment flag.
 */
export function isLiveLocationClientEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_LIVE_LOCATION === "true";
}

/**
 * Validates that latitude and longitude are finite numbers within physical geographic bounds.
 */
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lng === "number" &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Validates a numeric timestamp.
 */
export function isValidTimestamp(ts: unknown): boolean {
  return typeof ts === "number" && Number.isFinite(ts) && ts > 0;
}

/**
 * Calculates great-circle distance between two geographic coordinates using the Haversine formula.
 * Returns distance in meters.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Core Live Location filtering engine.
 * Pure logic decoupled from browser navigator.geolocation for deterministic testability.
 */
export class LiveLocationEngine {
  private lastEmittedPosition: LiveLocationCoordinates | null = null;
  private lastEmittedAt: number = 0;
  private pendingFix: LiveLocationCoordinates | null = null;
  private throttleTimer: any = null;
  private expiryTimer: any = null;
  private isStoppedState: boolean = false;

  private readonly onLocation: (location: LiveLocationCoordinates) => void;
  private readonly onError?: (error: LiveLocationError) => void;
  private readonly onAutoStop?: () => void;
  private readonly minIntervalMs: number;
  private readonly minDistanceMeters: number;
  private readonly nowFn: () => number;
  private readonly setTimeoutFn: (callback: () => void, ms: number) => any;
  private readonly clearTimeoutFn: (timerId: any) => void;

  constructor(options: LiveLocationEngineOptions) {
    this.onLocation = options.onLocation;
    this.onError = options.onError;
    this.onAutoStop = options.onAutoStop;
    this.minIntervalMs = options.minIntervalMs ?? 5000;
    this.minDistanceMeters = options.minDistanceMeters ?? 10;
    this.nowFn = options.nowFn ?? Date.now;
    this.setTimeoutFn = options.setTimeoutFn ?? setTimeout;
    this.clearTimeoutFn = options.clearTimeoutFn ?? clearTimeout;

    if (options.expiresAt) {
      const expiryMs =
        typeof options.expiresAt === "number"
          ? options.expiresAt
          : new Date(options.expiresAt).getTime();

      if (Number.isFinite(expiryMs)) {
        const now = this.nowFn();
        if (now >= expiryMs) {
          this.isStoppedState = true;
          this.onError?.({
            code: "SESSION_EXPIRED",
            message: "Live location session has already expired.",
          });
          this.onAutoStop?.();
        } else {
          const remainingMs = expiryMs - now;
          this.expiryTimer = this.setTimeoutFn(() => {
            this.handleExpiry();
          }, remainingMs);
        }
      }
    }
  }

  public isTracking(): boolean {
    return !this.isStoppedState;
  }

  public getLastEmittedPosition(): LiveLocationCoordinates | null {
    return this.lastEmittedPosition ? { ...this.lastEmittedPosition } : null;
  }

  public processFix(rawCoords: { lat: unknown; lng: unknown; timestamp?: unknown }): boolean {
    if (this.isStoppedState) return false;

    if (!isValidCoordinate(rawCoords.lat, rawCoords.lng)) {
      return false;
    }

    const now = this.nowFn();
    const timestamp = isValidTimestamp(rawCoords.timestamp)
      ? (rawCoords.timestamp as number)
      : now;

    const validFix: LiveLocationCoordinates = {
      lat: rawCoords.lat as number,
      lng: rawCoords.lng as number,
      timestamp,
    };

    // First valid position: emit immediately
    if (this.lastEmittedPosition === null) {
      this.emitPosition(validFix, now);
      return true;
    }

    // Distance calculated against LAST EMITTED coordinate
    const dist = calculateHaversineDistance(
      this.lastEmittedPosition.lat,
      this.lastEmittedPosition.lng,
      validFix.lat,
      validFix.lng
    );

    const elapsed = now - this.lastEmittedAt;

    if (elapsed >= this.minIntervalMs) {
      if (dist >= this.minDistanceMeters) {
        this.clearPendingThrottle();
        this.emitPosition(validFix, now);
        return true;
      }
      return false;
    } else {
      if (dist >= this.minDistanceMeters) {
        this.pendingFix = validFix;
        if (this.throttleTimer === null) {
          const waitMs = Math.max(0, this.minIntervalMs - elapsed);
          this.throttleTimer = this.setTimeoutFn(() => {
            this.handleThrottleTimeout();
          }, waitMs);
        }
        return false;
      } else {
        if (this.throttleTimer !== null) {
          this.pendingFix = validFix;
        }
        return false;
      }
    }
  }

  private handleThrottleTimeout(): void {
    this.throttleTimer = null;
    if (this.isStoppedState) return;

    if (this.pendingFix && this.lastEmittedPosition) {
      const candidate = this.pendingFix;
      this.pendingFix = null;

      const dist = calculateHaversineDistance(
        this.lastEmittedPosition.lat,
        this.lastEmittedPosition.lng,
        candidate.lat,
        candidate.lng
      );

      if (dist >= this.minDistanceMeters) {
        this.emitPosition(candidate, this.nowFn());
      }
    }
  }

  private emitPosition(pos: LiveLocationCoordinates, emittedAt: number): void {
    this.lastEmittedPosition = pos;
    this.lastEmittedAt = emittedAt;
    this.onLocation(pos);
  }

  private clearPendingThrottle(): void {
    if (this.throttleTimer !== null) {
      this.clearTimeoutFn(this.throttleTimer);
      this.throttleTimer = null;
    }
    this.pendingFix = null;
  }

  private handleExpiry(): void {
    this.expiryTimer = null;
    if (this.isStoppedState) return;

    this.stop();
    this.onError?.({
      code: "SESSION_EXPIRED",
      message: "Live location duration expired.",
    });
    this.onAutoStop?.();
  }

  public stop(): void {
    if (this.isStoppedState) return;
    this.isStoppedState = true;

    this.clearPendingThrottle();

    if (this.expiryTimer !== null) {
      this.clearTimeoutFn(this.expiryTimer);
      this.expiryTimer = null;
    }

    this.lastEmittedPosition = null;
  }
}

/**
 * Starts live-location tracking using navigator.geolocation.watchPosition().
 * Safe to call only in browser contexts.
 */
export function startLiveLocationTracking(
  options: LiveLocationTrackerOptions
): LiveLocationTrackerHandle {
  // 1. Feature Flag Guard
  if (!isLiveLocationClientEnabled()) {
    options.onError?.({
      code: "FEATURE_DISABLED",
      message: "Live location tracking is currently disabled.",
    });
    return {
      stop: () => {},
      isTracking: () => false,
    };
  }

  // 2. SSR & Browser Geolocation Availability Check
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    !navigator.geolocation
  ) {
    options.onError?.({
      code: "UNSUPPORTED_BROWSER",
      message: "Geolocation is not supported by this browser environment.",
    });
    return {
      stop: () => {},
      isTracking: () => false,
    };
  }

  // 3. Expiry Pre-check
  if (options.expiresAt) {
    const expiryMs =
      typeof options.expiresAt === "number"
        ? options.expiresAt
        : new Date(options.expiresAt).getTime();

    if (Number.isFinite(expiryMs) && Date.now() >= expiryMs) {
      options.onError?.({
        code: "SESSION_EXPIRED",
        message: "Live location session has already expired.",
      });
      return {
        stop: () => {},
        isTracking: () => false,
      };
    }
  }

  let watchId: number | null = null;
  let isHandleStopped = false;

  const engine = new LiveLocationEngine({
    ...options,
    onAutoStop: () => {
      cleanupWatch();
    },
  });

  function cleanupWatch() {
    if (watchId !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        navigator.geolocation.clearWatch(watchId);
      } catch {
        // Safe swallow
      }
      watchId = null;
    }
  }

  const geoOptions: PositionOptions = {
    enableHighAccuracy: options.highAccuracy ?? true,
    timeout: options.timeoutMs ?? 10000,
    maximumAge: options.maximumAgeMs ?? 0,
  };

  try {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (isHandleStopped) return;
        engine.processFix({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp || Date.now(),
        });
      },
      (geoError) => {
        if (isHandleStopped) return;
        let code: LiveLocationErrorCode = "UNKNOWN_ERROR";
        let message = "An unknown error occurred while retrieving location.";

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            code = "PERMISSION_DENIED";
            message = "Permission to access location was denied.";
            break;
          case geoError.POSITION_UNAVAILABLE:
            code = "POSITION_UNAVAILABLE";
            message = "Location information is unavailable.";
            break;
          case geoError.TIMEOUT:
            code = "TIMEOUT";
            message = "The request to get your location timed out.";
            break;
        }

        options.onError?.({ code, message });
      },
      geoOptions
    );
  } catch (err: any) {
    options.onError?.({
      code: "UNKNOWN_ERROR",
      message: err?.message || "Failed to start location watching.",
    });
    return {
      stop: () => {},
      isTracking: () => false,
    };
  }

  return {
    stop: () => {
      if (isHandleStopped) return;
      isHandleStopped = true;
      cleanupWatch();
      engine.stop();
    },
    isTracking: () => !isHandleStopped && engine.isTracking(),
  };
}
