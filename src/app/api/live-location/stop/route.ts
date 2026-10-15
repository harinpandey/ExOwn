import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { isLiveLocationEnabled } from "@/lib/live-location";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. Feature Flag Guard
  if (!isLiveLocationEnabled()) {
    return NextResponse.json({ error: "Live location is currently disabled" }, { status: 403 });
  }

  // 2. Rate Limiting
  const limited = await enforceRateLimit(req, {
    namespace: "live-location-stop",
    limit: 20,
    windowSeconds: 60,
  });
  if (limited) return limited;

  // 3. Authentication
  let user;
  try {
    user = await requireUser();
  } catch (err: any) {
    const status = err.message?.includes("Forbidden") ? 403 : 401;
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status });
  }

  // 4. Request Body Validation
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  try {
    // 5. Session Lookup
    const session = await prisma.liveLocationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 6. Seller Ownership Check (Prevent IDOR / Buyer or Third-Party Stopping)
    if (session.sellerId !== user.uid && session.sellerId !== user.firebaseUid) {
      return NextResponse.json({ error: "Unauthorized: Only the seller can stop this session" }, { status: 403 });
    }

    // 7. Idempotent Handling if already STOPPED or EXPIRED
    if (session.status === "STOPPED" || session.status === "EXPIRED") {
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          status: session.status,
          stoppedAt: session.stoppedAt ? session.stoppedAt.toISOString() : null,
        },
      });
    }

    // 8. Update PostgreSQL
    const stoppedAt = new Date();
    const updated = await prisma.liveLocationSession.update({
      where: { id: sessionId },
      data: {
        status: "STOPPED",
        stoppedAt,
      },
    });

    // 9. Synchronize Firestore Parent Document
    if (adminDb) {
      try {
        await adminDb.collection("liveLocationSessions").doc(sessionId).set(
          {
            status: "STOPPED",
            stoppedAt: admin.firestore.Timestamp.fromDate(stoppedAt),
          },
          { merge: true }
        );
      } catch (fsError) {
        console.error("[live-location:stop] Failed to update Firestore session document:", fsError);
      }
    }

    // 10. Return Safe Response
    return NextResponse.json({
      success: true,
      session: {
        id: updated.id,
        status: updated.status,
        stoppedAt: stoppedAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[live-location:stop] Internal error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
