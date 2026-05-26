import "server-only";

import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { Role } from "@prisma/client";
import { adminAuth } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "__exown_session";

export type CurrentUser = {
  uid: string;
  email?: string;
};

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
    const decoded = await adminAuth.verifyIdToken(token, true);
    console.log(`[auth] Token verified. UID: ${decoded.uid}, Email: ${decoded.email}, Project ID: ${decoded.aud}`);
    
    const adminProjectId = process.env.FIREBASE_PROJECT_ID;
    if (adminProjectId && decoded.aud !== adminProjectId) {
      console.error(`[auth:security] Token audience mismatch! Token: ${decoded.aud}, Expected: ${adminProjectId}. Potential spoofing/forgery attempt.`);
      return null;
    }
    
    return decoded;
  } catch (error: any) {
    console.error("[auth:security] Firebase token verification failed:", error.message);
    if (error.code === 'auth/id-token-expired') {
      console.log("[auth] Token expired");
    }
    return null;
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
  return {
    uid: decoded.uid,
    email: decoded.email,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    console.warn("[auth:security] Anonymous access denied to protected endpoint.");
    throw new Error("Unauthorized");
  }

  // Hardening: Query DB user status to enforce active, non-suspended account status
  const dbUser = await prisma.user.findUnique({
    where: { id: user.uid },
    select: { isSuspended: true }
  });

  if (!dbUser) {
    console.warn(`[auth:security] Authenticated token holds UID ${user.uid} which is not found in database.`);
    throw new Error("Unauthorized");
  }

  if (dbUser.isSuspended) {
    console.error(`[auth:security] Suspended user ${user.uid} blocked from accessing endpoint.`);
    throw new Error("Forbidden: Account is suspended");
  }

  return user;
}

export async function requireAuth(): Promise<CurrentUser> {
  return requireUser();
}

export async function requireOwnership(ownerId: string, errorMsg = "Unauthorized ownership check"): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.uid !== ownerId) {
    console.error(`[auth:security] Ownership validation failed. User ${user.uid} does not own resource owned by ${ownerId}.`);
    throw new Error(errorMsg);
  }
  return user;
}

export async function requireSameUser(userId: string): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.uid !== userId) {
    console.error(`[auth:security] Privilege escalation blocked. User ${user.uid} tried to manipulate resources belonging to ${userId}`);
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getCurrentDbUser() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
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

  console.log(`[auth] DB user for ${user.uid}: ${dbUser ? `Found (Role: ${dbUser.role})` : "NOT FOUND"}`);
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
