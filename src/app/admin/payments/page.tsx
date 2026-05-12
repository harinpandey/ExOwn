import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ArrowLeft, Search, Download } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  const totalRevenue = payments
    .filter(p => p.paymentStatus === "SUCCESS")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-gray-500 hover:text-primary flex items-center gap-2 text-sm font-bold mb-2">
            <ArrowLeft size={16} /> Back to Command Center
          </Link>
          <h1 className="text-3xl font-black">Subscription & Payments</h1>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-3xl border border-emerald-100 dark:border-emerald-800">
          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Total Verified Revenue</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by user or transaction ID..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-primary font-bold text-sm px-4 py-2 hover:bg-primary/5 rounded-xl transition-all">
            <Download size={18} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Gateway ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">
                    {format(new Date(p.createdAt), "dd MMM, HH:mm")}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{p.user.name}</p>
                    <p className="text-xs text-gray-400">{p.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-gray-900 dark:text-gray-100">
                    ₹{p.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">
                    {p.transactionId || p.razorpayOrderId || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      p.paymentStatus === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 
                      p.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
