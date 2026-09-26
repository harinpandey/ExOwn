"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminCustomMoment, MomentAnalyticsEvent, MomentCategory, MomentPriority } from "@/lib/moments/types";

// In-memory persistent cache for server runtime
declare global {
  var __exownAdminMoments: AdminCustomMoment[] | undefined;
  var __exownMomentAnalytics: {
    impressions: number;
    clicks: number;
    dismisses: number;
    categoryStats: Record<string, { impressions: number; clicks: number; dismisses: number }>;
  } | undefined;
}

const DEFAULT_ADMIN_MOMENTS: AdminCustomMoment[] = [
  {
    id: "admin_moment_welcome_lpu",
    title: "Semester Kickoff on ExOwn! 🚀",
    message: "Senior notes, lab coats, and cycles are circulating fast on campus. Don't pay retail.",
    category: "CAMPUS_ACTIVITY",
    cta: "Explore Campus Deals",
    ctaHref: "/search",
    icon: "Sparkles",
    priority: "normal",
    targetAudience: "ALL",
    targetCampus: "Lovely Professional University",
    isActive: true,
    createdAt: new Date().toISOString(),
    impressions: 42,
    clicks: 14,
    dismisses: 8,
  },
  {
    id: "admin_moment_safety_handoff",
    title: "Safe Campus Handoffs Only 🛡️",
    message: "ExOwn recommends public meetups at the Central Library or Student Center for all item inspections.",
    category: "SAFETY_SECURITY",
    cta: "Review Guidelines",
    ctaHref: "/safety",
    icon: "ShieldCheck",
    priority: "normal",
    targetAudience: "ALL",
    isActive: true,
    createdAt: new Date().toISOString(),
    impressions: 68,
    clicks: 19,
    dismisses: 12,
  },
];

function getMomentsStore(): AdminCustomMoment[] {
  if (!globalThis.__exownAdminMoments) {
    globalThis.__exownAdminMoments = [...DEFAULT_ADMIN_MOMENTS];
  }
  return globalThis.__exownAdminMoments;
}

function getAnalyticsStore() {
  if (!globalThis.__exownMomentAnalytics) {
    globalThis.__exownMomentAnalytics = {
      impressions: 110,
      clicks: 33,
      dismisses: 20,
      categoryStats: {
        CAMPUS_ACTIVITY: { impressions: 42, clicks: 14, dismisses: 8 },
        SAFETY_SECURITY: { impressions: 68, clicks: 19, dismisses: 12 },
      },
    };
  }
  return globalThis.__exownMomentAnalytics;
}

/**
 * Log analytics event for a Moment impression, click, or dismissal.
 */
export async function recordMomentAnalytics(event: MomentAnalyticsEvent) {
  try {
    const store = getAnalyticsStore();
    if (event.event === "impression") store.impressions += 1;
    if (event.event === "click") store.clicks += 1;
    if (event.event === "dismiss") store.dismisses += 1;

    const catKey = event.category || "GENERAL";
    if (!store.categoryStats[catKey]) {
      store.categoryStats[catKey] = { impressions: 0, clicks: 0, dismisses: 0 };
    }
    if (event.event === "impression") store.categoryStats[catKey].impressions += 1;
    if (event.event === "click") store.categoryStats[catKey].clicks += 1;
    if (event.event === "dismiss") store.categoryStats[catKey].dismisses += 1;

    // Also update custom moment metrics if this was a custom admin moment
    const customMoments = getMomentsStore();
    const custom = customMoments.find((m) => m.id === event.templateId);
    if (custom) {
      if (event.event === "impression") custom.impressions += 1;
      if (event.event === "click") custom.clicks += 1;
      if (event.event === "dismiss") custom.dismisses += 1;
    }

    // Optionally log to ActivityLog if userId present
    if (event.userId && !event.userId.startsWith("guest")) {
      await withRetry(() =>
        prisma.activityLog.create({
          data: {
            userId: event.userId!,
            actionType: "MOMENT_INTERACTION" as any,
            metadata: {
              momentEvent: event.event,
              templateId: event.templateId,
              category: event.category,
            },
          },
        })
      ).catch(() => {});
    }

    return { success: true };
  } catch (err: any) {
    console.error("[recordMomentAnalytics] Failed to record:", err.message);
    return { success: false };
  }
}

/**
 * Fetch all admin moments (public and active).
 */
export async function getActiveAdminMoments(): Promise<AdminCustomMoment[]> {
  try {
    const moments = getMomentsStore();
    return moments.filter((m) => m.isActive);
  } catch {
    return [];
  }
}

/**
 * Fetch all admin moments for Admin Panel.
 */
export async function getAdminMoments(): Promise<AdminCustomMoment[]> {
  await requireAdmin();
  return getMomentsStore();
}

/**
 * Create a new custom Moment from Admin Panel.
 */
export async function createAdminMoment(data: {
  title: string;
  message: string;
  category: MomentCategory;
  cta: string;
  ctaHref: string;
  icon?: string;
  image?: string;
  priority?: MomentPriority;
  targetAudience?: "ALL" | "BUYERS" | "SELLERS" | "HOUSING" | "CAMPUS";
  targetCampus?: string;
  expiresAt?: string;
}) {
  await requireAdmin();

  const newMoment: AdminCustomMoment = {
    id: `admin_moment_${Date.now()}`,
    title: data.title.trim(),
    message: data.message.trim(),
    category: data.category,
    cta: data.cta.trim(),
    ctaHref: data.ctaHref.trim() || "/search",
    icon: data.icon || "Sparkles",
    image: data.image || undefined,
    priority: data.priority || "normal",
    targetAudience: data.targetAudience || "ALL",
    targetCampus: data.targetCampus || undefined,
    isActive: true,
    expiresAt: data.expiresAt,
    createdAt: new Date().toISOString(),
    impressions: 0,
    clicks: 0,
    dismisses: 0,
  };

  const store = getMomentsStore();
  store.unshift(newMoment);

  return { success: true, moment: newMoment };
}

/**
 * Toggle active state of a custom Moment.
 */
export async function toggleAdminMoment(id: string, active: boolean) {
  await requireAdmin();
  const store = getMomentsStore();
  const target = store.find((m) => m.id === id);
  if (!target) throw new Error("Moment not found");

  target.isActive = active;
  return { success: true, isActive: target.isActive };
}

/**
 * Delete a custom Moment.
 */
export async function deleteAdminMoment(id: string) {
  await requireAdmin();
  const store = getMomentsStore();
  const idx = store.findIndex((m) => m.id === id);
  if (idx !== -1) {
    store.splice(idx, 1);
  }
  return { success: true };
}

/**
 * Get aggregate analytics metrics.
 */
export async function getMomentsAnalyticsSummary() {
  await requireAdmin();
  const store = getAnalyticsStore();
  const totalEngagements = store.clicks + store.dismisses;
  const ctr = store.impressions > 0 ? (store.clicks / store.impressions) * 100 : 0;
  const dismissRate = store.impressions > 0 ? (store.dismisses / store.impressions) * 100 : 0;

  return {
    totalImpressions: store.impressions,
    totalClicks: store.clicks,
    totalDismisses: store.dismisses,
    totalEngagements,
    ctr: Number(ctr.toFixed(1)),
    dismissRate: Number(dismissRate.toFixed(1)),
    categoryBreakdown: store.categoryStats,
  };
}
