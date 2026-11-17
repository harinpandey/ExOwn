"use client";

import { useState } from "react";
import { ShieldCheck, Calendar, User, ExternalLink, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { revealSellerPhoneNumber } from "@/actions/product";

interface SellerCardProps {
  seller: any;
  productId: string;
}

export default function SellerCard({ seller, productId }: SellerCardProps) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  if (!seller) return null;

  const isVerified =
    seller.isVerified === true ||
    seller.verificationLevel === "CAMPUS" ||
    seller.verificationLevel === "VERIFIED" ||
    seller.verificationLevel === "BUSINESS";

  const memberSince = seller.createdAt
    ? format(new Date(seller.createdAt), "MMM yyyy")
    : null;

  const collegeName = seller.profile?.collegeName;
  const course = seller.profile?.course;

  const handleRevealPhone = async () => {
    setPhoneLoading(true);
    setPhoneError("");
    try {
      const result = await revealSellerPhoneNumber(productId);
      if ("phone" in result && typeof result.phone === "string") {
        setPhoneNumber(result.phone);
      } else if ("error" in result) {
        setPhoneError(result.error || "Unable to load the seller's contact number.");
      } else {
        setPhoneError("Unable to load the seller's contact number.");
      }
    } catch {
      setPhoneError("Unable to load the seller's contact number.");
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10141b]">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Seller Information
        </h3>
        {isVerified && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <ShieldCheck size={12} />
            Verified Seller
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
          {seller.image ? (
            <img src={seller.image} alt={seller.name || "Seller"} className="h-full w-full object-cover" />
          ) : (
            <User size={24} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-base font-bold text-gray-900 dark:text-white">
            {seller.name || "Campus Member"}
          </h4>

          {(collegeName || course) && (
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {[collegeName, course].filter(Boolean).join(" • ")}
            </p>
          )}

          {memberSince && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <Calendar size={11} />
              <span>Member since {memberSince}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        {phoneNumber ? (
          <a
            href={"tel:" + phoneNumber}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            <Phone size={15} />
            Call {phoneNumber}
          </a>
        ) : (
          <button
            type="button"
            onClick={handleRevealPhone}
            disabled={phoneLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <Phone size={15} />
            {phoneLoading ? "Loading contact..." : "Show phone number"}
          </button>
        )}
        {phoneError && (
          <p className="mt-2 text-center text-xs text-rose-600 dark:text-rose-400">
            {phoneError}
            {phoneError.includes("Sign in") && (
              <>
                {" "}
                <Link href={"/login?redirect=/product/" + productId} className="font-bold underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        )}
        <p className="mt-2 text-center text-[10px] text-gray-400 dark:text-gray-500">
          Contact details are revealed only to signed-in ExOwn members.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Link
          href={"/chat/" + seller.id + "?product=" + productId}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-dark"
        >
          <MessageSquare size={14} />
          Message
        </Link>
        <Link
          href={"/profile/" + seller.id}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          <ExternalLink size={14} />
          Profile
        </Link>
      </div>
    </div>
  );
}
