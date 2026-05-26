"use server";

import prisma from "@/lib/prisma";
import { requireSameUser, requireAdmin } from "@/lib/auth";
import { sanitizeString } from "@/lib/validation";

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
