"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { user, isProfileComplete } = useAuth();

  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Search", icon: Search, href: "/search" },
    { name: "Sell", icon: PlusSquare, href: !user ? "/login?redirect=/sell" : !isProfileComplete ? "/complete-profile" : "/sell" },
    { name: "Chat", icon: MessageSquare, href: "/chat" },
    { name: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-900 pb-safe pt-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] min-h-[44px] active:scale-95 transition-all touch-manipulation relative group"
            >
              <Icon 
                size={18} 
                className={`transition-colors duration-200 ${isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`} 
              />
              <span className={`text-[9px] font-bold mt-1 tracking-tight transition-colors duration-200 ${isActive ? "text-primary" : "text-gray-500 dark:text-gray-500"}`}>
                {item.name}
              </span>
              
              {isActive && (
                <span className="absolute bottom-0.5 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
