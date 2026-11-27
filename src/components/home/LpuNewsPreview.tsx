import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { getPublishedLpuNews } from "@/lib/lpu-news";

function formatDate(date: Date | null) {
  if (!date) return "Recently added";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function LpuNewsPreview() {
  const result = await getPublishedLpuNews(4);

  return (
    <section className="container mx-auto px-4 py-7 sm:py-9">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            <Newspaper size={13} /> Separate campus news feed
          </p>
          <h2 className="text-xl font-black tracking-tight text-gray-950 dark:text-white sm:text-2xl">
            LPU Campus News
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-500 dark:text-white/50 sm:text-sm">
            University updates, events, academics and placement notices.
          </p>
        </div>
        <Link href="/lpu-news" className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-primary hover:underline">
          All news <ArrowRight size={14} />
        </Link>
      </div>

      {result.articles.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {result.articles.map((article) => (
            <Link
              key={article.id}
              href={`/lpu-news/${article.slug}`}
              className="group overflow-hidden rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-white/10 dark:bg-[#10141b]"
            >
              {article.imageUrl ? (
                <div className="aspect-[16/9] overflow-hidden bg-[#E1D3C5] dark:bg-[#EFE5DA]/[0.04]">
                  <img src={article.imageUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[#17645F] to-[#183B38 text-white">
                  <Newspaper size={34} />
                </div>
              )}
              <div className="p-4">
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-primary">
                  {article.category.replace(/_/g, " ")}
                </span>
                <h3 className="mt-3 line-clamp-2 text-sm font-black text-[#183B38] group-hover:text-primary dark:text-white">
                  {article.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-white/50">
                  {article.excerpt}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                  <CalendarDays size={12} /> {formatDate(article.publishedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-gray-300 bg-[#E6DACE]/70 p-5 dark:border-white/15 dark:bg-[#EFE5DA]/[0.025] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#183B38] dark:text-white">
              {result.unavailable ? "LPU News is temporarily unavailable" : "LPU News is being set up"}
            </p>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-500 dark:text-white/50">
              {result.configured
                ? "The dedicated news database is connected, but no verified stories have been published yet."
                : "Campus news will appear here after the separate LPU News database is connected. No unverified headlines are displayed."}
            </p>
          </div>
          <Link href="/lpu-news" className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-primary hover:underline">
            Open LPU News <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </section>
  );
}
