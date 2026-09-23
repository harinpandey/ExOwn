"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import {
  Bell,
  Building2,
  ChevronDown,
  GitCompare,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Moon,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sun,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotifications } from "@/context/NotificationContext";

const primaryLinks = [
  { label: "Marketplace", href: "/search" },
  { label: "Rent", href: "/search?listingType=RENT" },
  { label: "Housing", href: "/search?category=properties" },
  { label: "Services", href: "/search?listingType=SERVICE" },
];

const secondaryLinks = [
  { label: "Buy", href: "/search?listingType=SELL" },
  { label: "Sell", href: "/sell" },
  { label: "Rent", href: "/search?listingType=RENT" },
  { label: "Exchange", href: "/search?exchange=true" },
  { label: "Housing", href: "/search?category=properties" },
  { label: "Roommates", href: "/requests" },
  { label: "Services", href: "/search?listingType=SERVICE" },
];

import { useLocation } from "@/context/LocationContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { selectedCampus, setSelectedCampus } = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const loginPopupRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (loginPopupRef.current && !loginPopupRef.current.contains(e.target as Node)) {
        setIsLoginPopupOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      router.push(`/search?campus=${encodeURIComponent(selectedCampus)}`);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}&campus=${encodeURIComponent(selectedCampus)}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 text-gray-900 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[#07090d]/90 dark:text-white">
      <div className="container mx-auto flex min-h-16 items-center gap-3 px-4 py-3">
        {/* Brand Logo + Campus Selector */}
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-2" aria-label="ExOwn home">
            <img src="/exown-logo.png" alt="ExOwn" className="h-8 w-auto" />
          </Link>

          <label className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80 sm:flex">
            <MapPin size={15} className="text-primary" />
            <span className="sr-only">Campus</span>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="max-w-44 cursor-pointer appearance-none bg-transparent text-xs font-bold outline-none text-gray-900 dark:text-white"
            >
              <option value="Lovely Professional University" className="bg-white text-gray-900 dark:bg-[#10141b] dark:text-white">LPU Campus</option>
              <option value="Delhi University" className="bg-white text-gray-900 dark:bg-[#10141b] dark:text-white">Delhi University</option>
              <option value="Chandigarh University" className="bg-white text-gray-900 dark:bg-[#10141b] dark:text-white">Chandigarh University</option>
              <option value="VIT Vellore" className="bg-white text-gray-900 dark:bg-[#10141b] dark:text-white">VIT Vellore</option>
            </select>
            <ChevronDown size={12} className="text-gray-400 dark:text-white/45" />
          </label>
        </div>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-5 px-2 text-xs font-black uppercase tracking-wider text-gray-600 dark:text-white/55 lg:flex">
          {primaryLinks.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-primary dark:hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Global Search Input */}
        <form onSubmit={handleSearch} className="relative hidden flex-1 md:block">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/45" />
          <input
            data-global-search="true"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laptops, books, cycles, rooms..."
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-100 pl-11 pr-24 text-sm font-semibold text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/35 dark:focus:border-primary/60 dark:focus:bg-white/[0.09]"
          />
          <button type="submit" className="absolute right-1.5 top-1.5 h-8 rounded-lg bg-primary px-4 text-xs font-black text-white transition hover:bg-primary-dark active:scale-95">
            Search
          </button>
        </form>

        {/* Actions & Dropdowns */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setShowMobileSearch((value) => !value)}
            className="tap-target rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-primary dark:text-white/65 dark:hover:bg-white/[0.06] md:hidden"
            aria-label="Open search"
          >
            <Search size={20} />
          </button>

          {/* Theme Switcher Toggle */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="tap-target rounded-xl border border-gray-200 bg-gray-100 p-2 text-gray-700 transition hover:border-primary hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80 dark:hover:border-primary"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
          )}

          {/* Housing Link */}
          <Link
            href="/housing"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100 hover:text-primary dark:text-white/65 dark:hover:bg-white/[0.06] dark:hover:text-primary md:flex"
          >
            <Building2 size={17} />
            <span className="hidden lg:inline">Housing</span>
          </Link>

          {/* Roommates Link */}
          <Link
            href="/roommates"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100 hover:text-primary dark:text-white/65 dark:hover:bg-white/[0.06] dark:hover:text-primary md:flex"
          >
            <Users size={17} />
            <span className="hidden lg:inline">Roommates</span>
          </Link>

          {/* Chat Link */}
          {user && (
            <Link
              href="/chat"
              className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100 hover:text-primary dark:text-white/65 dark:hover:bg-white/[0.06] dark:hover:text-primary sm:flex"
            >
              <MessageSquare size={18} />
              <span className="hidden xl:inline">Chat</span>
            </Link>
          )}

          {/* Notifications Dropdown Popup */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen((v) => !v);
                setIsProfileOpen(false);
              }}
              className="tap-target relative rounded-xl text-gray-700 transition hover:bg-gray-100 hover:text-primary dark:text-white/65 dark:hover:bg-white/[0.06]"
              aria-label="Open notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-[#07090d]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#10141b]"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <Link href="/notifications" onClick={() => setIsNotificationsOpen(false)} className="text-xs font-bold text-primary hover:underline">
                      View all &rarr;
                    </Link>
                  </div>

                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="rounded-xl bg-gray-50 px-4 py-6 text-center text-xs font-semibold text-gray-500 dark:bg-white/[0.03] dark:text-white/50">
                        You&apos;re all caught up! No notifications.
                      </div>
                    ) : (
                      notifications.slice(0, 4).map((n: any) => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`group relative cursor-pointer rounded-xl p-3 text-xs transition ${
                            n.isRead || n.read
                              ? "bg-gray-50 text-gray-600 dark:bg-white/[0.02] dark:text-white/60"
                              : "border border-primary/20 bg-blue-50/60 text-gray-900 font-bold dark:bg-primary/10 dark:text-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold line-clamp-1">{n.title}</p>
                            {!n.isRead && !n.read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] font-normal text-gray-500 line-clamp-2 dark:text-white/50">
                            {n.content || n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="mt-3 border-t border-gray-100 pt-2 dark:border-white/10 flex justify-between items-center text-[11px]">
                      <button
                        type="button"
                        onClick={() => markAllRead()}
                        className="font-bold text-gray-500 hover:text-primary dark:text-white/60"
                      >
                        Mark all as read
                      </button>
                      <Link
                        href="/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="font-bold text-primary hover:underline"
                      >
                        Manage notifications
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sell Button */}
          <Link
            href={!user ? "/login?redirect=/sell" : "/sell"}
            className="hidden items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:bg-primary-dark active:scale-95 sm:flex"
          >
            <Plus size={16} />
            Sell
          </Link>

          {/* Logged In Profile Menu OR Flipkart-Style Login Popup */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen((v) => !v);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 p-1.5 transition hover:border-primary dark:border-white/10 dark:bg-white/[0.04]"
                aria-label="Open profile menu"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gray-200 dark:bg-white/10">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User size={17} className="text-gray-600 dark:text-white/55" />
                  )}
                </span>
                <ChevronDown size={13} className={`mr-1 text-gray-500 transition dark:text-white/45 ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 top-full mt-3 w-72 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-[#10141b]"
                  >
                    <div className="mb-2 flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-white/[0.04]">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-200 dark:bg-white/10">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User size={18} className="text-gray-500 dark:text-white/50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-gray-900 dark:text-white">{user.displayName || "ExOwn member"}</p>
                        <p className="truncate text-[11px] font-semibold text-gray-500 dark:text-white/45">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <ProfileLink href="/profile" icon={LayoutDashboard} label="Dashboard" />
                      <ProfileLink href="/profile?tab=listings" icon={Package} label="My Listings" />
                      <ProfileLink href="/profile?tab=favorites" icon={Heart} label="Saved Items" />
                      <ProfileLink href="/chat" icon={MessageSquare} label="Messages" />
                      <ProfileLink href="/compare" icon={GitCompare} label="Compare Hub" />
                      <ProfileLink href="/settings" icon={Settings} label="Settings" />

                      <div className="my-1.5 h-px bg-gray-100 dark:bg-white/10" />
                      <button
                        type="button"
                        onClick={() => logout()}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
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
            /* Flipkart-Style Login Hover / Click Dropdown Popup */
            <div className="relative" ref={loginPopupRef}>
              <button
                type="button"
                onClick={() => setIsLoginPopupOpen((v) => !v)}
                onMouseEnter={() => setIsLoginPopupOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-md transition hover:bg-blue-700 active:scale-95"
              >
                <User size={15} />
                Login
                <ChevronDown size={13} className={`transition ${isLoginPopupOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isLoginPopupOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    onMouseLeave={() => setIsLoginPopupOpen(false)}
                    className="absolute right-0 top-full mt-3 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#10141b]"
                  >
                    <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/10">
                      <span className="text-xs font-bold text-gray-600 dark:text-white/60">New to ExOwn?</span>
                      <Link
                        href="/login"
                        onClick={() => setIsLoginPopupOpen(false)}
                        className="flex items-center gap-1 text-xs font-black text-blue-600 hover:underline dark:text-primary"
                      >
                        <UserPlus size={14} /> Sign Up
                      </Link>
                    </div>

                    <div className="space-y-1">
                      <ProfileLink href="/login" icon={User} label="My Profile" />
                      <ProfileLink href="/login" icon={ShoppingBag} label="Orders & Requests" />
                      <ProfileLink href="/login" icon={Heart} label="Wishlist" />
                      <ProfileLink href="/compare" icon={GitCompare} label="Compare Hub" />
                      <ProfileLink href="/safety" icon={ShieldCheck} label="Campus Safety Guidelines" />
                      <ProfileLink href="/faq" icon={HelpCircle} label="24x7 Help Desk" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Bar */}
      <div className="hidden border-t border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#07090d]/70 md:block">
        <nav className="container mx-auto flex items-center gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
          {secondaryLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-200 hover:text-primary dark:text-white/55 dark:hover:bg-white/[0.06] dark:hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Search Dropdown */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-200 bg-white dark:border-white/10 dark:bg-[#07090d] md:hidden"
          >
            <form onSubmit={handleSearch} className="container mx-auto flex gap-2 px-4 py-3">
              <input
                data-global-search="true"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search laptops, books, cycles, rooms..."
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/35"
              />
              <button type="submit" className="rounded-xl bg-primary px-4 text-xs font-black text-white transition hover:bg-primary-dark">
                Go
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function ProfileLink({ href, icon: Icon, label }: { href: string; icon: ElementType; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100 hover:text-primary dark:text-white/70 dark:hover:bg-white/[0.06] dark:hover:text-primary"
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
