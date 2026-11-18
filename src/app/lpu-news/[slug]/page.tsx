import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, Newspaper } from "lucide-react";
import { getPublishedLpuNewsArticle } from "@/lib/lpu-news";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) return "Recently added";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default async function LpuNewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getPublishedLpuNewsArticle(slug);
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-gray-50/70 pb-16 dark:bg-[#090c12]">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link href="/lpu-news" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary">
          <ArrowLeft size={15} /> Back to LPU News
        </Link>
        <article className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#10141b]">
          {article.imageUrl ? (
            <div className="max-h-[440px] overflow-hidden bg-gray-100 dark:bg-white/[0.04]">
              <img src={article.imageUrl} alt="" className="max-h-[440px] w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-52 items-center justify-center bg-gradient-to-br from-blue-950 to-blue-700 text-white"><Newspaper size={48} /></div>
          )}
          <div className="p-6 sm:p-10">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-primary">{article.category.replace(/_/g, " ")}</span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-gray-950 dark:text-white sm:text-4xl">{article.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-400">
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{formatDate(article.publishedAt)}</span>
              {article.authorName && <span>By {article.authorName}</span>}
              {article.sourceName && <span>Source: {article.sourceName}</span>}
            </div>
            <p className="mt-7 border-l-4 border-primary pl-4 text-base font-semibold leading-relaxed text-gray-600 dark:text-gray-300">{article.excerpt}</p>
            <div className="mt-7 whitespace-pre-wrap text-sm leading-8 text-gray-700 dark:text-gray-200">{article.content}</div>
            {article.sourceUrl && (
              <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 text-xs font-black text-primary hover:underline">
                View original source <ExternalLink size={14} />
              </a>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
