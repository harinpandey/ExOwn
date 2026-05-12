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
  if (!token || !adminAuth) return null;

  try {
    return await adminAuth.verifyIdToken(token, true);
  } catch (error) {
    console.warn("[auth] Invalid Firebase token", error);
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
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireSameUser(userId: string): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.uid !== userId) throw new Error("Unauthorized");
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
    throw new Error("Forbidden");
  }

  return { ...user, role: dbUser.role };
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}
