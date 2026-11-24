import "server-only";

import lpuNewsPrisma from "@/lib/lpu-news-prisma";

export async function getPublishedLpuNews(limit = 8, category?: string, query?: string) {
  if (!process.env.LPU_NEWS_DATABASE_URL) {
    return { configured: false, unavailable: false, articles: [] as any[] };
  }

  try {
    const articles = await lpuNewsPrisma.lpuNewsArticle.findMany({
      where: {
        campusSlug: "lpu",
        isPublished: true,
        ...(category ? { category } : {}),
        ...(query?.trim()
          ? {
              OR: [
                { title: { contains: query.trim(), mode: "insensitive" as const } },
                { excerpt: { contains: query.trim(), mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: Math.min(Math.max(limit, 1), 30),
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        sourceName: true,
        imageUrl: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    return { configured: true, unavailable: false, articles };
  } catch (error) {
    console.error("[lpu-news] Failed to load published articles:", error);
    return { configured: true, articles: [] as any[], unavailable: true };
  }
}

export async function getPublishedLpuNewsArticle(slug: string) {
  if (!process.env.LPU_NEWS_DATABASE_URL) return null;

  try {
    return await lpuNewsPrisma.lpuNewsArticle.findFirst({
      where: { slug, campusSlug: "lpu", isPublished: true },
    });
  } catch (error) {
    console.error("[lpu-news] Failed to load article:", error);
    return null;
  }
}
