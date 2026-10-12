"use client";

import { useState } from "react";
import {
  MessageSquare,
  MapPin,
  ShieldCheck,
  BarChart2,
  Calendar,
  RefreshCw,
  Heart,
  Tag,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCompare } from "@/context/CompareContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import RentNowModal from "./RentNowModal";
import RequestQuoteModal from "./RequestQuoteModal";
import ExchangeOfferModal from "./ExchangeOfferModal";

interface PricingCardProps {
  product: any;
}

export default function PricingCard({ product }: PricingCardProps) {
  const { user, isProfileComplete } = useAuth();
  const { toggleCompare, isInCompare } = useCompare();
  const router = useRouter();

  const [offerMode, setOfferMode] = useState(false);
  const [offerAmount, setOfferAmount] = useState(
    product?.price != null ? product.price.toString() : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isOwner = user && user.uid === product?.sellerId;
  const isAvailable = product?.status === "LIVE" && (product?.inventory ?? 1) > 0;
  const isSold =
    product?.status === "SOLD" ||
    (product?.inventory === 0 && product?.status !== "ARCHIVED");
  const isArchived = product?.status === "ARCHIVED";

  const isRental = product?.listingType === "RENT";
  const isService = product?.listingType === "SERVICE";
  const isExchange =
    product?.listingType === "EXCHANGE" ||
    (!isRental && !isService && product?.isExchangeAllowed);
  const isExchangeOnly = product?.listingType === "EXCHANGE";

  const seller = product?.seller;
  const isVerifiedSeller =
    seller?.isVerified === true ||
    seller?.verificationLevel === "CAMPUS" ||
    seller?.verificationLevel === "VERIFIED" ||
    seller?.verificationLevel === "BUSINESS";

  const handleWishlist = async () => {
    if (!user) {
      toast.error("Please login to save this item");
      return;
    }
    const previous = isWishlisted;
    setIsWishlisted(!previous);
    try {
      const { toggleWishlist } = await import("@/actions/wishlist");
      const res = await toggleWishlist(user.uid, product.id);
      if (res.success) {
        toast.success(res.added ? "Saved to wishlist" : "Removed from wishlist");
      } else {
        setIsWishlisted(previous);
        toast.error(res.error || "Failed to update wishlist");
      }
    } catch {
      setIsWishlisted(previous);
      toast.error("Failed to update wishlist");
    }
  };

  const handleMakeOffer = async () => {
    if (!user) {
      router.push(`/login?redirect=/product/${product.id}`);
      return;
    }

    if (!isAvailable) {
      toast.error("This listing is no longer available.");
      return;
    }

    const amount = Number(offerAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid offer amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { createOffer } = await import("@/actions/offer");
      const offerResult = await createOffer({
        productId: product.id,
        buyerId: user.uid,
        price: amount,
        message: `I'm interested in your "${product.title}". My offer is ₹${amount.toLocaleString(
          "en-IN"
        )}${isRental ? "/day" : ""}.`,
      });

      if (!offerResult.success) {
        toast.error(offerResult.error || "Failed to submit offer.");
        return;
      }

      const { sendMessage } = await import("@/actions/chat");
      const message = `Hi, I'm interested in your "${product.title}". My offer is ₹${amount.toLocaleString(
        "en-IN"
      )}${isRental ? "/day" : ""}.`;
      await sendMessage(user.uid, seller?.id, message);
      toast.success("Offer submitted to seller.");
      setOfferMode(false);
      router.push(`/chat/${seller?.id}`);
    } catch (err) {
      console.error("Failed to send offer:", err);
      toast.error("Failed to send offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedPrice =
    typeof product?.price === "number" ? product.price.toLocaleString("en-IN") : "0";
  const formattedCondition = formatCondition(product?.condition);
  const locationLabel =
    product?.pickupLocation?.trim() ||
    product?.campus?.name ||
    "Campus location not provided";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#10141b]">
      {/* 1. Header Badges: At most one type badge + optional availability */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {isRental && (
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              For Rent
            </span>
          )}
          {isService && (
            <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              Service
            </span>
          )}
          {isExchangeOnly && (
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              Exchange Only
            </span>
          )}
          {!isRental && !isService && !isExchangeOnly && (
            <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-gray-700 dark:bg-zinc-800 dark:text-zinc-200">
              For Sale
            </span>
          )}

          {isVerifiedSeller && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShieldCheck size={13} />
              Verified Seller
            </span>
          )}
        </div>

        {/* Availability State */}
        {!isAvailable && (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle size={13} />
            {isSold ? "Sold" : isArchived ? "Archived" : "Unavailable"}
          </span>
        )}
      </div>

      {/* 2. Title */}
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
        {product.title}
      </h1>

      {/* 3. Pricing */}
      <div className="mt-4 flex items-baseline gap-2">
        {!isExchangeOnly ? (
          <>
            <span className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              ₹{formattedPrice}
            </span>
            {isRental && (
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                /day
              </span>
            )}
            {isService && (
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                base price
              </span>
            )}
          </>
        ) : (
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            Open for Exchange
          </span>
        )}
      </div>

      {/* 4. Condition & Negotiation Highlights */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {formattedCondition && (
          <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300">
            Condition: {formattedCondition}
          </span>
        )}
        {product.isNegotiable && isAvailable && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Tag size={12} />
            Price Negotiable
          </span>
        )}
        {product.isExchangeAllowed && !isExchangeOnly && (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <RefreshCw size={12} />
            Exchange Considered
          </span>
        )}
      </div>

      {/* 5. Location Row */}
      <div className="mt-5 border-t border-gray-100 pt-4 dark:border-white/10">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
          <MapPin size={15} className="shrink-0 text-gray-400 dark:text-gray-500" />
          <span className="truncate">{locationLabel}</span>
        </div>
      </div>

      {/* 6. Action CTAs */}
      <div className="mt-6 space-y-3">
        {isOwner ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center dark:border-white/10 dark:bg-zinc-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              You are the seller of this listing.
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <Link
                href={`/product/edit/${product.id}`}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-dark"
              >
                Edit Listing
              </Link>
            </div>
          </div>
        ) : !isAvailable ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center dark:border-rose-950/50 dark:bg-rose-950/20">
            <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
              This listing is {isSold ? "sold" : "no longer available"}.
            </p>
            <Link
              href={`/search?category=${product.category?.slug || ""}`}
              className="mt-3 inline-block rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900"
            >
              Browse Similar Listings
            </Link>
          </div>
        ) : !offerMode ? (
          <>
            {/* Primary Action Button */}
            {isService ? (
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.99]"
              >
                <MessageSquare size={18} />
                Request Quote
              </button>
            ) : isRental ? (
              <button
                type="button"
                onClick={() => setIsRentModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
              >
                <Calendar size={18} />
                Rent Now
              </button>
            ) : (
              <Link
                href={
                  !user
                    ? `/login?redirect=/product/${product.id}`
                    : !isProfileComplete
                    ? "/complete-profile"
                    : `/chat/${seller?.id}?product=${product.id}`
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.99]"
              >
                <MessageSquare size={18} />
                Message Seller
              </Link>
            )}

            {/* Secondary Action: Make an Offer (Sale listings) */}
            {!isService && !isRental && !isExchangeOnly && (
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    router.push(`/login?redirect=/product/${product.id}`);
                    return;
                  }
                  if (!isProfileComplete) {
                    router.push("/complete-profile");
                    return;
                  }
                  setOfferMode(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-800 transition hover:bg-gray-50 active:scale-[0.99] dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Make an Offer
              </button>
            )}

            {/* Secondary Action: Propose Exchange */}
            {isExchange && (
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    router.push(`/login?redirect=/product/${product.id}`);
                    return;
                  }
                  setIsExchangeModalOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100/60 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-300"
              >
                <RefreshCw size={16} />
                Propose Exchange
              </button>
            )}

            {/* Save / Wishlist and Compare Row */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleWishlist}
                aria-label="Save this listing"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <Heart
                  size={15}
                  fill={isWishlisted ? "currentColor" : "none"}
                  className={isWishlisted ? "text-red-500" : ""}
                />
                {isWishlisted ? "Saved" : "Save"}
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleCompare({
                    id: product.id,
                    title: product.title,
                    categoryId: product.categoryId,
                    subcategoryId: product.subcategoryId || undefined,
                  })
                }
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition ${
                  isInCompare(product.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
                }`}
              >
                <BarChart2 size={15} />
                {isInCompare(product.id) ? "Comparing" : "Compare"}
              </button>
            </div>
          </>
        ) : (
          /* Inline Make Offer Form */
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-zinc-800/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Your Offer Amount (₹)
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3.5 top-2.5 font-bold text-gray-400">₹</span>
              <input
                type="number"
                min="1"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-3 text-lg font-bold text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                placeholder="0"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleMakeOffer}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-primary py-2.5 text-xs font-bold text-white transition hover:bg-primary-dark disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Submit Offer"}
              </button>
              <button
                type="button"
                onClick={() => setOfferMode(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Existing Functional Modals */}
      <RentNowModal
        product={product}
        isOpen={isRentModalOpen}
        onClose={() => setIsRentModalOpen(false)}
      />
      <RequestQuoteModal
        product={product}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
      <ExchangeOfferModal
        product={product}
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
      />
    </div>
  );
}

function formatCondition(condition?: string): string | null {
  if (!condition) return null;
  switch (condition.toUpperCase()) {
    case "NEW":
      return "Brand New";
    case "LIKE_NEW":
      return "Like New";
    case "GOOD":
      return "Good";
    case "FAIR":
      return "Fair";
    case "POOR":
      return "Poor";
    default:
      return condition.replace("_", " ");
  }
}
