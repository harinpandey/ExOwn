import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, Newspaper, ShieldCheck } from "lucide-react";
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
    <main className="min-h-screen bg-[#f7f8fc] pb-16 dark:bg-[#090c12]">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        <Link href="/lpu-news" className="inline-flex items-center gap-2 rounded-lg text-xs font-bold text-gray-500 transition hover:text-primary dark:text-gray-400">
          <ArrowLeft size={15} /> Back to campus updates
        </Link>
        <article className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#10141b]">
          <div className="relative bg-gradient-to-br from-blue-950 to-blue-700">
            {article.imageUrl ? (
              <div className="max-h-[480px] overflow-hidden"><img src={article.imageUrl} alt="" className="max-h-[480px] w-full object-cover" /></div>
            ) : (
              <div className="flex h-56 items-center justify-center text-white"><Newspaper size={52} strokeWidth={1.3} /></div>
            )}
          </div>
          <div className="mx-auto max-w-3xl px-5 py-7 sm:px-10 sm:py-10">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{article.category.replace(/_/g, " ")}</span>
            <h1 className="mt-5 text-2xl font-black leading-tight tracking-tight text-gray-950 dark:text-white sm:text-4xl">{article.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-100 pb-5 text-xs font-semibold text-gray-400 dark:border-white/10">
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {formatDate(article.publishedAt)}</span>
              {article.authorName && <span>By {article.authorName}</span>}
              {article.sourceName && <span>Source: {article.sourceName}</span>}
            </div>
            <p className="mt-7 rounded-r-xl border-l-4 border-primary bg-primary/[0.04] px-4 py-4 text-sm font-semibold leading-7 text-gray-700 dark:text-gray-200">{article.excerpt}</p>
            <div className="prose prose-sm mt-7 max-w-none whitespace-pre-wrap text-sm leading-8 text-gray-700 dark:prose-invert dark:text-gray-200">{article.content}</div>
            {article.sourceUrl && (
              <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-xs font-bold text-gray-700 transition hover:border-primary/40 hover:text-primary dark:border-white/10 dark:text-gray-200">
                View original source <ExternalLink size={14} />
              </a>
            )}
            <div className="mt-9 flex items-center gap-2 border-t border-gray-100 pt-5 text-[11px] font-semibold text-gray-400 dark:border-white/10">
              <ShieldCheck size={14} className="text-emerald-600" /> Confirm formal dates and instructions against the original notice.
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
