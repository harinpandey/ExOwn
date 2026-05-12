import { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentDbUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (user.role !== "ADMIN" || user.isSuspended) {
    notFound();
  }

  return children;
}
