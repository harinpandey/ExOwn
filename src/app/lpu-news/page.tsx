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
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date);
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

  return (
    <main className="min-h-screen bg-gray-50/70 pb-16 dark:bg-[#090c12]">
      <section className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#10141b]">
        <div className="container mx-auto px-4 py-9 sm:py-12">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <Radio size={14} /> LPU campus desk
          </p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">LPU News & Updates</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Campus announcements, academic updates, examination notices, placements, events and student achievements.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
              <ShieldCheck size={15} /> Separate LPU News database
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-7">
        <nav className="mb-7 flex gap-2 overflow-x-auto pb-2 no-scrollbar" aria-label="News categories">
          {categories.map((item) => (
            <Link
              key={item.value || "all"}
              href={item.value ? `/lpu-news?category=${item.value}` : "/lpu-news"}
              aria-current={selectedCategory === item.value ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
                selectedCategory === item.value
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white/65"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {result.articles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.articles.map((article) => (
              <article key={article.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#10141b]">
                {article.imageUrl ? (
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-white/[0.04]">
                    <img src={article.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-blue-950 to-blue-700 text-white">
                    <Newspaper size={42} />
                  </div>
                )}
                <div className="p-5">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-primary">{article.category.replace(/_/g, " ")}</span>
                  <h2 className="mt-3 text-lg font-black leading-snug text-gray-950 dark:text-white">{article.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{article.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-gray-400"><CalendarDays size={13} />{formatDate(article.publishedAt)}</span>
                    <Link href={`/lpu-news/${article.slug}`} className="inline-flex items-center gap-1 text-xs font-black text-primary hover:underline">Read update <ArrowRight size={14} /></Link>
                  </div>
                  {article.sourceName && <p className="mt-3 text-[10px] font-semibold text-gray-400">Source: {article.sourceName}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.025]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Newspaper size={27} /></div>
            <h2 className="mt-5 text-xl font-black text-gray-950 dark:text-white">
              {result.unavailable ? "News database temporarily unavailable" : "Campus updates are coming here"}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {result.configured
                ? "The separate news database is connected, but there are no published LPU updates yet."
                : "The LPU News database has not been connected yet. Once configured, verified campus stories will appear here. We do not display invented headlines."}
            </p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white">Back to ExOwn <ArrowRight size={14} /></Link>
          </div>
        )}
      </section>
    </main>
  );
}
