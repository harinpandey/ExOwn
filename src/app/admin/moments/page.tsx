import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getAdminMoments, getMomentsAnalyticsSummary } from "@/actions/moments";
import MomentsManager from "@/components/admin/MomentsManager";

export const dynamic = "force-dynamic";

export default async function AdminMomentsPage() {
  const [moments, analytics] = await Promise.all([
    getAdminMoments(),
    getMomentsAnalyticsSummary(),
  ]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-black text-white/50 hover:text-primary transition"
          >
            <ArrowLeft size={14} /> Back to Command Center
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <Sparkles size={20} />
            </span>
            <div>
              <h1 className="text-3xl font-black italic tracking-tight text-white">
                ExOwn Moments Manager
              </h1>
              <p className="text-xs text-white/50">
                Contextual, funny, and personalized in-app communication layer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Manager Client Component */}
      <MomentsManager initialMoments={moments} analytics={analytics} />
    </div>
  );
}
