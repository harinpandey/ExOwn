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
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";

const campusCategories = [
  { label: "Books & notes", icon: BookOpen },
  { label: "Electronics", icon: Laptop },
  { label: "Cycles & rides", icon: Bike },
  { label: "Hostel essentials", icon: Package },
];

export default function HeroCampaign() {
  const { user } = useAuth();
  const { campusObj } = useLocation();

  return (
    <section className="mx-auto max-w-7xl px-4 pb-7 pt-6 sm:pb-9 sm:pt-8">
      <div className="grid gap-4 lg:grid-cols-[1.55fr_0.95fr]">
        <div className="grid min-h-[320px] overflow-hidden rounded-3xl border border-[#E2E8E5] bg-white shadow-[0_2px_8px_rgba(19,34,29,0.04)] sm:grid-cols-[1.15fr_0.85fr] lg:min-h-[356px]">
          <div className="flex flex-col items-start justify-center p-6 sm:p-8 lg:p-10">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E2E8E5] bg-[#F7F9F8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A5D56]">
              <Users size={13} className="text-[#1E5646]" />
              {campusObj.shortName} · Student marketplace
            </span>
            <h1 className="max-w-xl text-[2.15rem] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#13221D] sm:text-4xl lg:text-[46px]">
              Good finds.
              <br />
              <span className="text-[#1E5646]">Better campus deals.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#4A5D56] sm:text-base">
              Buy, sell, rent and exchange the things student life needs — right within your campus community.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/search"
                className="marketplace-button min-h-11 rounded-xl px-5 py-3 text-sm font-bold"
              >
                Explore marketplace <ArrowRight size={16} />
              </Link>
              <Link
                href={!user ? "/login?redirect=/sell" : "/sell"}
                className="marketplace-button-outline min-h-11 rounded-xl px-5 py-3 text-sm font-bold"
              >
                Start selling
              </Link>
            </div>
          </div>

          <div className="flex items-center bg-[#F7F9F8] p-5 sm:p-6 lg:p-7">
            <div className="w-full rounded-2xl border border-[#E2E8E5] bg-white p-4 shadow-[0_1px_5px_rgba(19,34,29,0.035)] sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5D56]">Around your campus</p>
                  <h2 className="mt-1 text-base font-bold text-[#13221D]">Find what you need</h2>
                </div>
                <span className="rounded-full bg-[#E6F2EE] px-2.5 py-1 text-[10px] font-bold text-[#1E5646]">Student picks</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {campusCategories.map(({ label, icon: Icon }) => (
                  <div key={label} className="flex min-h-[88px] flex-col justify-between rounded-xl border border-[#E2E8E5] bg-white p-3">
                    <Icon size={21} strokeWidth={1.8} className="text-[#1E5646]" />
                    <span className="text-xs font-semibold text-[#13221D]">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-[#E2E8E5] pt-3 text-[11px] font-medium text-[#4A5D56]">
                <ShieldCheck size={14} className="text-[#1E5646]" />
                Built around student-to-student exchange
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Link
            href="/search?listingType=RENT"
            className="group flex min-h-[154px] items-center justify-between gap-4 rounded-3xl border border-[#E2E8E5] bg-white p-5 shadow-[0_2px_8px_rgba(19,34,29,0.035)] transition hover:border-[#C8D6D0] hover:shadow-[0_4px_12px_rgba(19,34,29,0.055)] lg:min-h-0"
          >
            <div className="relative z-10">
              <span className="inline-flex rounded-full bg-[#E6F2EE] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1E5646]">Rent</span>
              <h2 className="mt-3 text-lg font-bold text-[#13221D]">Rent it. Return it.</h2>
              <p className="mt-1 text-xs leading-5 text-[#4A5D56]">Cycles, coolers and hostel essentials.</p>
              <span className="marketplace-button-outline mt-4 min-h-9 rounded-lg px-3 py-2 text-xs font-bold">
                Browse rentals <ArrowRight size={13} />
              </span>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F7F9F8] text-[#1E5646]">
              <Bike size={31} strokeWidth={1.6} />
            </div>
          </Link>

          <Link
            href={!user ? "/login?redirect=/sell" : "/sell"}
            className="group flex min-h-[154px] items-center justify-between gap-4 rounded-3xl border border-[#E2E8E5] bg-white p-5 shadow-[0_2px_8px_rgba(19,34,29,0.035)] transition hover:border-[#C8D6D0] hover:shadow-[0_4px_12px_rgba(19,34,29,0.055)] lg:min-h-0"
          >
            <div className="relative z-10">
              <span className="inline-flex rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#92400E]">Make room</span>
              <h2 className="mt-3 text-lg font-bold text-[#13221D]">Pass it on.</h2>
              <p className="mt-1 text-xs leading-5 text-[#4A5D56]">Give useful things a second campus life.</p>
              <span className="marketplace-button-outline mt-4 min-h-9 rounded-lg px-3 py-2 text-xs font-bold">
                Start selling <ArrowRight size={13} />
              </span>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E6F2EE] text-[#1E5646]">
              <Package size={31} strokeWidth={1.6} />
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 px-1 text-[11px] font-medium text-[#4A5D56] sm:text-xs">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#1E5646]" /> Campus-focused community</span>
        <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-[#1E5646]" /> Student-to-student exchange</span>
        <span className="inline-flex items-center gap-1.5"><RefreshCw size={14} className="text-[#1E5646]" /> Buy, sell, rent and exchange</span>
      </div>
    </section>
  );
}
