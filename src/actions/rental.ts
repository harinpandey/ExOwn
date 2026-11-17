"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { createNotification } from "./notification";
import { logActivity } from "@/lib/logger";
import { requireSameUser } from "@/lib/auth";
import { sanitizeString, validateLength, validateRange } from "@/lib/validation";

export async function requestRental(data: {
  productId: string;
  renterId: string;
  startDate: Date;
  endDate: Date;
  securityDeposit: number;
  pickupLocation: string;
}) {
  try {
    const renter = await requireSameUser(data.renterId);
    const renterId = renter.uid;

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const pickupLocation = sanitizeString(data.pickupLocation);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new Error("Invalid rental dates");
    }

    if (endDate <= startDate) {
      throw new Error("End date must be after start date");
    }

    if (startDate < new Date(new Date().toDateString())) {
      throw new Error("Start date cannot be in the past");
    }

    if (!validateLength(pickupLocation, 2, 200)) {
      throw new Error("Pickup location must be between 2 and 200 characters");
    }

    // Fetch product to get owner info
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { rentalDetail: true },
    });

    if (!product || !product.rentalDetail) {
      throw new Error("Rental product not found");
    }

    if (product.status !== "LIVE" || product.listingType !== "RENT" || product.inventory < 1) {
      throw new Error("This rental is no longer available");
    }

    if (product.sellerId === renterId) {
      throw new Error("You cannot rent your own listing");
    }

    const securityDeposit = Number(product.rentalDetail.securityDeposit || 0);
    if (!validateRange(securityDeposit, 0, 1000000)) {
      throw new Error("Invalid security deposit configured for this rental");
    }

    // Atomic Date Collision Check & Creation inside Interactive Prisma Transaction
    const rental = await withRetry(() =>
      prisma.$transaction(
        async (tx) => {
          // Check for overlapping active or pending rentals
          // Collision formula: existing.startDate <= request.endDate AND existing.endDate >= request.startDate
          const conflictingRental = await tx.rental.findFirst({
            where: {
              productId: data.productId,
              status: { in: ["PENDING", "ACTIVE"] },
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          });

          if (conflictingRental) {
            throw new Error(
              "Rental conflict detected: This item is already reserved or rented for the requested date period."
            );
          }

          // Create the rental record atomically
          return await tx.rental.create({
            data: {
              productId: data.productId,
              renterId,
              ownerId: product.sellerId,
              rentalDetailId: product.rentalDetail!.id,
              startDate,
              endDate,
              securityDeposit,
              pickupLocation,
              status: "PENDING",
            },
          });
        },
        {
          isolationLevel: "Serializable",
        }
      )
    );

    // Notify Owner
    await createNotification({
      userId: product.sellerId,
      type: "RENTAL_REQUEST",
      title: "New Rental Request! 📦",
      content: `Someone wants to rent your "${product.title}". Check details now.`,
      link: "/profile?tab=rentals",
    });

    await logActivity({
      userId: renterId,
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
    const owner = await requireSameUser(ownerId);
    const canonicalOwnerId = owner.uid;

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { product: true },
    });

    if (!rental || rental.ownerId !== canonicalOwnerId) {
      throw new Error("Unauthorized or rental not found");
    }

    if (rental.status !== "PENDING") {
      throw new Error("Rental request is already resolved");
    }

    if (rental.product.status !== "LIVE" || rental.product.inventory < 1) {
      throw new Error("This listing is no longer available");
    }

    // 1. Update Status
    await withRetry(() =>
      prisma.$transaction(async (tx) => {
        const updated = await tx.rental.updateMany({
          where: { id: rentalId, ownerId: canonicalOwnerId, status: "PENDING" },
          data: { status: "ACTIVE" },
        });
        if (updated.count !== 1) {
          throw new Error("This rental request has already been reviewed.");
        }

        const rentalDays = Math.max(
          1,
          Math.ceil((rental.endDate.getTime() - rental.startDate.getTime()) / (1000 * 60 * 60 * 24))
        );
        await tx.transactionRecord.upsert({
          where: { rentalId },
          update: {
            buyerId: rental.renterId,
            sellerId: canonicalOwnerId,
            productId: rental.productId,
            type: "RENT",
            source: "RENTAL",
            amount: rental.product.price * rentalDays,
          },
          create: {
            buyerId: rental.renterId,
            sellerId: canonicalOwnerId,
            productId: rental.productId,
            rentalId,
            type: "RENT",
            source: "RENTAL",
            amount: rental.product.price * rentalDays,
          },
        });
      })
    );

    // 2. Notify Renter
    await createNotification({
      userId: rental.renterId,
      type: "RENTAL_APPROVED",
      title: "Rental Approved! 🎉",
      content: `Your request for "${rental.product.title}" has been approved. Coordinate pickup!`,
      link: "/profile?tab=rentals",
    });

    await logActivity({
      userId: canonicalOwnerId,
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
    const owner = await requireSameUser(ownerId);
    const canonicalOwnerId = owner.uid;

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      select: { ownerId: true, status: true },
    });

    if (!rental || rental.ownerId !== canonicalOwnerId) {
      throw new Error("Unauthorized or rental not found");
    }

    if (rental.status !== "ACTIVE") {
      throw new Error("Only active rentals can be marked returned");
    }

    const updated = await withRetry(() =>
      prisma.rental.updateMany({
        where: { id: rentalId, ownerId: canonicalOwnerId, status: "ACTIVE" },
        data: { status: "RETURNED" },
      })
    );
    if (updated.count !== 1) {
      throw new Error("This rental has already been updated.");
    }

    await logActivity({
      userId: canonicalOwnerId,
      actionType: "RENTAL_RETURNED",
      rentalId: rentalId,
    });

    return { success: true };
  } catch (error) {
    console.error("[markRentalReturned] Failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to mark this rental as returned.",
    };
  }
}

