import Link from "next/link";
import { Sparkles, Users, ShieldCheck, BarChart3, Settings } from "lucide-react";

export default function AdminPage() {
  const stats = [
    { label: "Total Users", value: "1.2k", icon: Users, color: "text-blue-500" },
    { label: "Verified", value: "850", icon: ShieldCheck, color: "text-emerald-500" },
    { label: "AI Suggestions", value: "4.5k", icon: Sparkles, color: "text-purple-500" },
    { label: "Daily Transactions", value: "120", icon: BarChart3, color: "text-orange-500" },
  ];

  const tools = [
    { name: "AI Rule Engine", description: "Fine-tune scoring and buy recommendations.", href: "/admin/ai-rules", icon: Sparkles },
    { name: "User Verification", description: "Approve/Reject student registrations.", href: "#", icon: ShieldCheck },
    { name: "Global Settings", description: "Platform fees, maintenance mode, etc.", href: "#", icon: Settings },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-black mb-2 italic">ExOwn Command Center</h1>
      <p className="text-gray-500 mb-12 font-medium">Platform overview and administrative controls.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <stat.icon className={`${stat.color} mb-3`} size={24} />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tools.map((tool, i) => (
          <Link 
            key={i} 
            href={tool.href}
            className="group bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary transition-all flex items-start gap-6"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <tool.icon size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{tool.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
