"use server";

import type { ReportReason } from "@prisma/client";
import prisma, { withRetry } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createNotification } from "./notification";
import { resolveCampusId } from "@/lib/campus";

export interface RoommateFilterParams {
  campus?: string;
  maxBudget?: number;
  gender?: string;
  roomType?: string;
}

const ROOMMATE_REPORT_REASONS = new Set<ReportReason>([
  "SPAM",
  "ABUSIVE_CONTENT",
  "WRONG_INFORMATION",
  "SCAM",
]);

/**
 * Public discovery only returns real, LIVE profiles explicitly made visible
 * to the campus community. A missing/unknown campus never becomes an
 * unscoped query and database errors never fall back to sample identities.
 */
export async function getRoommateProfiles(params: RoommateFilterParams = {}) {
  try {
    if (!process.env.DATABASE_URL) return [];

    const campusId = await resolveCampusId(params.campus);
    if (!campusId) return [];

    const where: any = {
      status: "LIVE",
      visibility: "CAMPUS",
      campusId,
    };
    const andFilters: any[] = [];

    if (params.gender && params.gender !== "ANY") {
      andFilters.push({
        OR: [
          { preferredGender: params.gender },
          { preferredGender: "NO_PREFERENCE" },
        ],
      });
    }

    if (params.roomType && params.roomType !== "ANY") {
      andFilters.push({
        OR: [
          { roomType: params.roomType },
          { roomType: "ANY" },
        ],
      });
    }

    if (typeof params.maxBudget === "number" && Number.isFinite(params.maxBudget)) {
      andFilters.push({
        OR: [
          { budgetMin: null },
          { budgetMin: { lte: Math.max(0, params.maxBudget) } },
        ],
      });
    }

    if (andFilters.length) where.AND = andFilters;

    const profiles = await withRetry(() =>
      prisma.roommateProfile.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          campus: { select: { name: true, slug: true } },
          user: { select: { id: true, name: true, image: true, trustScore: true, isVerified: true } },
        },
      })
    );

    return profiles.map((profile) => ({
      ...profile,
      matchReasons: ["Same Campus", "Campus-visible profile"],
    }));
  } catch (error) {
    console.error("[Action:getRoommateProfiles] Failed to fetch campus profiles:", error);
    return [];
  }
}

/**
 * Persist a genuine interest against a RoommateProfile ID, never a client
 * supplied sender/receiver user ID. The unique DB constraint prevents repeats.
 */
export async function sendRoommateInterest(receiverProfileId: string, message?: string) {
  try {
    const sender = await requireUser();

    const receiverProfile = await prisma.roommateProfile.findUnique({
      where: { id: receiverProfileId },
      select: {
        id: true,
        userId: true,
        status: true,
        visibility: true,
        campus: { select: { name: true } },
        user: { select: { name: true } },
      },
    });

    if (
      !receiverProfile ||
      receiverProfile.status !== "LIVE" ||
      receiverProfile.visibility !== "CAMPUS"
    ) {
      return { success: false, error: "This roommate profile is no longer available." };
    }

    if (receiverProfile.userId === sender.uid) {
      return { success: false, error: "You cannot send a request to your own profile." };
    }

    const existing = await prisma.roommateInterest.findUnique({
      where: {
        senderId_receiverProfileId: {
          senderId: sender.uid,
          receiverProfileId: receiverProfile.id,
        },
      },
      select: { id: true, status: true },
    });

    if (existing) {
      return { success: false, error: "You've already sent a request to this profile." };
    }

    const cleanMessage = message?.trim().slice(0, 500);
    await prisma.roommateInterest.create({
      data: {
        senderId: sender.uid,
        receiverProfileId: receiverProfile.id,
        ...(cleanMessage ? { message: cleanMessage } : {}),
      },
    });

    const notification = await createNotification({
      userId: receiverProfile.userId,
      type: "ROOMMATE_MATCH",
      title: "Roommate interest received",
      content: "A campus member is interested in connecting with you. Open Roommates to review the request.",
      link: "/roommates",
    });

    return { success: true, notificationSent: Boolean(notification) };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, error: "You've already sent a request to this profile." };
    }
    console.error("[Action:sendRoommateInterest] Failed to persist interest:", error);
    return { success: false, error: error?.message || "Unable to send roommate request." };
  }
}

