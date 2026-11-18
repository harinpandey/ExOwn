"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import lpuNewsPrisma from "@/lib/lpu-news-prisma";

const ALLOWED_CATEGORIES = [
  "CAMPUS",
  "ACADEMICS",
  "EXAMINATIONS",
  "PLACEMENTS",
  "EVENTS",
  "SPORTS",
  "NOTICES",
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export async function createLpuNewsArticle(formData: FormData) {
  await requireAdmin();

  if (!process.env.LPU_NEWS_DATABASE_URL) {
    redirect("/admin/lpu-news?error=database");
  }

  const title = String(formData.get("title") || "").trim().slice(0, 180);
  const excerpt = String(formData.get("excerpt") || "").trim().slice(0, 500);
  const content = String(formData.get("content") || "").trim();
  const categoryInput = String(formData.get("category") || "CAMPUS");
  const sourceName = String(formData.get("sourceName") || "").trim().slice(0, 120);
  const sourceUrlInput = String(formData.get("sourceUrl") || "").trim();
  const imageUrlInput = String(formData.get("imageUrl") || "").trim();
  const authorName = String(formData.get("authorName") || "").trim().slice(0, 120);
  const publish = formData.get("publish") === "on";

  if (title.length < 8 || excerpt.length < 20 || content.length < 40) {
    redirect("/admin/lpu-news?error=validation");
  }

  const category = ALLOWED_CATEGORIES.includes(categoryInput as (typeof ALLOWED_CATEGORIES)[number])
    ? categoryInput
    : "CAMPUS";

  const validateOptionalUrl = (value: string) => {
    if (!value) return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
    } catch {
      return null;
    }
  };

  const sourceUrl = validateOptionalUrl(sourceUrlInput);
  const imageUrl = validateOptionalUrl(imageUrlInput);

  if ((sourceUrlInput && !sourceUrl) || (imageUrlInput && !imageUrl)) {
    redirect("/admin/lpu-news?error=url");
  }

  if (publish && (!sourceUrl || !sourceName)) {
    redirect("/admin/lpu-news?error=source");
  }

  const baseSlug = slugify(title) || `lpu-update-${Date.now()}`;
  const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

  try {
    await lpuNewsPrisma.lpuNewsArticle.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        category,
        campusSlug: "lpu",
        sourceName: sourceName || null,
        sourceUrl,
        authorName: authorName || null,
        imageUrl,
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });
  } catch (error) {
    console.error("[lpu-news] Admin article create failed:", error);
    redirect("/admin/lpu-news?error=save");
  }

  revalidatePath("/lpu-news");
  revalidatePath("/");
  revalidatePath("/admin/lpu-news");
  redirect("/admin/lpu-news?created=1");
}
