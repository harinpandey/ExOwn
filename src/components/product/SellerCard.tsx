"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Calendar,
  User,
  MessageSquare,
  ChevronDown,
  Star,
  Package,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface SellerCardProps {
  seller: any;
  productId: string;
}

export default function SellerCard({ seller, productId }: SellerCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!seller) return null;

  const isVerified =
    seller.isVerified === true ||
    seller.verificationLevel === "CAMPUS" ||
    seller.verificationLevel === "VERIFIED" ||
    seller.verificationLevel === "BUSINESS";

  const profile = seller.profile;
  const deals = Math.max(0, Number(profile?.successfulDeals || 0));
  const rating = Number(profile?.rating || 0);
  const memberSince = seller.createdAt
    ? format(new Date(seller.createdAt), "MMM yyyy")
    : null;
  const collegeName = profile?.collegeName;
  const course = profile?.course;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#10141b]">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:p-5 dark:hover:bg-zinc-900/70"
      >
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
          {seller.image ? (
            <img src={seller.image} alt={seller.name || "Seller"} className="h-full w-full object-cover" />
          ) : (
            <User size={22} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
            Seller experience &amp; reviews
          </span>
          <span className="mt-0.5 block truncate text-sm font-bold text-gray-900 dark:text-white">
            {seller.name || "Campus Member"}
          </span>
          <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
            {deals > 0 ? `${deals} completed ${deals === 1 ? "deal" : "deals"}` : "New seller"} 
            {memberSince ? ` · Member since ${memberSince}` : ""}
          </span>
        </div>

        {isVerified && (
          <span title="Verified seller" className="hidden shrink-0 rounded-full bg-emerald-50 p-2 text-emerald-700 sm:inline-flex dark:bg-emerald-950/40 dark:text-emerald-400">
            <ShieldCheck size={17} />
          </span>
        )}
        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-4 sm:px-5 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <ShieldCheck size={12} /> Verified seller
              </span>
            )}
            {deals === 0 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:bg-zinc-800 dark:text-gray-300">
                New seller
              </span>
            )}
          </div>

          {(collegeName || course) && (
            <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">
              {[collegeName, course].filter(Boolean).join(" · ")}
            </p>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-zinc-800/60">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Package size={13} /> Successful deals
              </div>
              <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{deals}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-zinc-800/60">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Star size={13} /> Seller rating
              </div>
              <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
                {rating > 0 ? rating.toFixed(1) : "No ratings yet"}
              </p>
            </div>
            {Number(profile?.successRate) > 0 && (
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-zinc-800/60">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <CheckCircle2 size={13} /> Success rate
                </div>
                <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
                  {Math.round(Number(profile.successRate))}%
                </p>
              </div>
            )}
            {Number(profile?.avgResponseTime) > 0 && (
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-zinc-800/60">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Clock3 size={13} /> Avg. response
                </div>
                <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
                  {profile.avgResponseTime} min
                </p>
              </div>
            )}
          </div>

          {profile?.bio && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">About seller</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">{profile.bio}</p>
            </div>
          )}

          {memberSince && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Calendar size={13} /> Member since {memberSince}
            </p>
          )}

          <Link
            href={"/chat/" + seller.id + "?product=" + productId}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            <MessageSquare size={15} /> Message seller
          </Link>
          <Link
            href={"/profile/" + seller.id}
            className="mt-2 block text-center text-xs font-semibold text-primary hover:underline"
          >
            View full profile
          </Link>
        </div>
      )}
    </section>
  );
}
