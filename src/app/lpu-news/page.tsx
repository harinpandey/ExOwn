import Link from "next/link";
import { CalendarDays, Newspaper } from "lucide-react";
import { getPublishedLpuNews } from "@/lib/lpu-news";

export const dynamic = "force-dynamic";

const categories = [
  { label: "All", value: "" },
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
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function LpuNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = categories.some((item) => item.value === params.category)
    ? params.category || ""
    : "";
  const searchQuery = params.q?.trim().slice(0, 100) || "";
  const result = await getPublishedLpuNews(30, selectedCategory || undefined, searchQuery || undefined);
  const [featuredArticle, ...moreArticles] = result.articles;

  return (
    <main className="min-h-screen bg-[#f7f9f8] pb-14 dark:bg-[#090c12]">
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Lovely Professional University</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#13221d] dark:text-white sm:text-4xl">LPU News</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4a5d56] dark:text-gray-400">
              Campus announcements, academic updates, placements, events and student achievements.
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-2 rounded-full border border-[#e2e8e5] bg-white px-3 py-2 text-xs font-semibold text-[#4a5d56] dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300 sm:flex">
            <Newspaper size={15} /> Campus feed
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav className="flex gap-2 overflow-x-auto border-b border-[#e2e8e5] pb-4 no-scrollbar dark:border-white/10" aria-label="Filter LPU news">
          {categories.map((item) => (
            <Link
              key={item.value || "all"}
              href={item.value ? `/lpu-news?category=${item.value}` : "/lpu-news"}
              aria-current={selectedCategory === item.value ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                selectedCategory === item.value
                  ? "border-primary bg-primary text-white"
                  : "border-[#e2e8e5] bg-white text-[#4a5d56] hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {searchQuery && (
          <p className="pt-4 text-sm font-semibold text-[#4a5d56] dark:text-gray-400">
            Search results for <span className="font-extrabold text-[#13221d] dark:text-white">“{searchQuery}”</span>
          </p>
        )}

        {featuredArticle ? (
          <div className="pt-6">
            <Link
              href={`/lpu-news/${featuredArticle.slug}`}
              className="group grid overflow-hidden rounded-3xl border border-[#e2e8e5] bg-white transition hover:border-primary/30 dark:border-white/10 dark:bg-[#10141b] lg:grid-cols-[1.05fr_0.95fr]"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[#eaf2ef] dark:bg-white/[0.04] lg:aspect-auto lg:min-h-[350px]">
                {featuredArticle.imageUrl ? (
                  <img src={featuredArticle.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                ) : (
                  <div className="flex h-full min-h-56 items-center justify-center text-primary"><Newspaper size={54} strokeWidth={1.3} /></div>
                )}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#4a5d56] dark:text-gray-400">
                  <span className="rounded-full bg-[#eaf2ef] px-3 py-1.5 uppercase tracking-wide text-[#1e5646] dark:bg-primary/15 dark:text-emerald-300">
                    {featuredArticle.category.replace(/_/g, " ")}
                  </span>
                  <span>Latest update</span>
                </div>
                <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-[#13221d] transition group-hover:text-primary dark:text-white sm:text-3xl">
                  {featuredArticle.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#4a5d56] dark:text-gray-400">{featuredArticle.excerpt}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-400">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {formatDate(featuredArticle.publishedAt)}</span>
                  {featuredArticle.sourceName && <span>{featuredArticle.sourceName}</span>}
                </div>
                <span className="mt-6 text-sm font-extrabold text-primary">Open story <span aria-hidden="true">↗</span></span>
              </div>
            </Link>

            {moreArticles.length > 0 && (
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black tracking-tight text-[#13221d] dark:text-white">Latest from LPU</h2>
                  <span className="text-xs font-semibold text-gray-400">{result.articles.length} stories</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {moreArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/lpu-news/${article.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e2e8e5] bg-white transition hover:-translate-y-0.5 hover:border-primary/30 dark:border-white/10 dark:bg-[#10141b]"
                    >
                      {article.imageUrl ? (
                        <div className="aspect-[16/9] overflow-hidden bg-[#eaf2ef] dark:bg-white/[0.04]"><img src={article.imageUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /></div>
                      ) : (
                        <div className="flex aspect-[16/9] items-center justify-center bg-[#eaf2ef] text-primary dark:bg-white/[0.04]"><Newspaper size={36} /></div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        <span className="w-fit rounded-full bg-[#eaf2ef] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#1e5646] dark:bg-primary/15 dark:text-emerald-300">{article.category.replace(/_/g, " ")}</span>
                        <h3 className="mt-3 text-base font-extrabold leading-snug text-[#13221d] transition group-hover:text-primary dark:text-white">{article.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#4a5d56] dark:text-gray-400">{article.excerpt}</p>
                        <div className="mt-auto flex items-center gap-1.5 pt-5 text-[11px] font-semibold text-gray-400"><CalendarDays size={13} /> {formatDate(article.publishedAt)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="my-8 rounded-3xl border border-dashed border-[#cfdad5] bg-white px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.025]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf2ef] text-primary dark:bg-primary/15"><Newspaper size={27} /></div>
            <h2 className="mt-5 text-xl font-black text-[#13221d] dark:text-white">
              {result.unavailable ? "LPU News is temporarily unavailable" : result.configured ? "No stories published yet" : "LPU News is getting ready"}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[#4a5d56] dark:text-gray-400">
              {result.unavailable
                ? "The campus news feed could not be reached. Please check back shortly."
                : result.configured
                  ? searchQuery ? `No LPU news found for “${searchQuery}”. Try another keyword.` : "There are no published stories in this category right now."
                  : "Published LPU campus updates will appear here once the dedicated news feed is connected."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
