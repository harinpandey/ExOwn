"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Heart,
  ImageIcon,
  MapPin,
  ShieldCheck,
  Tag,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMoments } from "@/context/MomentsContext";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  location: string;
  createdAt: Date;
  isUrgent?: boolean;
  isVerified?: boolean;
  listingType?: "SELL" | "RENT" | "SERVICE";
  condition?: string;
  categoryId: string;
  subcategoryId?: string;
  sellerId?: string;
  isWishlisted?: boolean;
  onWishlistToggle?: (productId: string, added: boolean) => void;
  seller?: {
    name?: string | null;
    image?: string | null;
    isVerified?: boolean | null;
    verificationLevel?: string | null;
    isTrustedSeller?: boolean | null;
    trustScore?: number | null;
    rating?: number | null;
    successfulDeals?: number | null;
  } | null;
}

export default function ProductCard({
  id,
  title,
  price,
  image,
  location,
  createdAt,
  isUrgent,
  isVerified,
  listingType,
  condition,
  categoryId: _categoryId,
  subcategoryId: _subcategoryId,
  sellerId,
  seller,
  isWishlisted = false,
  onWishlistToggle,
}: ProductCardProps) {
  const { user } = useAuth();
  const { trackWishlistAdd } = useMoments();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [isMutating, setIsMutating] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    if (user && !isWishlisted) {
      import("@/actions/wishlist").then(({ isInWishlist }) => {
        isInWishlist(user.uid, id).then(setWishlisted);
      });
    }
  }, [user, id, isWishlisted]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      import("react-hot-toast").then(({ toast }) => toast.error("Please login to save items"));
      return;
    }

    const previousState = wishlisted;
    setWishlisted(!wishlisted);
    try {
      const { toggleWishlist } = await import("@/actions/wishlist");
      const res = await toggleWishlist(user.uid, id);
      if (res.success) {
        import("react-hot-toast").then(({ toast }) => toast.success(res.added ? "Saved" : "Removed"));
        if (res.added) {
          trackWishlistAdd(id, title, image);
        }
        onWishlistToggle?.(id, !!res.added);
      } else {
        setWishlisted(previousState);
        import("react-hot-toast").then(({ toast }) => toast.error(res.error || "Failed to update wishlist"));
      }
    } catch {
      setWishlisted(previousState);
      import("react-hot-toast").then(({ toast }) => toast.error("Failed to update wishlist"));
    }
  };

  const handleMarkSold = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || isMutating) return;
    if (confirm("Mark this item as sold?")) {
      setIsMutating(true);
      const { markProductAsSold } = await import("@/actions/product");
      const res = await markProductAsSold(id, user.uid);
      if (res.success) {
        import("react-hot-toast").then(({ toast }) => toast.success("Marked as sold"));
        window.location.reload();
      } else {
        import("react-hot-toast").then(({ toast }) => toast.error(res.error || "Failed to mark as sold"));
        setIsMutating(false);
      }
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || isMutating) return;
    if (confirm("Archive this listing? It will no longer be visible to others.")) {
      setIsMutating(true);
      const { archiveProduct } = await import("@/actions/product");
      const res = await archiveProduct(id, user.uid);
      if (res.success) {
        import("react-hot-toast").then(({ toast }) => toast.success("Listing archived"));
        window.location.reload();
      } else {
        import("react-hot-toast").then(({ toast }) => toast.error(res.error || "Failed to archive"));
        setIsMutating(false);
      }
    }
  };

  const singleBadge = getSingleBadge({
    listingType,
    isUrgent,
    seller,
    isVerified,
  });

  const formattedCondition = formatCondition(condition);
  const formattedLocation = location?.trim() || "Campus";
  const formattedPrice = typeof price === "number" ? price.toLocaleString("en-IN") : "0";
  const displayImage = image?.trim();

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-[#10141b]">
      {/* 1. Media Section with Consistent Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-zinc-900">
        {displayImage && !imgError ? (
          <>
            {imgLoading && (
              <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-zinc-800" />
            )}
            <img
              src={displayImage}
              alt={title}
              loading="lazy"
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgLoading(false);
                setImgError(true);
              }}
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                imgLoading ? "opacity-0" : "opacity-100"
              }`}
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gray-100 text-gray-400 dark:bg-zinc-900 dark:text-zinc-600">
            <ImageIcon size={28} strokeWidth={1.5} />
            <span className="text-[11px] font-medium tracking-wide">No image available</span>
          </div>
        )}

        {/* At Most ONE Meaningful Badge (Top-Left) */}
        {singleBadge && (
          <div className="absolute left-2.5 top-2.5 z-20">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm ${singleBadge.className}`}
            >
              {singleBadge.icon}
              {singleBadge.label}
            </span>
          </div>
        )}

        {/* Wishlist Button (Top-Right) */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? "Remove from saved" : "Save listing"}
          aria-pressed={wishlisted}
          className="absolute right-2.5 top-2.5 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-red-500 active:scale-95 dark:bg-black/60 dark:text-gray-200 dark:hover:text-red-400"
        >
          <Heart
            size={16}
            fill={wishlisted ? "currentColor" : "none"}
            className={wishlisted ? "text-red-500" : "text-gray-700 dark:text-gray-200"}
          />
        </button>

        {/* Listing Owner Action Bar */}
        {user && sellerId === user.uid && (
          <div className="absolute bottom-2.5 right-2.5 z-40 flex items-center gap-1">
            <Link
              href={`/product/edit/${id}`}
              className="flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-gray-800 shadow transition hover:bg-white hover:text-primary dark:bg-zinc-800 dark:text-zinc-200"
            >
              <Tag size={11} />
              Edit
            </Link>
            <button
              type="button"
              onClick={handleMarkSold}
              className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow transition hover:bg-emerald-700"
            >
              <CheckCircle2 size={11} />
              Sold
            </button>
            <button
              type="button"
              onClick={handleArchive}
              className="flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-[10px] font-bold text-white shadow transition hover:bg-rose-700"
            >
              <Trash2 size={11} />
              Archive
            </button>
          </div>
        )}
      </div>

      {/* 2. Card Content & Metadata */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Product Title */}
        <h3
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-gray-900 group-hover:text-primary dark:text-gray-100"
          title={title}
        >
          {title}
        </h3>

        {/* Price & Rent indicator */}
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              ₹{formattedPrice}
            </span>
            {listingType === "RENT" && (
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                /day
              </span>
            )}
          </div>

          {/* Condition Tag */}
          {formattedCondition && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:bg-white/10 dark:text-gray-300">
              {formattedCondition}
            </span>
          )}
        </div>

        {/* Location & Time Footer */}
        <div className="mt-auto pt-3 border-t border-gray-100 text-[11px] text-gray-500 dark:border-white/10 dark:text-gray-400">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1">
              <MapPin size={12} className="shrink-0 text-gray-400 dark:text-gray-500" />
              <span className="truncate">{formattedLocation}</span>
            </div>
            <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Link Overlay */}
      <Link href={`/product/${id}`} className="absolute inset-0 z-10" tabIndex={-1} aria-hidden>
        <span className="sr-only">View details for {title}</span>
      </Link>
    </article>
  );
}

/**
 * Ensures AT MOST ONE meaningful badge is displayed per card,
 * prioritized by real transaction model, urgent listing need, or genuine seller verification.
 */
function getSingleBadge({
  listingType,
  isUrgent,
  seller,
  isVerified,
}: {
  listingType?: "SELL" | "RENT" | "SERVICE";
  isUrgent?: boolean;
  seller?: ProductCardProps["seller"];
  isVerified?: boolean;
}): { label: string; icon?: React.ReactNode; className: string } | null {
  // 1. Transaction Type (Rent or Service differentiate from standard sale)
  if (listingType === "RENT") {
    return {
      label: "For Rent",
      className: "bg-blue-600/90 text-white",
    };
  }
  if (listingType === "SERVICE") {
    return {
      label: "Service",
      className: "bg-purple-600/90 text-white",
    };
  }

  // 2. Urgent / Moving Out flag
  if (isUrgent) {
    return {
      label: "Moving Out",
      className: "bg-amber-600/90 text-white",
    };
  }

  // 3. Genuine Seller Verification (Only when backed by real verification data)
  const isRealVerified =
    seller?.isVerified === true ||
    isVerified === true ||
    seller?.verificationLevel === "CAMPUS" ||
    seller?.verificationLevel === "VERIFIED";

  if (isRealVerified) {
    return {
      label: "Verified",
      icon: <ShieldCheck size={11} className="shrink-0" />,
      className: "bg-emerald-600/90 text-white",
    };
  }

  return null;
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
