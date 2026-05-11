import { getAdminUsers, updateUserStatus } from "@/actions/admin";
import { format } from "date-fns";
import { Users, Search, Ban, CheckCircle, ShieldAlert, Mail, Package, MessageSquare } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const users = await getAdminUsers(q);

  async function handleBan(userId: string) {
    "use server";
    await updateUserStatus(userId, true, "Violated platform terms.");
    revalidatePath("/admin/users");
  }

  async function handleUnban(userId: string) {
    "use server";
    await updateUserStatus(userId, false);
    revalidatePath("/admin/users");
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-gray-500 hover:text-primary flex items-center gap-2 text-sm font-bold mb-2">
             Back to Command Center
          </Link>
          <h1 className="text-4xl font-black italic">User Management</h1>
        </div>
        <div className="flex items-center gap-4">
           <span className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-black rounded-full border border-blue-100">
             {users.length} USERS FOUND
           </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between gap-4">
          <form className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              name="q"
              defaultValue={q}
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
          </form>
          <div className="flex gap-2">
            <button className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 transition-colors">
              <Users size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User Details</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Activity</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Trust Score</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center font-black text-primary overflow-hidden">
                        {u.image ? <img src={u.image} alt="" className="w-full h-full object-cover" /> : u.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          {u.name}
                          {u.isVerified && <CheckCircle size={14} className="text-blue-500" />}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                          <Mail size={12} /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-lg font-black text-gray-900 dark:text-gray-100">{u._count.products}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Listings</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-gray-900 dark:text-gray-100">{u._count.messagesSent}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Chats</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden w-24">
                        <div 
                          className={`h-full transition-all ${u.trustScore > 70 ? 'bg-emerald-500' : u.trustScore > 40 ? 'bg-orange-500' : 'bg-red-500'}`} 
                          style={{ width: `${u.trustScore}%` }} 
                        />
                      </div>
                      <span className="text-xs font-black text-gray-500">{u.trustScore}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {u.isSuspended ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1 w-fit">
                        <ShieldAlert size={12} /> Suspended
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1 w-fit">
                        <CheckCircle size={12} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {u.isSuspended ? (
                      <form action={handleUnban.bind(null, u.id)}>
                        <button className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-black rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100">
                          REACTIVATE
                        </button>
                      </form>
                    ) : (
                      <form action={handleBan.bind(null, u.id)}>
                        <button className="px-4 py-2 bg-red-50 text-red-700 text-xs font-black rounded-xl hover:bg-red-100 transition-all border border-red-100 flex items-center gap-2 ml-auto">
                          <Ban size={14} /> SUSPEND
                        </button>
                      </form>
                    )}
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
