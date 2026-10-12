import prisma, { withRetry } from "@/lib/prisma";
import Link from "next/link";
import { Sparkles, ExternalLink } from "lucide-react";

export default async function CampusSpotlight() {
  let ads: any[] = [];
  try {
    ads = await withRetry(() =>
      prisma.ad.findMany({
        where: { isActive: true },
        take: 2,
        orderBy: { createdAt: "desc" },
      })
    );
  } catch (err) {
    console.error("[CampusSpotlight] Error fetching active ads:", err);
  }

  // Graceful collapse if no real ads exist in production DB
  if (!ads || ads.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-8" aria-label="Campus Spotlight">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-primary">
            <Sparkles size={16} />
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">Sponsored</span>
            <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Campus Spotlight
            </h2>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#10141b]"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                <span>{ad.sponsorName || "Campus Partner"}</span>
                <span className="rounded bg-gray-100 dark:bg-zinc-800 px-2 py-0.5">Ad</span>
              </div>
              <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition dark:text-white">
                {ad.title}
              </h3>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
              <Link
                href={ad.linkUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
              >
                <span>Learn More</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
