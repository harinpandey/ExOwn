import { getAdminUsers, updateUserStatus } from "@/actions/admin";
import { Ban, CheckCircle, ChevronRight, Mail, Search, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const users = await getAdminUsers(q);

  async function handleBan(userId: string) {
    "use server";
    await updateUserStatus(userId, true, "Suspended after admin review.");
    revalidatePath("/admin/users");
  }

  async function handleUnban(userId: string) {
    "use server";
    await updateUserStatus(userId, false);
    revalidatePath("/admin/users");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-primary">People & accounts</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">User Management</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Search ExOwn accounts, review their campus profile and activity, and manage account access.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <Users size={18} className="text-primary" />
          {users.length} {users.length === 100 ? "or more " : ""}accounts shown
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <form action="/admin/users" method="get" role="search" className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              name="q"
              defaultValue={q}
              type="search"
              maxLength={120}
              placeholder="Search name, email, phone or registration number"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing the latest 100 accounts. Open a profile for the full ExOwn record.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/70">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Member</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Campus profile</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Platform activity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Trust</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Account status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="transition hover:bg-gray-50/80 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                        {u.image ? (
                          <img src={u.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-black text-primary">
                            {(u.name || u.email || "U").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={\`/admin/users/\${u.id}\`} className="block truncate text-sm font-black text-gray-900 hover:text-primary dark:text-white">
                          {u.name || "Unnamed member"}
                        </Link>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500 dark:text-gray-400">
                          <Mail size={12} /> {u.email || "No email"}
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{u.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{u.profile?.collegeName || "Campus not added"}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {[u.profile?.course, u.profile?.year, u.profile?.batch].filter(Boolean).join(" · ") || "Profile details pending"}
                    </p>
                    {u.isVerified ? (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    ) : (
                      <span className="mt-2 inline-flex text-[10px] font-bold uppercase tracking-wider text-amber-600">Not verified</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span><strong className="text-gray-900 dark:text-white">{u._count.products}</strong><span className="ml-1 text-gray-500">listings</span></span>
                      <span><strong className="text-gray-900 dark:text-white">{u._count.orders}</strong><span className="ml-1 text-gray-500">orders</span></span>
                      <span><strong className="text-gray-900 dark:text-white">{u._count.payments}</strong><span className="ml-1 text-gray-500">payments</span></span>
                      <span><strong className="text-gray-900 dark:text-white">{u._count.messagesSent}</strong><span className="ml-1 text-gray-500">messages sent</span></span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <div className={\`h-full rounded-full \${u.trustScore >= 70 ? "bg-emerald-500" : u.trustScore >= 40 ? "bg-amber-500" : "bg-red-500"}\`} style={{ width: \`\${Math.max(0, Math.min(100, u.trustScore))}%\` }} />
                      </div>
                      <span className="text-xs font-black text-gray-700 dark:text-gray-300">{u.trustScore}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-500">Fraud score: {u.fraudScore}</p>
                  </td>
                  <td className="px-6 py-5">
                    {u.isSuspended ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        <ShieldAlert size={12} /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle size={12} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={\`/admin/users/\${u.id}\`} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200">
                        View record <ChevronRight size={14} />
                      </Link>
                      {u.isSuspended ? (
                        <form action={handleUnban.bind(null, u.id)}>
                          <button className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300">
                            Restore
                          </button>
                        </form>
                      ) : (
                        <form action={handleBan.bind(null, u.id)}>
                          <button className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300">
                            <Ban size={13} /> Suspend
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Users size={36} className="mx-auto text-gray-300" />
            <p className="mt-3 font-bold text-gray-800 dark:text-gray-200">No matching ExOwn accounts</p>
            <p className="mt-1 text-sm text-gray-500">Try a different name, email, phone number or registration number.</p>
          </div>
        )}
      </div>
    </div>
  );
}
