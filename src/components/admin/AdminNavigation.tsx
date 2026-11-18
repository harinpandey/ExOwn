"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  Flag,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Package,
  Sparkles,
  Users,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "User management", href: "/admin/users", icon: Users },
  { label: "Listing moderation", href: "/admin/listings", icon: Package },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Reports & safety", href: "/admin/reports", icon: Flag },
  { label: "Activity audit", href: "/admin/activity", icon: Activity },
  { label: "AI rules", href: "/admin/ai-rules", icon: Sparkles },
  { label: "Moments manager", href: "/admin/moments", icon: Sparkles },
  { label: "Ads manager", href: "/admin/ads", icon: Megaphone },
  { label: "LPU News", href: "/admin/lpu-news", icon: Newspaper },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <aside className="mb-4 lg:sticky lg:top-4 lg:mb-0 lg:h-[calc(100vh-2rem)]">
      <div className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Link href="/admin" className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-950 p-4 text-white dark:bg-black">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-black">EX</span>
          <span className="min-w-0">
            <span className="block text-sm font-black tracking-wide">ExOwn Admin</span>
            <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">Control center</span>
          </span>
        </Link>

        <p className="mb-2 hidden px-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 lg:block">Workspace</p>
        <nav aria-label="Admin navigation" className="flex gap-2 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:overflow-visible">
          {navigation.map((item) => {
            const active = item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold transition lg:w-full ${active
                  ? "bg-primary/10 text-primary ring-1 ring-primary/15"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {active && <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-primary lg:block" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 hidden border-t border-gray-100 pt-4 dark:border-gray-800 lg:block">
          <Link href="/" className="flex items-center justify-between rounded-xl px-3 py-3 text-xs font-bold text-gray-500 transition hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800">
            Back to marketplace <ArrowUpRight size={15} />
          </Link>
          <p className="px-3 pt-2 text-[10px] leading-relaxed text-gray-400">Admin tools are protected by server-side role checks.</p>
        </div>
      </div>
    </aside>
  );
}
