import { getAdminListings, updateProductStatus } from "@/actions/admin";
import { format } from "date-fns";
import { Package, CheckCircle, XCircle, Archive, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const listings = await getAdminListings(status);

  async function handleApprove(id: string) {
    "use server";
    await updateProductStatus(id, "LIVE");
    revalidatePath("/admin/listings");
  }

  async function handleReject(id: string) {
    "use server";
    await updateProductStatus(id, "REJECTED", "Did not meet platform guidelines.");
    revalidatePath("/admin/listings");
  }

  async function handleArchive(id: string) {
    "use server";
    await updateProductStatus(id, "ARCHIVED");
    revalidatePath("/admin/listings");
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-gray-500 hover:text-primary flex items-center gap-2 text-sm font-bold mb-2">
             Back to Command Center
          </Link>
          <h1 className="text-4xl font-black italic">Listing Moderation</h1>
        </div>
        <div className="flex gap-2">
          {["PENDING", "LIVE", "REJECTED", "ARCHIVED"].map((s) => (
            <Link 
              key={s}
              href={`/admin/listings?status=${s}`}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                status === s 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                : "bg-white dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-800 hover:bg-gray-50"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {listings.map((l) => (
          <div key={l.id} className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Thumbnail */}
            <div className="w-full md:w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
              {l.images[0] ? (
                <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={32} /></div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-widest">
                  {l.category.name}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-widest ${
                  l.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                  l.status === 'LIVE' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {l.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{l.title}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1"><User size={14} /> {l.seller?.name || "Anonymous"}</span>
                <span>•</span>
                <span>₹{l.price.toLocaleString()}</span>
                <span>•</span>
                <span>{format(new Date(l.createdAt), "dd MMM, yyyy")}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link 
                href={`/product/${l.id}`}
                target="_blank"
                className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                title="View Product"
              >
                <ExternalLink size={20} />
              </Link>
              
              {l.status !== "LIVE" && (
                <form action={handleApprove.bind(null, l.id)}>
                  <button className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 text-sm font-black rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100 shadow-sm shadow-emerald-100/20">
                    <CheckCircle size={18} /> APPROVE
                  </button>
                </form>
              )}

              {l.status !== "REJECTED" && (
                <form action={handleReject.bind(null, l.id)}>
                  <button className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 text-sm font-black rounded-xl hover:bg-red-100 transition-all border border-red-100 shadow-sm shadow-red-100/20">
                    <XCircle size={18} /> REJECT
                  </button>
                </form>
              )}

              <form action={handleArchive.bind(null, l.id)}>
                <button className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-100 transition-all" title="Archive">
                  <Archive size={20} />
                </button>
              </form>
            </div>
          </div>
        ))}

        {listings.length === 0 && (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold">No listings found for this status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
