"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { createNotification } from "./notification";
import { logActivity } from "@/lib/logger";
import { requireSameUser } from "@/lib/auth";

export async function requestRental(data: {
  productId: string;
  renterId: string;
  startDate: Date;
  endDate: Date;
  securityDeposit: number;
  pickupLocation: string;
}) {
  try {
    await requireSameUser(data.renterId);

    if (data.endDate <= data.startDate) {
      throw new Error("End date must be after start date");
    }

    // 1. Fetch product to get owner info
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { rentalDetail: true }
    });

    if (!product || !product.rentalDetail) {
      throw new Error("Rental product not found");
    }

    if (product.sellerId === data.renterId) {
      throw new Error("You cannot rent your own listing");
    }

    const conflictingRental = await prisma.rental.findFirst({
      where: {
        productId: data.productId,
        status: { in: ["PENDING", "ACTIVE"] },
        startDate: { lte: data.endDate },
        endDate: { gte: data.startDate },
      },
    });

    if (conflictingRental) {
      throw new Error("This item is not available for the selected dates");
    }

    // 2. Create Rental Record
    const rental = await withRetry(() => prisma.rental.create({
      data: {
        productId: data.productId,
        renterId: data.renterId,
        ownerId: product.sellerId,
        rentalDetailId: product.rentalDetail!.id,
        startDate: data.startDate,
        endDate: data.endDate,
        securityDeposit: data.securityDeposit,
        pickupLocation: data.pickupLocation,
        status: "PENDING",
      }
    }));

    // 3. Notify Owner
    await createNotification({
      userId: product.sellerId,
      type: "RENTAL_REQUEST",
      title: "New Rental Request! 📦",
      content: `Someone wants to rent your "${product.title}". Check details now.`,
      link: `/dashboard/rentals/${rental.id}`,
    });

    await logActivity({
      userId: data.renterId,
      actionType: "RENTAL_REQUESTED",
      productId: data.productId,
      rentalId: rental.id,
      targetUserId: product.sellerId,
    });

    return { success: true, rentalId: rental.id };
  } catch (err: any) {
    console.error("Rental request failed:", err);
    return { success: false, error: err.message };
  }
}

export async function approveRental(rentalId: string, ownerId: string) {
  try {
    await requireSameUser(ownerId);

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { product: true }
    });

    if (!rental || rental.ownerId !== ownerId) {
      throw new Error("Unauthorized or rental not found");
    }

    // 1. Update Status
    await withRetry(() => prisma.rental.update({
      where: { id: rentalId },
      data: { status: "ACTIVE" }
    }));

    // 2. Notify Renter
    await createNotification({
      userId: rental.renterId,
      type: "RENTAL_APPROVED",
      title: "Rental Approved! 🎉",
      content: `Your request for "${rental.product.title}" has been approved. Coordinate pickup!`,
      link: `/dashboard/rentals/${rental.id}`,
    });

    await logActivity({
      userId: ownerId,
      actionType: "RENTAL_APPROVED",
      rentalId: rentalId,
      targetUserId: rental.renterId,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markRentalReturned(rentalId: string, ownerId: string) {
  try {
    await requireSameUser(ownerId);

    await withRetry(() => prisma.rental.update({
      where: { id: rentalId, ownerId },
      data: { status: "RETURNED" }
    }));

    await logActivity({
      userId: ownerId,
      actionType: "RENTAL_RETURNED",
      rentalId: rentalId
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}
