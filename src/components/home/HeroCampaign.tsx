"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Package,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";

export default function HeroCampaign() {
  const { user } = useAuth();
  const { campusObj } = useLocation();

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 pt-6 sm:pb-8 sm:pt-8">
      <div className="grid gap-4 lg:grid-cols-[1.55fr_0.95fr]">
        {/* Main hero: one spacious message, with no extra promo panel inside it. */}
        <div className="flex min-h-[320px] flex-col items-start justify-center overflow-hidden rounded-3xl border border-[#17645F] bg-[#17645F] p-6 shadow-[0_2px_8px_rgba(19,34,29,0.04)] dark:border-[#2A4136] dark:bg-[#14231C] sm:min-h-[356px] sm:p-9 lg:p-11">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F3EEE8]/25 bg-[#124F4B] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#F3EEE8] dark:border-[#2A4136] dark:bg-[#101D17] dark:text-[#B4C5BC]">
            <Users size={13} className="text-[#FFB19D] dark:text-[#FFB19D]" />
            {campusObj.shortName} · Student marketplace
          </span>

          <h1 className="mt-6 max-w-2xl text-[2.4rem] font-extrabold leading-[1.04] tracking-[-0.045em] text-[#F3EEE8] dark:text-[#E8F0EB] sm:text-5xl lg:text-[56px]">
            Good finds.
            <br />
            <span className="text-[#FFB19D] dark:text-[#FFB19D]">Better campus deals.</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[#F3EEE8]/85 dark:text-[#B4C5BC] sm:text-base sm:leading-8">
            Buy, sell, rent and exchange the things student life needs — right within your campus community.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/search"
              className="marketplace-button action-coral min-h-12 rounded-xl px-5 py-3 text-sm font-bold"
            >
              Explore marketplace <ArrowRight size={16} />
            </Link>
            <Link
              href={!user ? "/login?redirect=/sell" : "/sell"}
              className="marketplace-button-outline border-[#F3EEE8] bg-transparent text-[#F3EEE8] hover:bg-[#F3EEE8]/10 min-h-12 rounded-xl px-5 py-3 text-sm font-bold"
            >
              Start selling
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#F3EEE8]/25 pt-4 text-[11px] font-medium text-[#F3EEE8]/80 dark:border-[#2A4136] dark:text-[#B4C5BC] sm:text-xs">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#FFB19D] dark:text-[#FFB19D]" />
              Campus-focused community
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} className="text-[#17645F] dark:text-[#91CDB0]" />
              Student-to-student exchange
            </span>
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw size={14} className="text-[#17645F] dark:text-[#91CDB0]" />
              Buy, sell, rent and exchange
            </span>
          </div>
        </div>

        {/* Two simple service shortcuts stay beside the hero. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Link
            href="/search?listingType=RENT"
            className="group flex min-h-[154px] items-center justify-between gap-4 rounded-3xl border border-[#D2C6BB] bg-[#E6DACE] p-5 shadow-[0_2px_8px_rgba(19,34,29,0.035)] transition hover:border-[#C8D6D0] hover:shadow-[0_4px_12px_rgba(19,34,29,0.055)] dark:border-[#2A4136] dark:bg-[#14231C] dark:hover:border-[#3C5D4D] lg:min-h-0"
          >
            <div className="relative z-10">
              <span className="inline-flex rounded-full bg-[#E5EFEC] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#17645F] dark:bg-[#20362B] dark:text-[#91CDB0]">Rent</span>
              <h2 className="mt-3 text-lg font-bold text-[#183B38] dark:text-[#E8F0EB]">Rent it. Return it.</h2>
              <p className="mt-1 text-xs leading-5 text-[#526663] dark:text-[#B4C5BC]">Cycles, coolers and hostel essentials.</p>
              <span className="marketplace-button-outline mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold">
                Browse rentals <ArrowRight size={13} />
              </span>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F3EEE8] text-[#17645F] dark:bg-[#20362B] dark:text-[#91CDB0]">
              <Bike size={31} strokeWidth={1.6} />
            </div>
          </Link>

          <Link
            href={!user ? "/login?redirect=/sell" : "/sell"}
            className="group flex min-h-[154px] items-center justify-between gap-4 rounded-3xl border border-[#E4DCD3] bg-[#EFE5DA] p-5 shadow-[0_2px_8px_rgba(19,34,29,0.035)] transition hover:border-[#C8D6D0] hover:shadow-[0_4px_12px_rgba(19,34,29,0.055)] dark:border-[#2A4136] dark:bg-[#14231C] dark:hover:border-[#3C5D4D] lg:min-h-0"
          >
            <div className="relative z-10">
              <span className="inline-flex rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#92400E] dark:bg-[#493A1D] dark:text-[#F2D28C]">Make room</span>
              <h2 className="mt-3 text-lg font-bold text-[#183B38] dark:text-[#E8F0EB]">Pass it on.</h2>
              <p className="mt-1 text-xs leading-5 text-[#526663] dark:text-[#B4C5BC]">Give useful things a second campus life.</p>
              <span className="marketplace-button-outline mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold">
                Start selling <ArrowRight size={13} />
              </span>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E5EFEC] text-[#17645F] dark:bg-[#20362B] dark:text-[#91CDB0]">
              <Package size={31} strokeWidth={1.6} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
