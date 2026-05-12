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
  Menu, 
  Settings, 
  MessageSquare, 
  GitCompare, 
  ChevronDown,
  Plus,
  LogOut,
  LayoutDashboard,
  Moon,
  Sun,
  AlertCircle,
  MapPin,
  Heart,
  Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompare } from "@/context/CompareContext";
import { useNotifications } from "@/context/NotificationContext";

export default function Navbar() {
  const { user, isProfileComplete, logout } = useAuth();
  const { items } = useCompare();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const selectedCategoryId = "";
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("LPU Campus");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery && !selectedCategoryId) return;
    
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategoryId) params.set("category", selectedCategoryId);
    
    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
        {/* Logo & Location */}
        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          <Link href="/" className="flex items-center">
            <img 
              src="/exown-logo.png" 
              alt="ExOwn Logo" 
              className="h-8 md:h-10 w-auto" 
            />
          </Link>

          {/* Location Picker */}
          <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all cursor-pointer group relative">
            <MapPin size={16} className="text-gray-400 group-hover:text-primary" />
            <select 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer appearance-none pr-4"
            >
              <option value="LPU Campus">📍 LPU</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chandigarh">CHD</option>
            </select>
            <ChevronDown size={12} className="text-gray-400 pointer-events-none absolute right-2" />
          </div>
        </div>


        <div className="hidden lg:flex flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative w-full flex items-center bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus-within:border-primary/40 focus-within:bg-white dark:focus-within:bg-gray-950 transition-all shadow-inner group">
            <Search size={20} className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search laptops, books, rooms, cycles..." 
              className="w-full bg-transparent pl-12 pr-4 py-3 outline-none text-sm font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
            <div className="absolute right-2 flex items-center gap-2">
              <span className="hidden xl:block text-[10px] font-black text-gray-300 dark:text-gray-600 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700">⌘ K</span>
              <button type="submit" className="p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Global Icons & Actions */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link 
              href="/compare" 
              className="p-3 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all relative group"
              title="Compare Products"
            >
              <GitCompare size={22} />
              {items.length > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-green-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                  {items.length}
                </span>
              )}
              <span className="hidden lg:block ml-2 text-xs font-bold">Compare</span>
            </Link>

            <Link 
              href="/requests" 
              className="p-3 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all relative group"
              title="Request Board"
            >
              <AlertCircle size={22} />
              <span className="hidden lg:block ml-2 text-xs font-bold">Requests</span>
            </Link>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-3 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all relative group"
                title="Notifications"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
                <span className="hidden lg:block ml-2 text-xs font-bold">Alerts</span>
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="font-black text-lg">Notifications</h3>
                      <Link href="/notifications" onClick={() => setIsNotificationsOpen(false)} className="text-xs font-bold text-primary hover:underline">View All</Link>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {unreadCount === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-sm font-medium">No new notifications</div>
                      ) : (
                        <div className="py-4 text-center text-gray-400 text-sm font-medium">You have {unreadCount} unread alerts</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link 
              href="/chat" 
              className="p-3 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all relative group"
              title="Messages"
            >
              <MessageSquare size={22} />
              <span className="hidden lg:block ml-2 text-xs font-bold">Messages</span>
            </Link>
          </div>

          {/* Sell Button - Prominent Blue */}
          <Link 
            href={!user ? "/login?redirect=/sell" : "/sell"} 
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
            Sell Now
          </Link>

          {/* Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all border border-transparent focus:border-primary/20"
              >
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-950 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">Account</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200 max-w-[80px] truncate">{user.displayName || "Student"}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-3 z-50 overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-2 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 overflow-hidden shrink-0">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 dark:text-gray-100">{user.displayName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link href="/profile" className="flex items-center gap-3 p-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                        <LayoutDashboard size={20} />
                        Dashboard
                      </Link>
                      <Link href="/profile?tab=listings" className="flex items-center gap-3 p-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                        <Package size={20} />
                        My Listings
                      </Link>
                      <Link href="/profile?tab=favorites" className="flex items-center gap-3 p-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                        <Heart size={20} />
                        Wishlist
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 p-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                        <Settings size={20} />
                        Settings
                      </Link>
                      
                      {/* Theme Toggle inside Account */}
                      {mounted && (
                        <button 
                          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                          className="w-full flex items-center justify-between p-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                          </div>
                          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === "dark" ? 'bg-primary' : 'bg-gray-200'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${theme === "dark" ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                        </button>
                      )}

                      <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
                      <button 
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 p-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                      >
                        <LogOut size={20} />
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
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all active:scale-[0.98]"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 md:p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {isMobileMenuOpen ? <Plus className="rotate-45" size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-gray-950 z-[70] lg:hidden shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <img src="/exown-logo.png" alt="ExOwn" className="h-8" />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <Plus className="rotate-45" size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {user && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary/20">
                        <img src={user.photoURL || "/exown-icon.png"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-sm">{user.displayName}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{isProfileComplete ? "Verified Student" : "Complete Profile"}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2">
                    <MobileMenuLink href="/compare" icon={GitCompare} label="Compare Hub" count={items.length} onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileMenuLink href="/requests" icon={AlertCircle} label="Request Board" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileMenuLink href="/chat" icon={MessageSquare} label="My Messages" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileMenuLink href="/notifications" icon={Bell} label="Notifications" count={unreadCount} onClick={() => setIsMobileMenuOpen(false)} />
                  </div>

                  <div className="h-px bg-gray-100 dark:bg-gray-800" />

                  <div className="grid grid-cols-1 gap-2">
                    <MobileMenuLink href="/profile" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileMenuLink href="/settings" icon={Settings} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
                    {user && (
                      <button 
                        onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                        className="flex items-center gap-4 p-4 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-colors"
                      >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>

                  {!user && (
                    <Link 
                      href="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full py-4 bg-primary text-white text-center rounded-2xl font-black text-sm shadow-xl shadow-primary/20"
                    >
                      Sign In to ExOwn
                    </Link>
                  )}

                  <div className="pt-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Exchange. Own. Repeat.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileMenuLink({ href, icon: Icon, label, count, onClick }: { href: string, icon: any, label: string, count?: number, onClick: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl active:scale-[0.98] transition-all"
    >
      <div className="flex items-center gap-4">
        <Icon size={20} className="text-gray-400" />
        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}
