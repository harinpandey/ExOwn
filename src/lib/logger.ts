import prisma, { withRetry } from "./prisma";

export type ActivityAction = 
  | "LOGIN" | "LOGOUT" | "PROFILE_UPDATED"
  | "PRODUCT_CREATED" | "PRODUCT_EDITED" | "PRODUCT_ARCHIVED" | "PRODUCT_MARKED_SOLD"
  | "WISHLIST_ADDED" | "COMPARE_ADDED"
  | "RENTAL_REQUESTED" | "RENTAL_APPROVED" | "RENTAL_RETURNED"
  | "QUOTE_REQUESTED" | "QUOTE_ACCEPTED"
  | "SUBSCRIPTION_STARTED" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "REFUND_INITIATED"
  | "USER_SUSPENDED" | "LISTING_APPROVED" | "LISTING_REJECTED" | "REPORT_RESOLVED";

export async function logActivity(opts: {
  userId: string;
  actionType: ActivityAction;
  targetUserId?: string;
  productId?: string;
  rentalId?: string;
  paymentId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await withRetry(() => prisma.activityLog.create({
      data: {
        userId: opts.userId,
        actionType: opts.actionType,
        targetUserId: opts.targetUserId,
        productId: opts.productId,
        rentalId: opts.rentalId,
        paymentId: opts.paymentId,
        metadata: opts.metadata || {},
        ipAddress: opts.ipAddress,
        userAgent: opts.userAgent,
      }
    }));
  } catch (err) {
    console.error(`[ActivityLogger] Failed to log ${opts.actionType}:`, err);
  }
}
