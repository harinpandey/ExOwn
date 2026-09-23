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

  const sellHref = !user ? "/login?redirect=/sell" : !isProfileComplete ? "/complete-profile" : "/sell";
  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Search", icon: Search, href: "/search" },
    { name: "Chat", icon: MessageSquare, href: "/chat" },
    { name: "Profile", icon: User, href: "/profile" },
  ];

  const createActions = [
    { label: "Sell Item", href: sellHref, icon: PackagePlus },
    { label: "Rent Item", href: `${sellHref}${sellHref.includes("?") ? "&" : "?"}intent=rent`, icon: KeyRound },
    { label: "Exchange", href: `${sellHref}${sellHref.includes("?") ? "&" : "?"}intent=exchange`, icon: RefreshCw },
    { label: "Find Student Housing", href: "/housing", icon: House },
    { label: "Roommate Finder", href: "/roommates", icon: User },
    { label: "Offer Service", href: `${sellHref}${sellHref.includes("?") ? "&" : "?"}intent=service`, icon: BriefcaseBusiness },
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed bottom-20 left-3 right-3 z-50 rounded-2xl border border-white/10 bg-[#10141b] p-3 shadow-2xl lg:hidden"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-black text-white">Create on ExOwn</p>
                  <p className="text-xs font-semibold text-white/45">Choose what you want to post.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="tap-target rounded-lg text-white/55 hover:bg-white/[0.06] hover:text-white"
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
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:border-primary/40 hover:bg-white/[0.07]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
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

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#07090d]/92 pb-safe pt-1.5 shadow-2xl backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
          {navItems.slice(0, 2).map((item) => (
            <MobileNavLink key={item.name} item={item} pathname={pathname} />
          ))}

          <button
            type="button"
            onClick={() => setIsCreateOpen((value) => !value)}
            className="mx-auto -mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-green-950/40 ring-4 ring-[#07090d] transition active:scale-95"
            aria-label="Create listing"
          >
            <Plus size={28} className={`transition ${isCreateOpen ? "rotate-45" : ""}`} />
          </button>

          {navItems.slice(2).map((item) => (
            <MobileNavLink key={item.name} item={item} pathname={pathname} />
          ))}
        </div>
      </div>
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
      className="relative flex min-h-[50px] flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-white/45 transition active:scale-95"
    >
      <Icon size={19} className={isActive ? "text-primary" : "text-white/45"} />
      <span className={`text-[10px] font-black ${isActive ? "text-primary" : "text-white/45"}`}>{item.name}</span>
      {isActive && <span className="absolute bottom-0 h-1 w-1 rounded-full bg-primary" />}
    </Link>
  );
}
