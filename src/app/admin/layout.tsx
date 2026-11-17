import { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import AdminNavigation from "@/components/admin/AdminNavigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentDbUser();

  if (!user) {
    console.log("[AdminLayout] No user found, redirecting to login");
    redirect("/login?redirect=/admin");
  }

  if (user.role !== "ADMIN" || user.isSuspended) {
    console.log(`[AdminLayout] Access denied for UID \${user.id}. Role: \${user.role}, Suspended: \${user.isSuspended}`);
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090d]">
      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-4 px-3 py-3 sm:px-5 sm:py-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <AdminNavigation />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
