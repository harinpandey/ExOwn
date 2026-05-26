"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HeroBanner() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-905 via-indigo-955 to-gray-955 text-white py-12 md:py-20 px-6 md:px-12 shadow-xl border border-gray-800">
      {/* Background patterns & Ambient Mesh Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(0,0,0,0))]" />
      
      {/* Floating Ambient Glow Orbs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/8 filter blur-[80px] pointer-events-none animate-[floatGlow_10s_ease-in-out_infinite]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/6 filter blur-[95px] pointer-events-none animate-[floatGlow_12s_ease-in-out_infinite_1.5s]" />
      
      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Trust pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 border border-white/10 mb-6 animate-pulse">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>100% Student-Verified Campus Marketplace</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
          Buy, Sell & Exchange <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-emerald-400">
            on Your Campus
          </span>
        </h1>
        
        <p className="text-sm md:text-base text-gray-300 max-w-lg mb-8 font-medium">
          The trusted peer-to-peer student marketplace. Trade second-hand goods, rent cycles, or request services safely within your community.
        </p>

        {/* Large Centered Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-xl relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1.5 focus-within:border-white/40 focus-within:bg-white/15 transition-all shadow-lg mb-6 group">
          <Search className="text-gray-300 ml-3" size={20} />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for today?"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 px-3 py-3 text-sm md:text-base"
          />
          <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-colors shadow-md active-press">
            Search
          </button>
        </form>
 
        {/* Quick Links / CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link 
            href={!user ? "/login?redirect=/sell" : "/sell"}
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs md:text-sm transition-all shadow-md shadow-emerald-950/20 active-press"
          >
            <Sparkles size={16} />
            Start Selling
          </Link>
          <Link 
            href="/search"
            className="inline-flex items-center gap-1.5 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs md:text-sm border border-white/10 transition-colors active-press"
          >
            Explore Listings
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
