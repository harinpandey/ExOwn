import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { isLiveLocationEnabled, syncSessionExpiry } from "@/lib/live-location";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. Feature Flag Guard
  if (!isLiveLocationEnabled()) {
    return NextResponse.json({ error: "Live location is currently disabled" }, { status: 403 });
  }

  // 2. Rate Limiting
  const limited = await enforceRateLimit(req, {
    namespace: "live-location-status",
    limit: 60,
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

  // 4. Query Parameter Validation
  const sessionId = req.nextUrl.searchParams.get("sessionId")?.trim() || "";
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId query parameter is required" }, { status: 400 });
  }

  try {
    // 5. Session Lookup
    const rawSession = await prisma.liveLocationSession.findUnique({
      where: { id: sessionId },
    });

    if (!rawSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 6. Participant Authorization Check (Seller or Buyer only; prevents IDOR)
    const isSeller = rawSession.sellerId === user.uid || rawSession.sellerId === user.firebaseUid;
    const isBuyer = rawSession.buyerId === user.uid || rawSession.buyerId === user.firebaseUid;

    if (!isSeller && !isBuyer) {
      return NextResponse.json(
        { error: "Unauthorized: You are not an authorized participant in this session" },
        { status: 403 }
      );
    }

    // 7. Enforce Expiration Invariant & Synchronization
    const session = await syncSessionExpiry(rawSession);

    // 8. Return Safe Metadata (never return raw coordinates or pickupLocation)
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        productId: session.productId,
        conversationId: session.conversationId,
        status: session.status,
        startedAt: session.startedAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        stoppedAt: session.stoppedAt ? session.stoppedAt.toISOString() : null,
        role: isSeller ? "SELLER" : "BUYER",
      },
    });
  } catch (err: any) {
    console.error("[live-location:status] Internal error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
