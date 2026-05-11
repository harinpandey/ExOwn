import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createNotification } from "@/actions/notification";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("x-cron-secret");
    if (authHeader !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    
    // Find active products that have passed their expiry date
    // Note: We need to ensure 'expiresAt' exists in schema. If not yet added, this will need a migration.
    // For now, using a default logic of 30 days if expiresAt is null is also possible, 
    // but the brief says to use expiresAt.
    
    const expiredProducts = await prisma.product.findMany({
      where: {
        status: "LIVE",
        // Adding a fallback check in case expiresAt isn't in DB yet
        // OR(expiresAt < now, (createdAt + 30 days) < now if expiresAt is null)
        expiresAt: { lt: now }
      },
      include: {
        seller: true
      }
    });

    if (expiredProducts.length === 0) {
      return NextResponse.json({ message: "No expired listings found" });
    }

    const results = await Promise.all(expiredProducts.map(async (product) => {
      // 1. Update status to EXPIRED
      await prisma.product.update({
        where: { id: product.id },
        data: { status: "ARCHIVED" } // Status ARCHIVED or EXPIRED (mapping to ARCHIVED for now)
      });

      // 2. Notify seller
      await createNotification({
        userId: product.sellerId,
        type: "SYSTEM",
        title: "Listing Expired",
        content: `Your listing "${product.title}" has expired. Renew it to keep it visible.`,
        link: `/dashboard?tab=listings&id=${product.id}`
      });

      return product.id;
    }));

    return NextResponse.json({ 
      message: `Successfully expired ${results.length} listings`,
      expiredIds: results 
    });
  } catch (error) {
    console.error("[CRON-EXPIRE-LISTINGS-ERROR]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
