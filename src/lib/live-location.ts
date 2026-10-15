import "server-only";
import * as admin from "firebase-admin";
import prisma from "@/lib/prisma";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { LiveLocationSession } from "@prisma/client";

/**
 * Feature flag check for Live Location operations.
 * Must be strictly disabled unless ENABLE_LIVE_LOCATION === "true".
 */
export function isLiveLocationEnabled(): boolean {
  return process.env.ENABLE_LIVE_LOCATION === "true";
}

/**
 * Resolves the genuine Firebase Authentication UID for a user.
 * Ensures Firestore Security Rules will match request.auth.uid.
 */
export async function resolveFirebaseUid(user: { id?: string; uid?: string; email?: string | null; firebaseUid?: string }): Promise<string> {
  if (user.firebaseUid) return user.firebaseUid;

  const targetId = user.uid || user.id || "";

  if (adminAuth && targetId) {
    try {
      const fbUser = await adminAuth.getUser(targetId);
      if (fbUser?.uid) return fbUser.uid;
    } catch {
      // not found directly by id
    }
  }

  if (adminAuth && user.email) {
    try {
      const fbUser = await adminAuth.getUserByEmail(user.email);
      if (fbUser?.uid) return fbUser.uid;
    } catch {
      // not found by email
    }
  }

  return targetId;
}

/**
 * Enforces server-side 15-minute expiration invariant.
 * If expiresAt has passed and status is ACTIVE, persists EXPIRED state to PostgreSQL
 * and synchronizes the Firestore parent document metadata.
 */
export async function syncSessionExpiry(session: LiveLocationSession): Promise<LiveLocationSession> {
  const now = new Date();
  if (session.status === "ACTIVE" && now >= session.expiresAt) {
    const stoppedAt = session.stoppedAt || session.expiresAt;
    const updated = await prisma.liveLocationSession.update({
      where: { id: session.id },
      data: {
        status: "EXPIRED",
        stoppedAt,
      },
    });

    if (adminDb) {
      try {
        await adminDb.collection("liveLocationSessions").doc(session.id).set(
          {
            status: "EXPIRED",
            stoppedAt: admin.firestore.Timestamp.fromDate(stoppedAt),
          },
          { merge: true }
        );
      } catch (fsError) {
        console.error("[live-location:expiry] Failed to synchronize EXPIRED state to Firestore:", fsError);
      }
    }

    return updated;
  }
  return session;
}
