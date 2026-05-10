"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
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
  ShieldCheck
} from "lucide-react";
import { CATEGORIES } from "@/config/categories";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, isProfileComplete, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img 
            src="/exown-logo.png" 
            alt="ExOwn Logo" 
            className="h-10 w-auto" 
          />
        </Link>

        {/* Massive Centralized Search */}
        <div className="hidden lg:flex flex-1 max-w-3xl">
          <div className="relative w-full flex items-center bg-gray-50 rounded-2xl border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all shadow-inner">
            {/* Category Dropdown */}
            <div className="relative shrink-0">
              <button 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-2 px-6 py-3 border-r border-gray-200 hover:bg-gray-100 transition-colors rounded-l-2xl text-sm font-bold text-gray-600"
              >
                <span className="truncate max-w-[120px]">{selectedCategory}</span>
                <ChevronDown size={16} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 grid grid-cols-1 overflow-hidden z-50"
                  >
                    <button 
                      onClick={() => { setSelectedCategory("All Categories"); setIsCategoryOpen(false); }}
                      className="px-6 py-2.5 text-left text-sm font-bold hover:bg-primary/5 hover:text-primary transition-colors border-l-4 border-transparent hover:border-primary"
                    >
                      All Categories
                    </button>
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.name); setIsCategoryOpen(false); }}
                        className="px-6 py-2.5 text-left text-sm font-bold hover:bg-primary/5 hover:text-primary transition-colors border-l-4 border-transparent hover:border-primary"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input 
              type="text" 
              placeholder="Search laptops, books, rooms, cycles..." 
              className="flex-1 bg-transparent px-6 py-3 outline-none text-sm font-medium"
            />
            
            <button className="mr-2 p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
              <Search size={20} />
            </button>
          </div>
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
              <span className="absolute top-2 right-2 w-5 h-5 bg-green-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">2</span>
              <span className="hidden lg:block ml-2 text-xs font-bold">Compare</span>
            </Link>

            <Link 
              href="/messages" 
              className="p-3 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all relative group"
              title="Messages"
            >
              <MessageSquare size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
              <span className="hidden lg:block ml-2 text-xs font-bold">Messages</span>
            </Link>
          </div>

          {/* Sell Button - Prominent Blue */}
          <Link 
            href={!user ? "/login?redirect=/sell" : !isProfileComplete ? "/complete-profile" : "/sell"} 
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
                className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all border border-transparent focus:border-primary/20"
              >
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">Account</p>
                  <p className="text-sm font-bold text-gray-700 max-w-[80px] truncate">{user.displayName || "Student"}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 z-50 overflow-hidden"
                  >
                    {/* Profile Header */}
                    <div className="p-4 bg-gray-50 rounded-2xl mb-2 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0">
                        <img src={user.photoURL || ""} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800">{user.displayName}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[160px]">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link href="/dashboard" className="flex items-center gap-3 p-3 text-sm font-bold text-gray-600 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                        <LayoutDashboard size={20} />
                        My Listings
                      </Link>
                      <Link href="/notifications" className="flex items-center justify-between p-3 text-sm font-bold text-gray-600 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <Bell size={20} />
                          Notifications
                        </div>
                        <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full">3</span>
                      </Link>
                      <Link href="/profile" className="flex items-center gap-3 p-3 text-sm font-bold text-gray-600 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                        <ShieldCheck size={20} />
                        Profile Verification
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 p-3 text-sm font-bold text-gray-600 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                        <Settings size={20} />
                        Settings
                      </Link>
                      <div className="h-px bg-gray-100 my-2" />
                      <button 
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 p-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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
          <button className="lg:hidden p-3 text-gray-600 hover:bg-gray-100 rounded-2xl">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}
