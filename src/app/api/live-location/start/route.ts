import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { isLiveLocationEnabled, resolveFirebaseUid } from "@/lib/live-location";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const SESSION_DURATION_MINUTES = 15;

export async function POST(req: NextRequest) {
  // 1. Feature Flag Guard
  if (!isLiveLocationEnabled()) {
    return NextResponse.json({ error: "Live location is currently disabled" }, { status: 403 });
  }

  // 2. Rate Limiting
  const limited = await enforceRateLimit(req, {
    namespace: "live-location-start",
    limit: 10,
    windowSeconds: 60,
  });
  if (limited) return limited;

  // 3. Authentication
  let seller;
  try {
    seller = await requireUser();
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

  const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
  const buyerId = typeof body?.buyerId === "string" ? body.buyerId.trim() : "";
  const conversationId = typeof body?.conversationId === "string" ? body.conversationId.trim() : "";

  if (!productId || !buyerId || !conversationId) {
    return NextResponse.json(
      { error: "productId, buyerId, and conversationId are required" },
      { status: 400 }
    );
  }

  // 5. Seller and Buyer must not be the same user
  if (seller.uid === buyerId || (seller.firebaseUid && seller.firebaseUid === buyerId)) {
    return NextResponse.json({ error: "Cannot start a live location session with yourself" }, { status: 400 });
  }

  try {
    // 6. Product Existence and Ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true, status: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.sellerId !== seller.uid && product.sellerId !== seller.firebaseUid) {
      return NextResponse.json({ error: "Unauthorized: You are not the seller of this product" }, { status: 403 });
    }

    // 7. Buyer Existence and Active Status
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      select: { id: true, email: true, isSuspended: true },
    });

    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    if (buyer.isSuspended) {
      return NextResponse.json({ error: "Buyer account is suspended" }, { status: 403 });
    }

    // 8. Interaction / Relationship Validation
    // Buyer must have an active chat or transaction interaction with the seller / product
    const [messageCount, offerCount, orderItemCount, rentalCount, exchangeCount] = await Promise.all([
      prisma.message.count({
        where: {
          OR: [
            { senderId: seller.uid, receiverId: buyer.id },
            { senderId: buyer.id, receiverId: seller.uid },
          ],
        },
      }),
      prisma.offer.count({
        where: {
          productId: product.id,
          buyerId: buyer.id,
        },
      }),
      prisma.orderItem.count({
        where: {
          productId: product.id,
          order: { userId: buyer.id },
        },
      }),
      prisma.rental.count({
        where: {
          productId: product.id,
          renterId: buyer.id,
          ownerId: seller.uid,
        },
      }),
      prisma.exchangeOffer.count({
        where: {
          productId: product.id,
          buyerId: buyer.id,
        },
      }),
    ]);

    const hasRelationship = messageCount > 0 || offerCount > 0 || orderItemCount > 0 || rentalCount > 0 || exchangeCount > 0;
    if (!hasRelationship) {
      return NextResponse.json(
        { error: "Unauthorized: No conversation or transaction context between participants" },
        { status: 403 }
      );
    }

    // 9. Prevent Duplicate Simultaneous ACTIVE Sessions
    const now = new Date();
    const existingActive = await prisma.liveLocationSession.findFirst({
      where: {
        sellerId: seller.uid,
        buyerId: buyer.id,
        productId: product.id,
        conversationId,
        status: "ACTIVE",
        expiresAt: { gt: now },
      },
    });

    if (existingActive) {
      return NextResponse.json(
        {
          error: "An active live location session already exists for this conversation",
          session: {
            id: existingActive.id,
            productId: existingActive.productId,
            conversationId: existingActive.conversationId,
            status: existingActive.status,
            startedAt: existingActive.startedAt.toISOString(),
            expiresAt: existingActive.expiresAt.toISOString(),
          },
        },
        { status: 409 }
      );
    }

    // 10. Check Firestore Admin Database availability
    if (!adminDb) {
      console.error("[live-location:start] adminDb is not initialized");
      return NextResponse.json({ error: "Live location database service unavailable" }, { status: 503 });
    }

    // 11. Invariant: 15-minute expiration
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);

    // 12. Resolve Firebase Authentication UIDs for Security Rules compliance
    const sellerUid = await resolveFirebaseUid(seller);
    const buyerUid = await resolveFirebaseUid(buyer);

    // 13. Create PostgreSQL session record
    const session = await prisma.liveLocationSession.create({
      data: {
        sellerId: seller.uid,
        buyerId: buyer.id,
        productId: product.id,
        conversationId,
        startedAt,
        expiresAt,
        status: "ACTIVE",
      },
    });

    // 14. Create Firestore parent document with matching metadata
    try {
      await adminDb.collection("liveLocationSessions").doc(session.id).set({
        sellerUid,
        buyerUid,
        productId: product.id,
        conversationId,
        status: "ACTIVE",
        startedAt: admin.firestore.Timestamp.fromDate(startedAt),
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        stoppedAt: null,
      });
    } catch (fsError) {
      // In case of Firestore write failure, safely mark PostgreSQL session STOPPED
      await prisma.liveLocationSession.update({
        where: { id: session.id },
        data: { status: "STOPPED", stoppedAt: new Date() },
      });
      console.error("[live-location:start] Failed to create Firestore document:", fsError);
      return NextResponse.json({ error: "Failed to initialize live location session" }, { status: 500 });
    }

    // 15. Return safe metadata only
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        productId: session.productId,
        conversationId: session.conversationId,
        status: session.status,
        startedAt: session.startedAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[live-location:start] Internal error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
