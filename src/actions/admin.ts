"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth";

export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

export async function getAdminStats() {
  try {
    await requireAdmin();

    const [userCount, liveListingCount, pendingListingCount, pendingReportCount, revenue] =
      await Promise.all([
        prisma.user.count(),
        prisma.product.count({ where: { status: "LIVE" } }),
        prisma.product.count({ where: { status: "PENDING" } }),
        prisma.report.count({ where: { status: "PENDING" } }),
        prisma.payment.aggregate({
          where: { paymentStatus: "SUCCESS" },
          _sum: { amount: true },
        }),
      ]);

    return {
      userCount,
      liveListingCount,
      pendingListingCount,
      pendingReportCount,
      revenue: revenue._sum.amount || 0,
    };
  } catch (err) {
    console.error("Admin stats fetch failed:", err);
    return null;
  }
}

export async function getAdminUsers(query = "") {
  try {
    await requireAdmin();

    const normalizedQuery = query.trim().slice(0, 120);
    const where = normalizedQuery
      ? {
          OR: [
            { name: { contains: normalizedQuery, mode: "insensitive" as const } },
            { email: { contains: normalizedQuery, mode: "insensitive" as const } },
            { phone: { contains: normalizedQuery, mode: "insensitive" as const } },
            { registrationNumber: { contains: normalizedQuery, mode: "insensitive" as const } },
          ],
        }
      : {};

    return await withRetry(() =>
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          role: true,
          isVerified: true,
          isProfileCompleted: true,
          registrationNumber: true,
          verificationLevel: true,
          trustScore: true,
          fraudScore: true,
          isSuspended: true,
          isTrustedSeller: true,
          createdAt: true,
          lastActive: true,
          profile: {
            select: {
              collegeName: true,
              course: true,
              year: true,
              batch: true,
            },
          },
          _count: {
            select: {
              products: true,
              messagesSent: true,
              payments: true,
              orders: true,
              reportsMade: true,
              reportsRecv: true,
              housingListings: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    );
  } catch (err) {
    console.error("Admin users fetch failed:", err);
    return [];
  }
}

export async function getAdminUserDetails(userId: string) {
  try {
    await requireAdmin();
    if (!userId || userId.length > 128) return null;

    return await withRetry(() =>
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          registrationNumber: true,
          studentPhoto: true,
          collegeIdUrl: true,
          role: true,
          isVerified: true,
          isProfileCompleted: true,
          verificationLevel: true,
          trustScore: true,
          fraudScore: true,
          isSuspended: true,
          banReason: true,
          isTrustedSeller: true,
          address: true,
          createdAt: true,
          updatedAt: true,
          lastActive: true,
          profile: {
            select: {
              collegeName: true,
              course: true,
              year: true,
              batch: true,
              hostel: true,
              bio: true,
              businessType: true,
              rating: true,
              successfulDeals: true,
              avgResponseTime: true,
              successRate: true,
            },
          },
          products: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              listingType: true,
              createdAt: true,
              category: { select: { name: true } },
              campus: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              paymentStatus: true,
              transactionId: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 8,
          },
          reportsMade: {
            select: {
              id: true,
              reason: true,
              status: true,
              createdAt: true,
              product: { select: { title: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 8,
          },
          reportsRecv: {
            select: {
              id: true,
              reason: true,
              status: true,
              createdAt: true,
              product: { select: { title: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 8,
          },
          _count: {
            select: {
              products: true,
              messagesSent: true,
              payments: true,
              orders: true,
              reportsMade: true,
              reportsRecv: true,
              housingListings: true,
              rentals: true,
              rentalsOwned: true,
            },
          },
        },
      })
    );
  } catch (err) {
    console.error("Admin user detail fetch failed:", err);
    return null;
  }
}

export async function updateUserStatus(userId: string, isSuspended: boolean, banReason?: string) {
  try {
    const admin = await requireAdmin();
    if (!userId || userId === admin.uid) {
      return { success: false, error: "You cannot change your own admin account status." };
    }

    await withRetry(() =>
      prisma.user.update({
        where: { id: userId },
        data: {
          isSuspended,
          banReason: isSuspended ? (banReason?.trim() || "Suspended by an administrator.") : null,
        },
      })
    );

    await logActivity({
      userId: admin.uid,
      actionType: "USER_SUSPENDED",
      targetUserId: userId,
      metadata: { isSuspended, reason: isSuspended ? banReason : null },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/\${userId}`);
    return { success: true };
  } catch (err) {
    console.error("Admin user status update failed:", err);
    return { success: false, error: "Unable to update this account." };
  }
}

export async function getAdminListings(status?: any) {
  try {
    await requireAdmin();

    return await withRetry(() =>
      prisma.product.findMany({
        where: status ? { status } : {},
        include: {
          seller: { select: { name: true, email: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    );
  } catch {
    return [];
  }
}

export async function updateProductStatus(productId: string, status: any, reason?: string) {
  try {
    const admin = await requireAdmin();

    await withRetry(() =>
      prisma.product.update({
        where: { id: productId },
        data: {
          status,
          moderationReason: reason,
          isSuspicious: status === "REJECTED",
        },
      })
    );
    await logActivity({
      userId: admin.uid,
      actionType: status === "LIVE" ? "LISTING_APPROVED" : "LISTING_REJECTED",
      productId,
      metadata: { status, reason },
    });

    revalidatePath("/admin/listings");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getAdminReports() {
  try {
    await requireAdmin();

    return await withRetry(() =>
      prisma.report.findMany({
        include: {
          reporter: { select: { name: true } },
          reported: { select: { name: true } },
          product: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    );
  } catch {
    return [];
  }
}

export async function resolveReport(reportId: string, status: any) {
  try {
    const admin = await requireAdmin();

    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status },
      include: { reported: true, product: true },
    });

    if (status === "ACTION_TAKEN") {
      if (report.reportedId) {
        await calculateUserFraudScore(report.reportedId);
      }
      if (report.productId) {
        await calculateListingFraudScore(report.productId);
      }
    }

    await logActivity({
      userId: admin.uid,
      actionType: "REPORT_RESOLVED",
      metadata: { reportId, status },
    });

    revalidatePath("/admin/reports");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function calculateUserFraudScore(userId: string) {
  const reports = await prisma.report.count({
    where: { reportedId: userId, status: "ACTION_TAKEN" },
  });

  const suspiciousListings = await prisma.product.count({
    where: { sellerId: userId, isSuspicious: true },
  });

  const fraudScore = reports * 20 + suspiciousListings * 30;

  await prisma.user.update({
    where: { id: userId },
    data: {
      fraudScore,
      isSuspended: fraudScore >= 100,
    },
  });
}

export async function calculateListingFraudScore(productId: string) {
  const reports = await prisma.report.count({
    where: { productId, status: "ACTION_TAKEN" },
  });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  let priceFlag = 0;
  if (product.originalPrice && product.price < product.originalPrice * 0.1) {
    priceFlag = 50;
  }

  const fraudScore = reports * 25 + priceFlag;

  await prisma.product.update({
    where: { id: productId },
    data: {
      fraudScore,
      isSuspicious: fraudScore >= 50,
    },
  });
}

// AI Rules Management
export async function getAiRules() {
  try {
    await requireAdmin();

    return await prisma.aiRule.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function createAiRule(data: { name: string; rule: any }) {
  try {
    const admin = await requireAdmin();

    const rule = await prisma.aiRule.create({ data });
    await logActivity({
      userId: admin.uid,
      actionType: "AI_RULE_CREATED",
      metadata: { ruleId: rule.id, name: rule.name },
    });
    revalidatePath("/admin/ai-rules");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function toggleAiRule(ruleId: string, isActive: boolean) {
  try {
    const admin = await requireAdmin();

    await prisma.aiRule.update({
      where: { id: ruleId },
      data: { isActive },
    });
    await logActivity({
      userId: admin.uid,
      actionType: "AI_RULE_TOGGLED",
      metadata: { ruleId, isActive },
    });
    revalidatePath("/admin/ai-rules");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deleteAiRule(ruleId: string) {
  try {
    const admin = await requireAdmin();

    await prisma.aiRule.delete({ where: { id: ruleId } });
    await logActivity({
      userId: admin.uid,
      actionType: "AI_RULE_DELETED",
      metadata: { ruleId },
    });
    revalidatePath("/admin/ai-rules");
    return { success: true };
  } catch {
    return { success: false };
  }
}
