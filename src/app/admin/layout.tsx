import { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentDbUser();

  if (!user) {
    console.log("[AdminLayout] No user found, redirecting to login");
    redirect("/login?redirect=/admin");
  }

  if (user.role !== "ADMIN" || user.isSuspended) {
    console.log(`[AdminLayout] Access denied for UID ${user.id}. Role: ${user.role}, Suspended: ${user.isSuspended}`);
    notFound();
  }

  return children;
}
