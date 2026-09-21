"use server";

import prisma from "@/lib/prisma";
import { requireSameUser, requireAdmin } from "@/lib/auth";
import { sanitizeString, validateLength } from "@/lib/validation";

export async function createReport(data: {
  reporterId: string;
  productId?: string;
  reportedId?: string;
  reason: "FAKE_LISTING" | "SPAM" | "ABUSIVE_CONTENT" | "WRONG_INFORMATION" | "SCAM";
  description?: string;
}) {
  try {
    await requireSameUser(data.reporterId);

    const cleanDescription = data.description ? sanitizeString(data.description) : undefined;
    if (!data.productId && !data.reportedId) {
      return { success: false, error: "Choose a listing or user to report." };
    }
    if (data.reportedId === data.reporterId) {
      return { success: false, error: "You cannot report your own profile." };
    }
    if (cleanDescription && !validateLength(cleanDescription, 0, 1000)) {
      return { success: false, error: "Report description must be under 1000 characters." };
    }

    if (data.productId) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { id: true, sellerId: true },
      });
      if (!product) return { success: false, error: "Listing not found." };
      if (product.sellerId === data.reporterId) {
        return { success: false, error: "You cannot report your own listing." };
      }
    }

    if (data.reportedId) {
      const reportedUser = await prisma.user.findUnique({
        where: { id: data.reportedId },
        select: { id: true },
      });
      if (!reportedUser) return { success: false, error: "Reported user not found." };
    }

    const duplicate = await prisma.report.findFirst({
      where: {
        reporterId: data.reporterId,
        productId: data.productId,
        reportedId: data.reportedId,
        status: "PENDING",
      },
      select: { id: true },
    });

    if (duplicate) {
      return { success: false, error: "You already submitted a pending report for this." };
    }

    const report = await prisma.report.create({
      data: {
        reporterId: data.reporterId,
        productId: data.productId,
        reportedId: data.reportedId,
        reason: data.reason,
        description: cleanDescription,
      }
    });

    // Create a system notification for admins if needed
    // For now, just return success
    return { success: true, reportId: report.id };
  } catch (error) {
    console.error("Error creating report:", error);
    return { success: false, error: "Failed to submit report. Please try again." };
  }
}

export async function getReports() {
  try {
    await requireAdmin();

    return await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { name: true, email: true } },
        product: { select: { title: true } },
        reported: { select: { name: true } }
      }
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}
