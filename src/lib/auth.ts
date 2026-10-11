import "server-only";

import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { Role } from "@prisma/client";
import { adminAuth } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "__exown_session";

export type CurrentUser = {
  uid: string;
  firebaseUid?: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
};

function hasValidAudience(decoded: DecodedIdToken) {
  const adminProjectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^"|"$/g, "");
  if (adminProjectId && decoded.aud !== adminProjectId) {
    console.error(`[auth:security] Token audience mismatch. Token: ${decoded.aud}, Expected: ${adminProjectId}`);
    return false;
  }
  return true;
}

export async function verifyFirebaseIdToken(token?: string | null): Promise<DecodedIdToken | null> {
  if (!token) {
    console.log("[auth] No token provided to verifyFirebaseIdToken");
    return null;
  }
  if (!adminAuth) {
    console.error("[auth] Firebase Admin SDK not initialized (adminAuth is null)");
    return null;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    console.log(`[auth] ID token verified. UID: ${decoded.uid}, Email: ${decoded.email}, Project ID: ${decoded.aud}`);
    return hasValidAudience(decoded) ? decoded : null;
  } catch (error: any) {
    console.error("[auth:security] Firebase token verification failed:", error.message);
    if (error.code === 'auth/id-token-expired') {
      console.log("[auth] Token expired");
    }
    return null;
  }
}

export async function verifyFirebaseToken(token?: string | null): Promise<DecodedIdToken | null> {
  if (!token) {
    console.log("[auth] No token provided to verifyFirebaseToken");
    return null;
  }
  if (!adminAuth) {
    console.error("[auth] Firebase Admin SDK not initialized (adminAuth is null)");
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);
    console.log(`[auth] Session cookie verified. UID: ${decoded.uid}, Email: ${decoded.email}, Project ID: ${decoded.aud}`);
    return hasValidAudience(decoded) ? decoded : null;
  } catch (sessionError: any) {
    console.warn("[auth] Session cookie verification failed, trying ID token fallback:", sessionError.message);
    return verifyFirebaseIdToken(token);
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const decoded = await verifyFirebaseToken(token);

  if (!decoded) {
    console.log("[auth] No decoded token found in cookie");
    return null;
  }
  console.log(`[auth] Decoded token for UID: ${decoded.uid}, Email: ${decoded.email}`);
  const normalizedEmail = decoded.email ? decoded.email.trim().toLowerCase() : undefined;
  return {
    uid: decoded.uid,
    email: normalizedEmail,
    emailVerified: Boolean(decoded.email_verified),
    name: decoded.name,
    picture: decoded.picture,
  };
}

export async function requireFirebaseUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    console.warn("[auth:security] Anonymous access denied to authenticated endpoint.");
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireSameFirebaseUser(userId: string): Promise<CurrentUser> {
  const user = await requireFirebaseUser();
  if (user.uid !== userId) {
    console.error(`[auth:security] Privilege escalation blocked. Firebase user ${user.uid} tried to act as ${userId}`);
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await requireFirebaseUser();

  // 1. Query DB user by Firebase UID first
  let dbUser = await prisma.user.findUnique({
    where: { id: user.uid },
    select: { id: true, isSuspended: true }
  });

  // 2. If not found by UID, check if user exists by email (mapping existing ExOwn user)
  // SECURITY: Only allow email-based resolution when email is verified by Firebase
  if (!dbUser && user.email && user.emailVerified !== false) {
    dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, isSuspended: true }
    });
    if (dbUser) {
      console.log(`[auth:security] Resolved existing DB user ${dbUser.id} by email ${user.email} for Firebase UID ${user.uid}`);
    }
  }

  // 3. If genuinely new user, create new user record with race condition safety
  if (!dbUser) {
    console.log(`[auth:security] Authenticated Firebase UID ${user.uid} not in DB yet. Auto-syncing user record.`);
    try {
      const isConfiguredAdmin = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map(e => e.trim().toLowerCase())
        .includes((user.email || "").toLowerCase());

      const created = await prisma.user.create({
        data: {
          id: user.uid,
          email: user.email || null,
          name: user.name || null,
          image: user.picture || null,
          role: isConfiguredAdmin ? "ADMIN" : "USER",
          verificationLevel: "BASIC",
          lastActive: new Date(),
        },
        select: { id: true, isSuspended: true }
      });
      dbUser = created;
    } catch (err: any) {
      // Handle race condition or unique constraint (e.g. concurrent creation or email collision P2002)
      if (err.code === "P2002" && user.email) {
        dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, isSuspended: true }
        });
      }
      if (!dbUser) {
        console.error("[auth:security] Failed to establish database user record for Firebase UID:", user.uid, err);
        throw new Error("Authentication failed: User record could not be established");
      }
    }
  }

  if (dbUser.isSuspended) {
    console.error(`[auth:security] Suspended user ${dbUser.id} blocked from accessing endpoint.`);
    throw new Error("Forbidden: Account is suspended");
  }

  // Return CurrentUser with the resolved database User.id (preserves original user.uid as firebaseUid)
  return {
    ...user,
    uid: dbUser.id,
    firebaseUid: user.uid,
  };
}

