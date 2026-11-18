import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";
import { getAdminAds } from "@/actions/ads";
import AdsManager from "@/components/admin/AdsManager";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  let initialAds: any[] = [];
  let databaseUnavailable = false;

  try {
    const ads = await getAdminAds();
    initialAds = ads.map((ad) => ({
      ...ad,
      startDate: ad.startDate.toISOString(),
      endDate: ad.endDate.toISOString(),
      createdAt: ad.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("[AdminAdsPage] Could not load ads:", error);
    databaseUnavailable = true;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-7">
        <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-[#4A5D56] transition hover:text-[#1E5646]">
          <ArrowLeft size={14} /> Back to Command Center
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F2EE] text-[#1E5646]">
            <Megaphone size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#13221D] sm:text-3xl">Campus Ads Manager</h1>
            <p className="mt-1 text-sm text-[#4A5D56]">Create, preview and schedule image-led sponsored banners.</p>
          </div>
        </div>
      </div>

      {databaseUnavailable && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
          The ad database is currently unavailable. You can still preview a draft, but saving or activating ads requires a working database connection.
        </div>
      )}

      <AdsManager initialAds={initialAds} />
    </div>
  );
}
