import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifyFirebaseIdTokenResult } from "@/lib/auth";
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const idToken =
    body && typeof body === "object" && "idToken" in body && typeof body.idToken === "string"
      ? body.idToken
      : "";

  if (!idToken.trim()) {
    return NextResponse.json({ error: "A Firebase ID token is required." }, { status: 400 });
  }

  if (!adminAuth) {
    console.error("[api/auth/session] Firebase Admin SDK is unavailable. Check the FIREBASE_* server environment variables.");
    return NextResponse.json(
      { error: "Firebase Admin is not configured for this deployment. Check the server environment variables." },
      { status: 503 }
    );
  }

  const verification = await verifyFirebaseIdTokenResult(idToken);
  if (!verification.success) {
    if (verification.reason === "admin-unavailable") {
      return NextResponse.json(
        { error: "Firebase Admin is not configured for this deployment." },
        { status: 503 }
      );
    }
    if (verification.reason === "project-mismatch") {
      return NextResponse.json(
        { error: "Firebase client and Admin project IDs do not match. Check NEXT_PUBLIC_FIREBASE_PROJECT_ID and FIREBASE_PROJECT_ID." },
        { status: 503 }
      );
    }
    if (verification.reason === "missing-token") {
      return NextResponse.json({ error: "A Firebase ID token is required." }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Firebase rejected the ID token. Refresh the sign-in and try again.",
        code: verification.code || "auth/invalid-id-token",
      },
      { status: 401 }
    );
  }

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });

    const res = NextResponse.json({ success: true, uid: verification.decoded.uid });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return res;
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error && typeof error.code === "string"
        ? error.code
        : "unknown";
    const message = error instanceof Error ? error.message : String(error);
    console.error("[api/auth/session] Firebase session-cookie creation failed:", code, message);

    const authRejected = code.startsWith("auth/");
    return NextResponse.json(
      {
        error: authRejected
          ? "Firebase could not create the session. Sign in again and retry."
          : "The server could not create a secure session. Check Firebase Admin configuration.",
        code,
      },
      { status: authRejected ? 401 : 500 }
    );
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
