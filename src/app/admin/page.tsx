import Link from "next/link";
import { Sparkles, Users, ShieldCheck, BarChart3, Settings, CreditCard, Package, AlertCircle } from "lucide-react";

import { getAdminStats } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getAdminStats();
  
  const stats = [
    { label: "Active Users", value: data?.userCount.toLocaleString() || "0", icon: Users, color: "text-blue-500" },
    { label: "Pending Reports", value: data?.reportCount.toLocaleString() || "0", icon: AlertCircle, color: "text-red-500" },
    { label: "Live Listings", value: data?.productCount.toLocaleString() || "0", icon: Package, color: "text-purple-500" },
    { label: "Total Revenue", value: `₹${(data?.revenue || 0).toLocaleString()}`, icon: BarChart3, color: "text-emerald-500" },
  ];

  const tools = [
    { name: "Subscription & Payments", description: "Review billing history, refunds, and plan upgrades.", href: "/admin/payments", icon: CreditCard },
    { name: "Listing Moderation", description: "Review, approve, or archive reported listings.", href: "/admin/listings", icon: Package },
    { name: "User Verification", description: "Verify student identities and student IDs.", href: "/admin/verification", icon: ShieldCheck },
    { name: "AI Rule Engine", description: "Fine-tune scoring and buy recommendations.", href: "/admin/ai-rules", icon: Sparkles },
    { name: "Reports & Disputes", description: "Handle user complaints and scam reports.", href: "/admin/reports", icon: AlertCircle },
    { name: "Global Settings", description: "Platform fees, maintenance mode, and SEO.", href: "/admin/settings", icon: Settings },
    { name: "Global Activity Audit", description: "Real-time audit trail of all platform actions and fraud signals.", href: "/admin/activity", icon: ShieldCheck },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 italic">ExOwn Command Center</h1>
          <p className="text-gray-500 font-medium">Platform overview and administrative controls.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full animate-pulse">
            SYSTEM ONLINE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <stat.icon className={`${stat.color} mb-4`} size={28} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black mt-1 text-gray-900 dark:text-gray-50">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-6 text-gray-400 uppercase tracking-widest">Administrative Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool, i) => (
          <Link 
            key={i} 
            href={tool.href}
            className="group bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all flex flex-col gap-4"
          >
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <tool.icon size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{tool.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
