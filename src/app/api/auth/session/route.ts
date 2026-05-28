import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifyFirebaseIdToken } from "@/lib/auth";
import { adminAuth } from "@/lib/firebase-admin";
import { enforceRateLimit } from "@/lib/rate-limit";

const SESSION_MAX_AGE_SECONDS = 5 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, {
    namespace: "auth",
    limit: 10,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const { idToken } = await req.json();
    console.log("[api/auth/session] Received POST request with idToken length:", idToken?.length);

    if (!adminAuth) {
      console.error("[api/auth/session] Firebase Admin SDK is unavailable");
      return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
    }
    
    const decoded = await verifyFirebaseIdToken(idToken);

    if (!decoded) {
      console.error("[api/auth/session] Token verification failed, returning 401");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log("[api/auth/session] Token verified successfully for UID:", decoded.uid);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });

    const res = NextResponse.json({ success: true, uid: decoded.uid });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return res;
  } catch (error) {
    console.error("[auth/session] Failed to create session", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
