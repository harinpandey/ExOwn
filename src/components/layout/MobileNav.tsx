"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Home,
  House,
  KeyRound,
  MessageSquare,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const pathname = usePathname();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user, isProfileComplete } = useAuth();

  const getSellHref = (type?: "RENT" | "EXCHANGE" | "SERVICE") => {
    const destination = type ? `/sell?type=${type}` : "/sell";
    if (!user) return `/login?redirect=${encodeURIComponent(destination)}`;
    if (!isProfileComplete) return `/complete-profile?redirect=${encodeURIComponent(destination)}`;
    return destination;
  };

  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Search", icon: Search, href: "/search" },
    { name: "Chat", icon: MessageSquare, href: "/chat" },
    { name: "Profile", icon: User, href: "/profile" },
  ];

  const createActions = [
    { label: "Sell Item", href: getSellHref(), icon: PackagePlus },
    { label: "Rent Item", href: getSellHref("RENT"), icon: KeyRound },
    { label: "Exchange", href: getSellHref("EXCHANGE"), icon: RefreshCw },
    { label: "Find Student Housing", href: "/housing", icon: House },
    { label: "Roommate Finder", href: "/roommates", icon: User },
    { label: "Offer Service", href: getSellHref("SERVICE"), icon: BriefcaseBusiness },
  ];

  return (
    <>
      <AnimatePresence>
        {isCreateOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close create menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 z-40 bg-[#13221D]/20 lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              style={{ bottom: "calc(env(safe-area-inset-bottom) + 138px)" }}
              className="fixed left-3 right-3 z-50 rounded-2xl border border-[#E2E8E5] bg-white p-4 shadow-[0_8px_28px_rgba(19,34,29,0.12)] lg:hidden"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-bold text-[#13221D]">Create on ExOwn</p>
                  <p className="text-xs text-[#4A5D56]">Choose what you want to post.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="tap-target rounded-lg text-[#4A5D56] hover:bg-[#F7F9F8] hover:text-[#1E5646]"
                  aria-label="Close create menu"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {createActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      onClick={() => setIsCreateOpen(false)}
                      className="flex items-center gap-3 rounded-xl border border-[#E2E8E5] bg-white px-4 py-3 text-sm font-semibold text-[#13221D] transition hover:border-[#CAD8D2] hover:bg-[#F7F9F8]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F2EE] text-[#1E5646]">
                        <Icon size={19} />
                      </span>
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsCreateOpen((value) => !value)}
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 76px)" }}
        className="fixed left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#F7F9F8] bg-[#1E5646] text-white shadow-[0_3px_10px_rgba(19,34,29,0.12)] transition hover:bg-[#174536] active:scale-95 lg:hidden"
        aria-label="Create listing"
        aria-expanded={isCreateOpen}
      >
        <Plus size={24} className={isCreateOpen ? "rotate-45 transition-transform" : "transition-transform"} />
      </button>

      <nav
        aria-label="Main mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2E8E5] bg-white pb-safe pt-1.5 shadow-[0_-2px_10px_rgba(19,34,29,0.04)] lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 items-center px-2">
          {navItems.map((item) => (
            <MobileNavLink key={item.name} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>
    </>
  );
}

function MobileNavLink({
  item,
  pathname,
}: {
  item: { name: string; icon: typeof Home; href: string };
  pathname: string;
}) {
  const Icon = item.icon;
  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={
        "relative mx-1 flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition active:scale-95 " +
        (isActive ? "bg-[#E6F2EE] text-[#1E5646]" : "text-[#4A5D56] hover:bg-[#F7F9F8]")
      }
    >
      <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
      <span className="text-[10px] font-bold">{item.name}</span>
      {isActive && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#1E5646]" />}
    </Link>
  );
}
