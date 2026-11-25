"use client";

import type { ReactNode } from "react";

export default function ClientLayoutWrapper({ marketplaceShell }: { children: ReactNode; marketplaceShell: ReactNode }) {
  // Keep the same shared header, search row and page shell across every ExOwn
  // experience. The browser/Next router owns scroll restoration; forcing
  // window.scrollTo here caused route transitions to jump unexpectedly.
  return <>{marketplaceShell}</>;
}
