"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { user, isProfileComplete } = useAuth();

  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Search", icon: Search, href: "/search" },
    { name: "Sell", icon: PlusCircle, href: !user ? "/login?redirect=/sell" : !isProfileComplete ? "/complete-profile" : "/sell", highlight: true },
    { name: "Chat", icon: MessageSquare, href: "/chat" },
    { name: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 px-4 pb-safe pt-2">

      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link 
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-10 mb-2"
              >
                <div className="w-16 h-16 bg-primary text-white rounded-[1.75rem] flex items-center justify-center shadow-2xl shadow-primary/40 border-[4px] border-white dark:border-gray-950 transition-all hover:scale-110 active:scale-90 group touch-manipulation">
                  <div className="relative">
                    <PlusCircle size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 animate-pulse" />
                  </div>
                </div>
                <span className={`text-[10px] font-black mt-1 uppercase tracking-tighter ${isActive ? "text-primary" : "text-gray-400"}`}>
                  {item.name}
                </span>
              </Link>

            );
          }

          return (
            <Link 
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center p-2 min-w-[64px] min-h-[48px] active:scale-90 transition-transform touch-manipulation"
            >
              <Icon 
                size={22} 
                className={`transition-colors ${isActive ? "text-primary" : "text-gray-400"}`} 
              />
              <span className={`text-[9px] font-black mt-1 uppercase tracking-tighter ${isActive ? "text-primary" : "text-gray-400"}`}>
                {item.name}
              </span>
            </Link>

          );
        })}
      </div>
    </div>
  );
}