export async function cancelRentalRequest(rentalId: string, renterId: string) {
  try {
    const renter = await requireSameUser(renterId);
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      select: {
        id: true,
        renterId: true,
        ownerId: true,
        status: true,
        product: { select: { title: true } },
      },
    });

    if (!rental || rental.renterId !== renter.uid) {
      return { success: false, error: "Rental request not found." };
    }
    if (rental.status !== "PENDING") {
      return { success: false, error: "Only pending rental requests can be cancelled." };
    }

    const updated = await withRetry(() =>
      prisma.rental.updateMany({
        where: { id: rental.id, renterId: renter.uid, status: "PENDING" },
        data: { status: "CANCELLED" },
      })
    );
    if (updated.count !== 1) {
      return { success: false, error: "This rental request has already been updated." };
    }

    await createNotification({
      userId: rental.ownerId,
      type: "RENTAL_REQUEST",
      title: "Rental request withdrawn",
      content: "A student withdrew their rental request for " + rental.product.title + ".",
      link: "/profile?tab=rentals",
    });
    await logActivity({
      userId: renter.uid,
      actionType: "RENTAL_REQUEST_CANCELLED",
      rentalId: rental.id,
      targetUserId: rental.ownerId,
    });

    return { success: true };
  } catch (error) {
    console.error("[cancelRentalRequest] Failed:", error);
    return { success: false, error: "Unable to cancel this rental request." };
  }
}

export async function getUserRentals(userId: string) {
  try {
    const actor = await requireSameUser(userId);
    const canonicalUserId = actor.uid;

    const [owned, rented] = await Promise.all([
      prisma.rental.findMany({
        where: { ownerId: canonicalUserId },
        include: {
          product: {
            select: { id: true, title: true, price: true, images: true },
          },
          renter: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.rental.findMany({
        where: { renterId: canonicalUserId },
        include: {
          product: {
            select: { id: true, title: true, price: true, images: true },
          },
          owner: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { owned, rented };
  } catch (error) {
    console.error("[getUserRentals] Error:", error);
    return { owned: [], rented: [] };
  }
}
