"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { 
  Search, 
  Bell, 
  User, 
  Plus, 
  LogOut, 
  LayoutDashboard, 
  MapPin, 
  Heart, 
  Package, 
  Settings, 
  ChevronDown,
  GitCompare,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/context/NotificationContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("LPU Campus");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search for"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full glass-surface transition-colors duration-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo & Location */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center">
            <img 
              src="/exown-logo.png" 
              alt="ExOwn Logo" 
              className="h-8 w-auto" 
            />
          </Link>

          {/* Location Picker */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all cursor-pointer group relative">
            <MapPin size={14} className="text-gray-400 group-hover:text-primary" />
            <select 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer appearance-none pr-4"
            >
              <option value="LPU Campus">📍 LPU</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chandigarh">CHD</option>
            </select>
            <ChevronDown size={10} className="text-gray-400 pointer-events-none absolute right-1.5" />
          </div>
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <form onSubmit={handleSearch} className="relative w-full flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-transparent focus-within:border-primary/20 focus-within:bg-white dark:focus-within:bg-gray-950 transition-all group">
            <Search size={16} className="absolute left-3 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for books, cycles, laptops..." 
              className="w-full bg-transparent pl-9 pr-16 py-2 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
            <div className="absolute right-1.5 flex items-center gap-1.5">
              <span className="hidden lg:block text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">⌘K</span>
              <button type="submit" className="p-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors">
                <Search size={14} />
              </button>
            </div>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 text-gray-500 hover:text-primary rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            aria-label="Toggle search"
          >
            <Search size={20} />
          </button>

          {/* Wishlist Link */}
          {user && (
            <Link 
              href="/profile?tab=favorites" 
              className="p-2 text-gray-500 hover:text-red-500 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-950/25 transition-colors relative"
              title="Wishlist"
            >
              <Heart size={20} />
            </Link>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="p-2 text-gray-500 hover:text-primary rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors relative"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-950" />
              )}
            </button>
            
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 z-50"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</h3>
                    <Link href="/notifications" onClick={() => setIsNotificationsOpen(false)} className="text-xs font-semibold text-primary hover:underline">View all</Link>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {unreadCount === 0 ? (
                      <div className="py-6 text-center text-gray-400 text-xs font-medium">No new notifications</div>
                    ) : (
                      <div className="py-4 text-center text-gray-400 text-xs font-medium">You have {unreadCount} unread alerts</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sell CTA Button (Desktop) */}
          <Link 
            href={!user ? "/login?redirect=/sell" : "/sell"} 
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-xs transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus size={16} />
            <span>Sell</span>
          </Link>

          {/* Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-1 p-1 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent focus:border-primary/10"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} className="text-gray-400" />
                  )}
                </div>
                <ChevronDown size={12} className={`text-gray-400 mx-1 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-2.5 z-50 overflow-hidden"
                  >
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-2 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User size={18} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate leading-none mb-0.5">{user.displayName}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-none">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors">
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                      <Link href="/profile?tab=listings" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors">
                        <Package size={16} />
                        My Listings
                      </Link>
                      <Link href="/chat" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors">
                        <MessageSquare size={16} />
                        Messages
                      </Link>
                      <Link href="/compare" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors">
                        <GitCompare size={16} />
                        Compare Hub
                      </Link>
                      <Link href="/requests" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors">
                        <AlertCircle size={16} />
                        Request Board
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors">
                        <Settings size={16} />
                        Settings
                      </Link>
                      
                      {mounted && (
                        <div className="px-3 py-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                          <div className="mb-2">Theme Mode</div>
                          <div className="grid grid-cols-3 gap-1 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-100 dark:border-gray-800 normal-case">
                            <button
                              type="button"
                              onClick={() => setTheme("light")}
                              className={`py-1 px-1.5 rounded-lg text-center text-xs transition-all cursor-pointer ${
                                theme === "light" 
                                  ? "bg-white dark:bg-gray-800 text-primary shadow-sm font-bold" 
                                  : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 font-semibold"
                              }`}
                            >
                              Light
                            </button>
                            <button
                              type="button"
                              onClick={() => setTheme("dark")}
                              className={`py-1 px-1.5 rounded-lg text-center text-xs transition-all cursor-pointer ${
                                theme === "dark" 
                                  ? "bg-white dark:bg-gray-800 text-primary shadow-sm font-bold" 
                                  : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 font-semibold"
                              }`}
                            >
                              Dark
                            </button>
                            <button
                              type="button"
                              onClick={() => setTheme("system")}
                              className={`py-1 px-1.5 rounded-lg text-center text-xs transition-all cursor-pointer ${
                                theme === "system" 
                                  ? "bg-white dark:bg-gray-800 text-primary shadow-sm font-bold" 
                                  : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 font-semibold"
                              }`}
                            >
                              System
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="h-px bg-gray-100 dark:bg-gray-800 my-1.5" />
                      <button 
                        onClick={() => logout()}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-xs transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay Bar */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950"
          >
            <div className="p-3">
              <form onSubmit={handleSearch} className="relative w-full flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-transparent focus-within:border-primary/25">
                <Search size={16} className="absolute left-3 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for books, cycles, laptops..." 
                  className="w-full bg-transparent pl-9 pr-12 py-2.5 outline-none text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
                <button type="submit" className="absolute right-1.5 px-2.5 py-1.5 bg-primary text-white text-[10px] font-semibold rounded-lg hover:bg-primary-dark">
                  Go
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
