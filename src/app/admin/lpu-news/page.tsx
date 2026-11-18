import Link from "next/link";
import { AlertCircle, CheckCircle2, ExternalLink, Newspaper, PlusCircle } from "lucide-react";
import { createLpuNewsArticle } from "@/actions/lpu-news";
import lpuNewsPrisma from "@/lib/lpu-news-prisma";

export const dynamic = "force-dynamic";

const categories = ["CAMPUS", "ACADEMICS", "EXAMINATIONS", "PLACEMENTS", "EVENTS", "SPORTS", "NOTICES"];

export default async function AdminLpuNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const params = await searchParams;
  const configured = Boolean(process.env.LPU_NEWS_DATABASE_URL);
  let articles: any[] = [];

  if (configured) {
    try {
      articles = await lpuNewsPrisma.lpuNewsArticle.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { id: true, title: true, slug: true, category: true, isPublished: true, createdAt: true, publishedAt: true },
      });
    } catch (error) {
      console.error("[lpu-news] Admin list fetch failed:", error);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Separate content workspace</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">LPU News Manager</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Publish campus updates into the independent LPU News database.</p>
        </div>
        <Link href="/lpu-news" target="_blank" className="inline-flex items-center gap-2 text-xs font-black text-primary hover:underline">View public news page <ExternalLink size={14} /></Link>
      </div>

      {params.created === "1" && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 size={16} /> News article saved.
        </div>
      )}
      {params.error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={16} />
          {params.error === "database" ? "Set LPU_NEWS_DATABASE_URL before publishing." :
           params.error === "validation" ? "Add a title, a summary of at least 20 characters and article content of at least 40 characters." :
           params.error === "url" ? "Source and image URLs must be valid HTTP or HTTPS URLs." :
           "Could not save the article. Check the LPU News database connection and try again."}
        </div>
      )}

      {!configured && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
          <strong>Database connection required.</strong> Create a separate PostgreSQL database for LPU News, add its connection string as <code>LPU_NEWS_DATABASE_URL</code> in Vercel and your local environment, then run <code>npm run db:news:push</code>.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <PlusCircle size={19} className="text-primary" />
            <h2 className="text-lg font-black text-gray-950 dark:text-white">Create campus update</h2>
          </div>
          <form action={createLpuNewsArticle} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">Headline *</span>
              <input name="title" required minLength={8} maxLength={180} placeholder="Write a clear, factual headline" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">Short summary *</span>
              <textarea name="excerpt" required minLength={20} maxLength={500} rows={3} placeholder="A concise summary shown on the news cards." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">Full update *</span>
              <textarea name="content" required minLength={40} rows={8} placeholder="Add the complete update. Include dates, locations and eligibility only when verified." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">Category</span>
                <select name="category" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">Author / submitted by</span>
                <input name="authorName" maxLength={120} placeholder="Optional" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">Source name</span>
                <input name="sourceName" maxLength={120} placeholder="e.g. LPU official notice" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">Source URL</span>
                <input name="sourceUrl" type="url" placeholder="https://..." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">Cover image URL</span>
              <input name="imageUrl" type="url" placeholder="https://..." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
              <input type="checkbox" name="publish" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              Publish immediately (otherwise save as draft)
            </label>
            <button type="submit" disabled={!configured} className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-black text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">
              Save news update
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Newspaper size={19} className="text-primary" />
            <h2 className="text-lg font-black text-gray-950 dark:text-white">Recent articles</h2>
          </div>
          {articles.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {articles.map((article) => (
                <div key={article.id} className="py-3 first:pt-0">
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white">{article.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-400">
                    <span>{article.category}</span>
                    <span>·</span>
                    <span>{article.isPublished ? "Published" : "Draft"}</span>
                    <span>·</span>
                    <span>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(article.createdAt)}</span>
                  </div>
                  {article.isPublished && <Link href={`/lpu-news/${article.slug}`} target="_blank" className="mt-1 inline-block text-[10px] font-black text-primary hover:underline">Open article →</Link>}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-gray-50 p-4 text-xs leading-relaxed text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {configured ? "No articles have been added yet. Create the first verified campus update using the form." : "Connect the LPU News database to manage articles here."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
