import Link from "next/link";
import { Sparkles, Users, BarChart3, CreditCard, Package, AlertCircle, ShieldCheck, Activity } from "lucide-react";
import { getAdminStats } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getAdminStats();

  const stats = [
    { label: "Total users", value: data?.userCount.toLocaleString() || "0", icon: Users, color: "text-blue-500" },
    { label: "Live listings", value: data?.liveListingCount.toLocaleString() || "0", icon: Package, color: "text-purple-500" },
    { label: "Pending listings", value: data?.pendingListingCount.toLocaleString() || "0", icon: ShieldCheck, color: "text-amber-500" },
    { label: "Pending reports", value: data?.pendingReportCount.toLocaleString() || "0", icon: AlertCircle, color: "text-red-500" },
    { label: "Verified revenue", value: \`₹\${(data?.revenue || 0).toLocaleString("en-IN")}\`, icon: BarChart3, color: "text-emerald-500" },
  ];

  const tools = [
    { name: "User Management", description: "Search ExOwn accounts, open complete member records, and manage account access.", href: "/admin/users", icon: Users },
    { name: "Listing Moderation", description: "Review, approve, reject, and archive marketplace listings.", href: "/admin/listings", icon: Package },
    { name: "Subscription & Payments", description: "Review payment history and successful platform transactions.", href: "/admin/payments", icon: CreditCard },
    { name: "Reports & Safety", description: "Review scam reports, user complaints, and moderation outcomes.", href: "/admin/reports", icon: AlertCircle },
    { name: "AI Rule Engine", description: "Manage the rules used by ExOwn AI features.", href: "/admin/ai-rules", icon: Sparkles },
    { name: "Global Activity Audit", description: "Review critical account, listing, and moderation events.", href: "/admin/activity", icon: Activity },
    { name: "ExOwn Moments Manager", description: "Manage contextual in-app moments and their analytics.", href: "/admin/moments", icon: Sparkles },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-primary">ExOwn operations</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">Command Center</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">A unified workspace for marketplace administration.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Admin access active
        </span>
      </div>

      <section aria-label="Platform overview" className="mb-10 grid grid-cols-2 gap-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <stat.icon className={\`\${stat.color} mb-4\`} size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
            <p className="mt-1 break-words text-2xl font-black text-gray-950 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-gray-950 dark:text-white">Admin workspace</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose an area to manage.</p>
        </div>
        <Link href="/admin/users" className="text-xs font-black text-primary hover:underline">Open user directory →</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex min-h-44 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition group-hover:bg-primary/10 group-hover:text-primary dark:bg-gray-800 dark:text-gray-200">
              <tool.icon size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-950 transition group-hover:text-primary dark:text-white">{tool.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-relaxed text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
        Member records show information stored in ExOwn. External services and social platforms are not queried unless a user-authorized integration is added.
      </p>
    </div>
  );
}
