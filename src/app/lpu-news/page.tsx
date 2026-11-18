import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper, Radio, ShieldCheck } from "lucide-react";
import { getPublishedLpuNews } from "@/lib/lpu-news";

export const dynamic = "force-dynamic";

const categories = [
  { label: "All updates", value: "" },
  { label: "Campus", value: "CAMPUS" },
  { label: "Academics", value: "ACADEMICS" },
  { label: "Examinations", value: "EXAMINATIONS" },
  { label: "Placements", value: "PLACEMENTS" },
  { label: "Events", value: "EVENTS" },
  { label: "Sports", value: "SPORTS" },
  { label: "Notices", value: "NOTICES" },
];

function formatDate(date: Date | null) {
  if (!date) return "Recently added";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default async function LpuNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = categories.some((item) => item.value === params.category)
    ? params.category || ""
    : "";
  const result = await getPublishedLpuNews(30, selectedCategory || undefined);
  const featuredArticle = result.articles[0] ?? null;
  const moreArticles = result.articles.slice(1);

  return (
    <main className="min-h-screen bg-[#f7f8fc] pb-16 dark:bg-[#090c12]">
      <section className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#10141b]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <Radio size={14} /> LPU campus desk
          </span>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl lg:text-5xl">Campus updates, all in one place.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
                Read published campus announcements, academic updates, examination notices, placement news, events and student achievements.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
              <ShieldCheck size={16} /> Published campus updates
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-9">
        <nav className="mb-7 flex gap-2 overflow-x-auto pb-2 no-scrollbar" aria-label="Filter news by category">
          {categories.map((item) => (
            <Link
              key={item.value || "all"}
              href={item.value ? `/lpu-news?category=${item.value}` : "/lpu-news"}
              aria-current={selectedCategory === item.value ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold transition focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                selectedCategory === item.value
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {featuredArticle ? (
          <>
            <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#10141b]">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative min-h-56 bg-gradient-to-br from-blue-950 to-blue-700 lg:min-h-[360px]">
                  {featuredArticle.imageUrl ? (
                    <img src={featuredArticle.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-56 items-center justify-center text-white/90"><Newspaper size={56} strokeWidth={1.3} /></div>
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      {featuredArticle.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">Featured update</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-gray-950 dark:text-white sm:text-3xl">{featuredArticle.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">{featuredArticle.excerpt}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-400">
                    <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {formatDate(featuredArticle.publishedAt)}</span>
                    {featuredArticle.sourceName && <span>Source: {featuredArticle.sourceName}</span>}
                  </div>
                  <Link href={`/lpu-news/${featuredArticle.slug}`} className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-black text-white transition hover:bg-primary-dark">
                    Read full update <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </article>

            {moreArticles.length > 0 && (
              <div className="mt-9">
                <div className="mb-5 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-gray-950 dark:text-white">More campus updates</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Latest published stories from the campus desk.</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">{moreArticles.length} updates</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {moreArticles.map((article) => (
                    <article key={article.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-[#10141b]">
                      {article.imageUrl ? (
                        <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-white/[0.04]"><img src={article.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" /></div>
                      ) : (
                        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-blue-950 to-blue-700 text-white"><Newspaper size={38} /></div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        <span className="w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{article.category.replace(/_/g, " ")}</span>
                        <h3 className="mt-3 text-base font-black leading-snug text-gray-950 dark:text-white">{article.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">{article.excerpt}</p>
                        <div className="mt-auto flex items-center justify-between gap-2 pt-5">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-gray-400"><CalendarDays size={13} /> {formatDate(article.publishedAt)}</span>
                          <Link href={`/lpu-news/${article.slug}`} className="inline-flex items-center gap-1 text-xs font-black text-primary hover:underline">Read <ArrowRight size={14} /></Link>
                        </div>
                        {article.sourceName && <p className="mt-3 text-[10px] font-semibold text-gray-400">Source: {article.sourceName}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.025]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><Newspaper size={27} /></div>
            <h2 className="mt-5 text-xl font-black text-gray-950 dark:text-white">
              {result.unavailable ? "News is temporarily unavailable" : result.configured ? "No published updates yet" : "Campus news is being set up"}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              {result.unavailable
                ? "The campus news service could not be reached. Please check back shortly."
                : result.configured
                  ? "There are no published stories in this category right now. Try another category or check back later."
                  : "The separate LPU News database is not connected yet. Published campus updates will appear here once it is configured."}
            </p>
            {selectedCategory && <Link href="/lpu-news" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5">View all updates <ArrowRight size={14} /></Link>}
          </div>
        )}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#10141b]">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" />
          <p className="text-xs leading-6 text-gray-500 dark:text-gray-400">Only published articles from ExOwn’s LPU News database are shown. Always check the linked official notice or source for deadlines and formal instructions.</p>
        </div>
      </section>
    </main>
  );
}