export async function requireAuth(): Promise<CurrentUser> {
  return requireUser();
}

export async function requireOwnership(ownerId: string, errorMsg = "Unauthorized ownership check"): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.uid !== ownerId && user.firebaseUid !== ownerId) {
    console.error(`[auth:security] Ownership validation failed. User ${user.uid} (Firebase: ${user.firebaseUid}) does not own resource owned by ${ownerId}.`);
    throw new Error(errorMsg);
  }
  return user;
}

export async function requireSameUser(userId: string): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.uid !== userId && user.firebaseUid !== userId) {
    console.error(`[auth:security] Privilege escalation blocked. User ${user.uid} (Firebase: ${user.firebaseUid}) tried to manipulate resources belonging to ${userId}`);
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getCurrentDbUser() {
  const user = await getCurrentUser();
  if (!user) return null;

  let dbUser = await prisma.user.findUnique({
    where: { id: user.uid },
    select: {
      id: true,
      email: true,
      role: true,
      isSuspended: true,
      isProfileCompleted: true,
      verificationLevel: true,
      isTrustedSeller: true,
      trustScore: true,
    },
  });

  // SECURITY: Only allow email-based resolution when email is verified by Firebase
  if (!dbUser && user.email && user.emailVerified !== false) {
    dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        email: true,
        role: true,
        isSuspended: true,
        isProfileCompleted: true,
        verificationLevel: true,
        isTrustedSeller: true,
        trustScore: true,
      },
    });
    if (dbUser) {
      console.log(`[auth] Resolved existing DB user ${dbUser.id} by email ${user.email} in getCurrentDbUser`);
    }
  }

  if (!dbUser) {
    console.log(`[auth] DB user for UID ${user.uid} not in DB yet. Auto-creating record.`);
    try {
      const isConfiguredAdmin = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .includes((user.email || "").toLowerCase());

      dbUser = await prisma.user.create({
        data: {
          id: user.uid,
          email: user.email || null,
          name: user.name || null,
          image: user.picture || null,
          role: isConfiguredAdmin ? "ADMIN" : "USER",
          verificationLevel: "BASIC",
          lastActive: new Date(),
        },
        select: {
          id: true,
          email: true,
          role: true,
          isSuspended: true,
          isProfileCompleted: true,
          verificationLevel: true,
          isTrustedSeller: true,
          trustScore: true,
        },
      });
    } catch (err: any) {
      if (err.code === "P2002" && user.email) {
        dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: {
            id: true,
            email: true,
            role: true,
            isSuspended: true,
            isProfileCompleted: true,
            verificationLevel: true,
            isTrustedSeller: true,
            trustScore: true,
          },
        });
      }
      if (!dbUser) {
        console.error("[auth:security] Failed to establish database user record in getCurrentDbUser:", err);
        return null;
      }
    }
  }

  console.log(`[auth] DB user for ${user.uid}: ${dbUser ? `Found (ID: ${dbUser.id}, Role: ${dbUser.role})` : "NOT FOUND"}`);
  return dbUser;
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.uid },
    select: { id: true, role: true, isSuspended: true },
  });

  if (!dbUser || dbUser.isSuspended || !roles.includes(dbUser.role)) {
    console.error(`[auth:security] Forbidden access attempt: User ${user.uid} (Role: ${dbUser?.role || 'None'}) tried to access action requiring roles: [${roles.join(", ")}]`);
    throw new Error("Forbidden");
  }

  return { ...user, role: dbUser.role };
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}
