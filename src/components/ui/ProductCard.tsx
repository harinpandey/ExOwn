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
  // location: string; // removed public location prop
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
      try {
        const { markProductAsSold } = await import("@/actions/product");
        const res = await markProductAsSold(id, user.uid);
        if (res.success) {
          import("react-hot-toast").then(({ toast }) => toast.success("Marked as sold"));
          window.location.reload();
        } else {
          import("react-hot-toast").then(({ toast }) => toast.error(res.error || "Failed to mark as sold"));
          setIsMutating(false);
        }
      } catch {
        import("react-hot-toast").then(({ toast }) => toast.error("Unable to update this listing. Please try again."));
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
      try {
        const { archiveProduct } = await import("@/actions/product");
        const res = await archiveProduct(id, user.uid);
        if (res.success) {
          import("react-hot-toast").then(({ toast }) => toast.success("Listing archived"));
          window.location.reload();
        } else {
          import("react-hot-toast").then(({ toast }) => toast.error(res.error || "Failed to archive"));
          setIsMutating(false);
        }
      } catch {
        import("react-hot-toast").then(({ toast }) => toast.error("Unable to archive this listing. Please try again."));
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
  const formattedLocation = "📍 Pickup location shared privately by seller";
  const formattedPrice = typeof price === "number" ? price.toLocaleString("en-IN") : "0";
  const displayImage = image?.trim();

  return (
    <article className="motion-listing-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] shadow-[0_1px_3px_rgba(19,34,29,0.035)] transition hover:border-[#C8D6D0] hover:shadow-[0_4px_14px_rgba(19,34,29,0.06)]">
      {/* 1. Media Section with Consistent Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F1F5F3]">
        {displayImage && !imgError ? (
          <>
            {imgLoading && (
              <div className="absolute inset-0 animate-pulse bg-[#E9EFEC]" />
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
              className={`motion-product-image h-full w-full object-cover transition-transform duration-300  ${
                imgLoading ? "opacity-0" : "opacity-100"
              }`}
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[#F1F5F3] text-[#526663]">
            <ImageIcon size={28} strokeWidth={1.5} />
            <span className="text-[11px] font-medium tracking-wide">No image available</span>
          </div>
        )}

        {/* At Most ONE Meaningful Badge (Top-Left) */}
        {singleBadge && (
          <div className="absolute left-2.5 top-2.5 z-20">
            <span
              data-motion={isVerified ? "seller-badge" : undefined}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${singleBadge.className}`}
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
          className="motion-wishlist absolute right-2.5 top-2.5 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DCD3] bg-[#EFE5DA] text-[#526663] shadow-[0_1px_3px_rgba(19,34,29,0.06)] transition hover:border-[#C8D6D0] hover:text-red-600 active:scale-95"
        >
          <Heart
            size={16}
            fill={wishlisted ? "currentColor" : "none"}
            className={wishlisted ? "text-red-500" : "text-[#526663]"}
          />
        </button>

        {/* Listing Owner Action Bar */}
        {user && sellerId === user.uid && (
          <div className="absolute bottom-2.5 right-2.5 z-40 flex items-center gap-1">
            <Link
              href={`/product/edit/${id}`}
              className="flex items-center gap-1 rounded-md border border-[#E4DCD3] bg-[#EFE5DA] px-2 py-1 text-[10px] font-bold text-[#183B38] transition hover:border-[#17645F] hover:text-[#17645F]"
            >
              <Tag size={11} />
              Edit
            </Link>
            <button
              type="button"
              disabled={isMutating}
              onClick={handleMarkSold}
              className="flex items-center gap-1 rounded-md bg-[#17645F] px-2 py-1 text-[10px] font-bold text-white transition hover:bg-[#124F4B]"
            >
              <CheckCircle2 size={11} />
              Sold
            </button>
            <button
              type="button"
              disabled={isMutating}
              onClick={handleArchive}
              className="flex items-center gap-1 rounded-md bg-[#A64242] px-2 py-1 text-[10px] font-bold text-white transition hover:bg-[#893636]"
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
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-[#183B38] transition-colors group-hover:text-[#17645F]"
          title={title}
        >
          {title}
        </h3>

        {/* Price & Rent indicator */}
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold tracking-tight text-[#183B38]">
              ₹{formattedPrice}
            </span>
            {listingType === "RENT" && (
              <span className="text-[11px] font-medium text-[#526663]">
                /day
              </span>
            )}
          </div>

          {/* Condition Tag */}
          {formattedCondition && (
            <span className="rounded-md bg-[#F3EEE8] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#526663]">
              {formattedCondition}
            </span>
          )}
        </div>

        {/* Location & Time Footer */}
        <div className="mt-auto border-t border-[#E4DCD3] pt-3 text-[11px] text-[#526663]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1">
              <MapPin size={12} className="shrink-0 text-[#526663]" />
              <span className="truncate">{formattedLocation}</span>
            </div>
            <span className="shrink-0 text-[10px] text-[#526663]">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Link Overlay */}
      <Link
        href={`/product/${id}`}
        className="absolute inset-0 z-10"
        aria-label={`View details for ${title}`}
      >
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
      className: "border-[#D3E7DE] bg-[#E5EFEC] text-[#17645F]",
    };
  }
  if (listingType === "SERVICE") {
    return {
      label: "Service",
      className: "border-[#D3E7DE] bg-[#E5EFEC] text-[#17645F]",
    };
  }

  // 2. Urgent / Moving Out flag
  if (isUrgent) {
    return {
      label: "Moving Out",
      className: "border-[#F5E2A8] bg-[#FEF3C7] text-[#92400E]",
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
      label: "Campus Verified",
      icon: <ShieldCheck size={11} className="shrink-0" />,
      className: "border-[#D3E7DE] bg-[#E5EFEC] text-[#17645F]",
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
