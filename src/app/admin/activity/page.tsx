import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Shield, User, Package, CreditCard, AlertCircle, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const logs = await prisma.activityLog.findMany({
    include: {
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const getIcon = (type: string) => {
    if (type.includes("PRODUCT")) return <Package className="text-blue-500" size={18} />;
    if (type.includes("PAYMENT") || type.includes("SUBSCRIPTION")) return <CreditCard className="text-emerald-500" size={18} />;
    if (type.includes("USER") || type.includes("PROFILE")) return <User className="text-purple-500" size={18} />;
    if (type.includes("REPORT") || type.includes("REJECTED")) return <AlertCircle className="text-red-500" size={18} />;
    return <Shield className="text-gray-500" size={18} />;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">Global <span className="text-primary">Activity Log</span></h1>
          <p className="text-gray-500 font-bold">Audit trail of all critical marketplace actions.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              placeholder="Search logs..." 
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Action</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">User</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Target/Entity</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Metadata</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {getIcon(log.actionType)}
                    <span className="text-sm font-black text-gray-900 dark:text-white">{log.actionType}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold">{log.user?.name || "System"}</p>
                    <p className="text-[10px] text-gray-400">{log.user?.email || log.userId}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-mono text-gray-500">
                    {log.productId ? `Prod: ${log.productId}` : 
                     log.rentalId ? `Rent: ${log.rentalId}` : 
                     log.targetUserId ? `User: ${log.targetUserId}` : "-"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-[200px] truncate text-[10px] text-gray-500 font-mono">
                    {JSON.stringify(log.metadata)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-xs font-bold text-gray-500">{format(new Date(log.createdAt), "MMM d, h:mm a")}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
