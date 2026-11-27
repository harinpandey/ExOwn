"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { isCurrentUserAdmin } from "@/actions/admin";
import {
  Bell,
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
  Ticket,
  Sun,
  User,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotifications } from "@/context/NotificationContext";
import ExperienceSwitcher from "@/components/layout/ExperienceSwitcher";

const secondaryLinks = [
  { label: "Marketplace", href: "/search" },
  { label: "Buy", href: "/search?listingType=SELL" },
  { label: "Rent", href: "/search?listingType=RENT" },
  { label: "Exchange", href: "/search?exchange=true" },
  { label: "Housing & Roommates", href: "/campus-living" },
  { label: "Services", href: "/search?listingType=SERVICE" },
];

import { useLocation } from "@/context/LocationContext";
import { CAMPUS_DIRECTORY } from "@/config/campuses";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { selectedCampus, setSelectedCampus, campusObj } = useLocation();
  const { theme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeListingType, setActiveListingType] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const loginPopupRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const currentUserId = user?.uid;

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    const syncSearchContext = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("q") || "");
      setActiveListingType(params.get("listingType") || "");
    };
    syncSearchContext();
    const handleExperienceChange = (event: Event) => {
      const nextType = (event as CustomEvent<string>).detail;
      setActiveListingType(nextType || "");
    };
    window.addEventListener("popstate", syncSearchContext);
    window.addEventListener("exown:listing-type-change", handleExperienceChange);
    return () => {
      window.removeEventListener("popstate", syncSearchContext);
      window.removeEventListener("exown:listing-type-change", handleExperienceChange);
    };
  }, [pathname]);

  useEffect(() => {
    let active = true;
    setIsAdmin(false);
    if (currentUserId) {
      isCurrentUserAdmin()
        .then((allowed) => { if (active) setIsAdmin(allowed); })
        .catch(() => { if (active) setIsAdmin(false); });
    }
    return () => { active = false; };
  }, [currentUserId]);

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

  const isLpuNews = pathname === "/lpu-news" || pathname.startsWith("/lpu-news/");
  const isRentExperience = pathname === "/rent" || (pathname === "/search" && activeListingType === "RENT");
  const isTicketExperience = pathname === "/travel" || pathname.startsWith("/travel/");
  const isCampusLiving = pathname === "/campus-living" || pathname.startsWith("/campus-living/");
  const isHousingExperience = pathname === "/housing" || pathname.startsWith("/housing/");
  const isRoommatesExperience = pathname === "/roommates" || pathname.startsWith("/roommates/");
  const isLivingExperience = isCampusLiving || isHousingExperience || isRoommatesExperience;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (isTicketExperience) {
      router.push(trimmed ? `/travel/search?q=${encodeURIComponent(trimmed)}` : "/travel/search");
      return;
    }
    if (isRentExperience) {
      const query = trimmed ? `&q=${encodeURIComponent(trimmed)}` : "";
      router.push(`/search?listingType=RENT&campus=${encodeURIComponent(selectedCampus)}${query}`);
      return;
    }
    if (isLpuNews) {
      router.push(trimmed ? `/lpu-news?q=${encodeURIComponent(trimmed)}` : "/lpu-news");
      return;
    }
    if (!trimmed) {
      router.push(`/search?campus=${encodeURIComponent(selectedCampus)}`);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}&campus=${encodeURIComponent(selectedCampus)}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E4DCD3] bg-[#EFE5DA] text-[#183B38]">
      <div className="container mx-auto px-4">
        {/* Brand, service switcher and campus selector share one row */}
        <div className="flex min-w-0 items-center gap-2 border-b border-[#E4DCD3] py-2.5 sm:gap-3 lg:gap-5">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="ExOwn home">
            <img src="/exown-logo.png" alt="ExOwn" className="h-9 w-auto sm:h-10" />
          </Link>

          <ExperienceSwitcher />

          <label className="relative ml-auto flex shrink-0 max-w-[34%] cursor-pointer items-center gap-1.5 rounded-xl border border-[#17645F] bg-[#17645F] px-2.5 py-2 text-left text-white transition hover:bg-[#124F4B] sm:max-w-[25%] sm:gap-2.5 sm:px-3">
            <MapPin size={19} className="shrink-0 text-white" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-white/75">Your campus</span>
              <span className="block max-w-[180px] truncate text-xs font-extrabold text-white sm:max-w-[260px] sm:text-sm">
                {campusObj.shortName}
              </span>
            </span>
            <ChevronDown size={14} className="shrink-0 text-white/80" aria-hidden="true" />
            <select
              aria-label="Select campus"
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            >
              {CAMPUS_DIRECTORY.map((campus) => (
                <option key={campus.id} value={campus.name} className="bg-[#EFE5DA] text-[#183B38]">
                  {campus.shortName}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Single wide global search and essential actions */}
        <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
        {!isLivingExperience && <form onSubmit={handleSearch} className="relative flex min-w-0 w-full flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/45" />
            <input
              data-global-search="true"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isLpuNews ? "Search LPU news, notices, placements, events..." : isTicketExperience ? "Search tickets, routes, dates, events..." : isRentExperience ? "Search rentals: laptops, cycles, furniture..." : "Search anything: products, books, rooms, services..."}
              aria-label="Search ExOwn listings"
              className="h-12 w-full rounded-xl border border-[#E4DCD3] bg-[#EFE5DA] pl-12 pr-28 text-sm font-medium text-[#183B38] outline-none transition placeholder:text-[#82918B] focus:border-[#17645F] focus:ring-2 focus:ring-[#17645F]/10 sm:text-base"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 h-9 rounded-lg bg-[#17645F] px-5 text-xs font-bold text-white transition hover:bg-[#124F4B] active:scale-95">
              Search
            </button>
        </form>}

        {/* Actions & Dropdowns */}
        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:ml-auto sm:gap-2">
          {/* Chat Link */}
          {user && (
            <Link
              href="/chat"
              className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#526663] transition hover:bg-[#E6DACE] hover:text-primary dark:text-white/65 dark:hover:bg-[#EFE5DA]/[0.06] dark:hover:text-primary sm:flex"
            >
              <MessageSquare size={18} />
              <span className="hidden xl:inline">Chat</span>
            </Link>
          )}

          {/* Theme toggle — restored to its original place before notifications. */}
          {themeMounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="theme-toggle-button tap-target rounded-xl border p-2 transition"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={theme === "dark"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {/* Notifications Dropdown Popup */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen((v) => !v);
                setIsProfileOpen(false);
              }}
              className="tap-target relative rounded-xl text-[#526663] transition hover:bg-[#E6DACE] hover:text-primary dark:text-white/65 dark:hover:bg-[#EFE5DA]/[0.06]"
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
                  className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-4 shadow-2xl dark:border-white/10 dark:bg-[#10141b]"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-[#183B38] dark:text-white">Notifications</h3>
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
                      <div className="rounded-xl bg-[#E6DACE] px-4 py-6 text-center text-xs font-semibold text-gray-500 dark:bg-[#EFE5DA]/[0.03] dark:text-white/50">
                        You&apos;re all caught up! No notifications.
                      </div>
                    ) : (
                      notifications.slice(0, 4).map((n: any) => (
                        <Link
                          key={n.id}
                          href={typeof n.link === "string" && n.link.startsWith("/") ? n.link : "/notifications"}
                          onClick={() => {
                            void markRead(n.id);
                            setIsNotificationsOpen(false);
                          }}
                          aria-label={`Open notification: ${n.title}`}
                          className={`group relative block cursor-pointer rounded-xl p-3 text-xs transition ${
                            n.isRead || n.read
                              ? "bg-[#E6DACE] text-gray-600 dark:bg-[#EFE5DA]/[0.02] dark:text-white/60"
                              : "border border-primary/20 bg-blue-50/60 text-[#183B38] font-bold dark:bg-primary/10 dark:text-white"
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
                        </Link>
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

          {/* Context-aware listing action: each experience stays in its own workflow */}
          <Link
            href={
              isTicketExperience
                ? (!user ? "/login?redirect=/travel/list" : "/travel/list")
                : isLpuNews
                  ? (!user ? "/login?redirect=/admin/lpu-news" : "/admin/lpu-news")
                  : isRentExperience
                    ? (!user ? "/login?redirect=/sell?listingType=RENT" : "/sell?listingType=RENT")
                    : isHousingExperience
                      ? (!user ? "/login?redirect=/housing" : "/housing")
                      : isRoommatesExperience
                        ? (!user ? "/login?redirect=/roommates" : "/roommates")
                        : (!user ? "/login?redirect=/sell" : "/sell")
            }
            className="marketplace-button hidden items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold active:scale-95 sm:flex"
          >
            {isTicketExperience ? <Ticket size={16} /> : <Plus size={16} />}
            {isTicketExperience
              ? "List a Ticket"
              : isLpuNews
                ? "List News"
                : isRentExperience
                  ? "Offer for Rent"
                  : isHousingExperience
                    ? "List PG / Room"
                    : isRoommatesExperience
                      ? "List Roomie"
                      : "+ Post Something"}
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
                className="flex items-center gap-1.5 rounded-xl border border-[#E4DCD3] bg-gray-100 p-1.5 transition hover:border-primary dark:border-white/10 dark:bg-[#EFE5DA]/[0.04]"
                aria-label="Open profile menu"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gray-200 dark:bg-[#EFE5DA]/10">
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
                    className="absolute right-0 top-full mt-3 w-72 rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-3 shadow-2xl dark:border-white/10 dark:bg-[#10141b]"
                  >
                    <div className="mb-2 flex items-center gap-3 rounded-xl bg-[#E6DACE] p-3 dark:bg-[#EFE5DA]/[0.04]">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-200 dark:bg-[#EFE5DA]/10">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User size={18} className="text-gray-500 dark:text-white/50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#183B38] dark:text-white">{user.displayName || "ExOwn member"}</p>
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
                      {isAdmin && <ProfileLink href="/admin" icon={ShieldCheck} label="Admin Console" />}

                      <div className="my-1.5 h-px bg-gray-100 dark:bg-[#EFE5DA]/10" />
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
                className="marketplace-button flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold active:scale-95"
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
                    className="absolute right-0 top-full mt-3 w-72 rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-4 shadow-2xl dark:border-white/10 dark:bg-[#10141b]"
                  >
                    <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/10">
                      <span className="text-xs font-bold text-gray-600 dark:text-white/60">New to ExOwn?</span>
                      <Link
                        href="/login"
                        onClick={() => setIsLoginPopupOpen(false)}
                        className="flex items-center gap-1 text-xs font-bold text-[#17645F] hover:underline"
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
      </div>

    </header>
  );
}

function ProfileLink({ href, icon: Icon, label }: { href: string; icon: ElementType; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#526663] transition hover:bg-[#F3EEE8] hover:text-[#17645F]"
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
