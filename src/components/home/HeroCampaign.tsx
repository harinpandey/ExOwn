"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bike,
  BookOpen,
  Laptop,
  Package,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";

export default function HeroCampaign() {
  const { user } = useAuth();
  const { campusObj } = useLocation();

  return (
    <section className="container mx-auto px-4 pb-5 pt-5 sm:pb-7 sm:pt-6">
      <div className="grid gap-3 lg:grid-cols-[1.45fr_0.9fr]">
        {/* Main campaign banner */}
        <Link
          href="/search"
          className="group relative isolate flex min-h-[260px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#182b68] via-[#254fc0] to-[#287bc7] p-6 text-white shadow-lg shadow-blue-950/10 transition hover:shadow-xl sm:min-h-[300px] sm:p-8 lg:min-h-[330px]"
        >
          <div className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 left-1/4 -z-10 h-80 w-80 rounded-full bg-violet-300/15 blur-3xl" />
          <div className="relative z-10 flex max-w-[62%] flex-col items-start justify-center sm:max-w-[58%]">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-50 backdrop-blur">
              <Users size={12} />
              {campusObj.shortName} · Student marketplace
            </span>
            <h1 className="text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-[42px]">
              Good finds.
              <br />
              <span className="text-cyan-200">Better campus</span>
              <br />
              deals.
            </h1>
            <p className="mt-3 max-w-md text-xs font-medium leading-relaxed text-blue-100 sm:text-sm">
              Buy, sell, rent and exchange the things student life needs — right within your campus community.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-black text-blue-950 shadow-md transition group-hover:gap-3">
              Explore marketplace
              <ArrowRight size={15} />
            </span>
          </div>

          {/* Decorative product composition */}
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] items-center justify-center sm:flex">
            <div className="absolute right-[8%] top-[16%] h-52 w-52 rounded-full border border-white/20 bg-white/[0.06]" />
            <div className="absolute right-[14%] top-[21%] h-40 w-40 rounded-full border border-white/20" />
            <div className="absolute right-[18%] top-[27%] flex h-32 w-32 rotate-6 items-center justify-center rounded-[28px] border border-white/25 bg-white/15 shadow-2xl backdrop-blur-md transition duration-500 group-hover:rotate-3 group-hover:scale-105">
              <Laptop size={72} strokeWidth={1.25} className="text-white drop-shadow-lg" />
            </div>
            <div className="absolute right-[52%] top-[22%] flex h-14 w-14 -rotate-12 items-center justify-center rounded-2xl border border-white/25 bg-cyan-300/20 shadow-xl backdrop-blur-md">
              <Smartphone size={27} className="text-cyan-100" />
            </div>
            <div className="absolute bottom-[18%] right-[5%] flex h-16 w-16 rotate-12 items-center justify-center rounded-2xl border border-white/25 bg-indigo-300/20 shadow-xl backdrop-blur-md">
              <BookOpen size={30} className="text-indigo-100" />
            </div>
            <div className="absolute bottom-[14%] right-[48%] rounded-xl border border-white/20 bg-[#10245b]/80 px-3 py-2 text-[10px] font-extrabold text-white shadow-xl backdrop-blur-md">
              Student-to-student deals
            </div>
          </div>
        </Link>

        {/* Supporting campaign banners */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Link
            href="/search?listingType=RENT"
            className="group relative flex min-h-[148px] items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff1c7] via-[#ffd98a] to-[#ffbd62] p-5 text-[#4a2b05] shadow-sm transition hover:shadow-md sm:min-h-0 lg:min-h-0"
          >
            <div className="relative z-10 max-w-[68%]">
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-800/70">Need it for a term?</span>
              <h2 className="mt-1 text-xl font-black leading-tight sm:text-lg xl:text-xl">Rent it. Return it.</h2>
              <p className="mt-1.5 text-[11px] font-semibold text-amber-950/70">Cycles, coolers and hostel essentials.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-black">Browse rentals <ArrowRight size={13} /></span>
            </div>
            <div className="absolute -right-4 -bottom-7 flex h-36 w-36 items-center justify-center rounded-full bg-white/35 transition-transform duration-300 group-hover:scale-110">
              <Bike size={76} strokeWidth={1.3} className="text-amber-800/75" />
            </div>
            <RefreshCw size={18} className="absolute right-5 top-5 text-amber-900/45" />
          </Link>

          <Link
            href={!user ? "/login?redirect=/sell" : "/sell"}
            className="group relative flex min-h-[148px] items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#d7f7e8] via-[#a9eacb] to-[#6fd7a5] p-5 text-[#073d2b] shadow-sm transition hover:shadow-md sm:min-h-0 lg:min-h-0"
          >
            <div className="relative z-10 max-w-[68%]">
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-900/65">Make room. Make money.</span>
              <h2 className="mt-1 text-xl font-black leading-tight sm:text-lg xl:text-xl">Pass it on.</h2>
              <p className="mt-1.5 text-[11px] font-semibold text-emerald-950/70">List things you no longer need.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-black">Start selling <ArrowRight size={13} /></span>
            </div>
            <div className="absolute -right-4 -bottom-7 flex h-36 w-36 items-center justify-center rounded-full bg-white/35 transition-transform duration-300 group-hover:scale-110">
              <Package size={76} strokeWidth={1.3} className="text-emerald-900/75" />
            </div>
            <ShieldCheck size={18} className="absolute right-5 top-5 text-emerald-900/45" />
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 px-1 text-[10px] font-bold text-gray-500 dark:text-white/50 sm:text-[11px]">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Campus-focused community</span>
        <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-primary" /> Student-to-student exchange</span>
        <span className="inline-flex items-center gap-1.5"><RefreshCw size={14} className="text-blue-500" /> Buy, sell, rent and exchange</span>
      </div>
    </section>
  );
}
