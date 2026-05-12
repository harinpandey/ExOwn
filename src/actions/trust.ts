"use server";

import prisma, { withRetry } from "@/lib/prisma";

export async function calculateTrustScore(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: {
          select: {
            products: true,
            reportsRecv: { where: { status: "ACTION_TAKEN" } },
          }
        }
      }
    });

    if (!user) return 0;

    let score = 30; // Base score

    // 1. Verification Levels
    if (user.phone) score += 20;
    if (user.verificationLevel === "VERIFIED") score += 15;
    if (user.verificationLevel === "BUSINESS") score += 25;
    if (user.verificationLevel === "CAMPUS") score += 20;

    // 2. Profile Completion
    if (user.isProfileCompleted) score += 10;
    if (user.image) score += 5;

    // 3. Activity & Success
    const successfulDeals = user.profile?.successfulDeals || 0;
    score += Math.min(successfulDeals * 5, 30); // Max 30 from deals

    // 4. Account Age
    const monthsActive = Math.floor((Date.now() - user.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000));
    score += Math.min(monthsActive * 2, 10);

    // 5. Penalties (Reports)
    const validReports = user._count.reportsRecv;
    score -= (validReports * 15);

    // 6. Response Time (Bonus)
    if (user.profile?.avgResponseTime && user.profile.avgResponseTime < 60) {
      score += 10;
    }

    // Clamp score between 0 and 100
    const finalScore = Math.max(0, Math.min(100, score));

    // Update User Trusted Status
    const isTrusted = finalScore >= 80 || (monthsActive > 1 && successfulDeals >= 3);

    await withRetry(() => prisma.user.update({
      where: { id: userId },
      data: { 
        trustScore: finalScore,
        isTrustedSeller: isTrusted,
      }
    }));

    return finalScore;
  } catch (err) {
    console.error("Trust score calculation failed:", err);
    return 50;
  }
}
