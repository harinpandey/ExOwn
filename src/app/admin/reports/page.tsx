import { getAdminReports, resolveReport } from "@/actions/admin";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, ShieldCheck, Flag, Package, User } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await getAdminReports();

  async function handleAction(reportId: string, status: any) {
    "use server";
    await resolveReport(reportId, status);
    revalidatePath("/admin/reports");
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-gray-500 hover:text-primary flex items-center gap-2 text-sm font-bold mb-2">
             Back to Command Center
          </Link>
          <h1 className="text-4xl font-black italic">Safety & Reports</h1>
        </div>
        <div className="px-6 py-3 bg-red-50 text-red-700 text-xs font-black rounded-full border border-red-100 flex items-center gap-2">
          <AlertTriangle size={16} /> {reports.filter(r => r.status === 'PENDING').length} PENDING REPORTS
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reports.map((r) => (
          <div key={r.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm p-8 flex flex-col md:flex-row gap-8">
            {/* Status & Type */}
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center shrink-0">
              <Flag size={32} className="text-red-500" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded uppercase tracking-widest">
                  {r.reason}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-widest ${
                  r.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                  r.status === 'ACTION_TAKEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {r.status}
                </span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-1">{r.description || "No description provided."}</h3>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><User size={14} /> Reported by: {r.reporter.name}</span>
                  {r.product && <span className="flex items-center gap-1"><Package size={14} /> Product: {r.product.title}</span>}
                  {r.reported && <span className="flex items-center gap-1"><User size={14} /> User reported: {r.reported.name}</span>}
                  <span>•</span>
                  <span>{format(new Date(r.createdAt), "dd MMM, HH:mm")}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 justify-center">
              {r.status === "PENDING" && (
                <>
                  <form action={handleAction.bind(null, r.id, "ACTION_TAKEN")}>
                    <button className="w-full px-6 py-3 bg-red-500 text-white text-xs font-black rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                      <ShieldCheck size={16} /> TAKE ACTION
                    </button>
                  </form>
                  <form action={handleAction.bind(null, r.id, "DISMISSED")}>
                    <button className="w-full px-6 py-3 bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs font-black rounded-xl hover:bg-gray-100 transition-all">
                      DISMISS
                    </button>
                  </form>
                </>
              )}
              {r.status !== "PENDING" && (
                <div className="text-emerald-500 font-black text-xs uppercase tracking-widest flex items-center gap-1 justify-center">
                  <CheckCircle size={14} /> RESOLVED
                </div>
              )}
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
            <ShieldCheck size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold">Safe Zone: No pending reports.</p>
          </div>
        )}
      </div>
    </div>
  );
}