/**
 * Return incoming requests only for the authenticated user's own roommate
 * profile. Sender details are never exposed to unrelated campus visitors.
 */
export async function getReceivedRoommateInterests() {
  try {
    const viewer = await requireUser();
    const ownProfile = await prisma.roommateProfile.findUnique({
      where: { userId: viewer.uid },
      select: { id: true },
    });

    if (!ownProfile) return [];

    return await withRetry(() =>
      prisma.roommateInterest.findMany({
        where: { receiverProfileId: ownProfile.id },
        orderBy: { createdAt: "desc" },
        take: 25,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
              isVerified: true,
              profile: { select: { collegeName: true, course: true, year: true } },
            },
          },
        },
      })
    );
  } catch (error) {
    console.error("[Action:getReceivedRoommateInterests] Failed to fetch requests:", error);
    return [];
  }
}

/**
 * Only the owner of the receiving profile can accept or decline an interest.
 * The sender is notified after the status change is committed.
 */
export async function updateRoommateInterestStatus(
  interestId: string,
  status: "ACCEPTED" | "DECLINED"
) {
  try {
    const viewer = await requireUser();
    const interest = await prisma.roommateInterest.findUnique({
      where: { id: interestId },
      select: {
        id: true,
        status: true,
        senderId: true,
        receiverProfile: { select: { userId: true } },
      },
    });

    if (!interest || interest.receiverProfile.userId !== viewer.uid) {
      return { success: false, error: "Roommate request not found." };
    }
    if (interest.status !== "PENDING") {
      return { success: false, error: "This request has already been reviewed." };
    }

    const updated = await withRetry(() =>
      prisma.roommateInterest.updateMany({
        where: { id: interest.id, status: "PENDING" },
        data: { status },
      })
    );
    if (updated.count !== 1) {
      return { success: false, error: "This request has already been reviewed." };
    }

    const accepted = status === "ACCEPTED";
    await createNotification({
      userId: interest.senderId,
      type: "ROOMMATE_MATCH",
      title: accepted ? "Roommate interest accepted" : "Roommate interest declined",
      content: accepted
        ? "Your roommate request was accepted. You can now start a conversation."
        : "Your roommate request was reviewed. Keep exploring other campus profiles.",
      link: accepted ? `/chat/${viewer.uid}` : "/roommates",
    });

    return { success: true };
  } catch (error: any) {
    console.error("[Action:updateRoommateInterestStatus] Failed to update request:", error);
    return { success: false, error: error?.message || "Unable to update roommate request." };
  }
}

/**
 * Reports are stored in the existing moderation Report table and linked to
 * the reported member. The profile ID is retained in the description for
 * moderator context without introducing a schema migration.
 */
export async function reportRoommateProfile(input: {
  profileId: string;
  reason: string;
  description?: string;
}) {
  try {
    const reporter = await requireUser();
    const profile = await prisma.roommateProfile.findUnique({
      where: { id: input.profileId },
      select: { id: true, userId: true, status: true, visibility: true },
    });

    if (!profile || profile.status !== "LIVE" || profile.visibility !== "CAMPUS") {
      return { success: false, error: "This roommate profile is no longer available." };
    }

    if (profile.userId === reporter.uid) {
      return { success: false, error: "You cannot report your own profile." };
    }

    const reason = input.reason as ReportReason;
    if (!ROOMMATE_REPORT_REASONS.has(reason)) {
      return { success: false, error: "Choose a valid report reason." };
    }

    const description = [
      `Roommate profile ID: ${profile.id}`,
      input.description?.trim().slice(0, 1000),
    ].filter(Boolean).join("\n");

    await prisma.report.create({
      data: {
        reason,
        description,
        reporterId: reporter.uid,
        reportedId: profile.userId,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[Action:reportRoommateProfile] Failed to submit report:", error);
    return { success: false, error: error?.message || "Unable to submit report." };
  }
}
