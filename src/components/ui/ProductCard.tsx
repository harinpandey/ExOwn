"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Clock3,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
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
}: ProductCardProps) {
  const { user } = useAuth();
  const { trackWishlistAdd } = useMoments();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [isMutating, setIsMutating] = useState(false);

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

  const freshness = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const trustLabel = getTrustLabel(seller, isVerified);
  const typeLabel = listingType === "RENT" ? "Rent" : listingType === "SERVICE" ? "Service" : "Buy";

  return (
    <article className="premium-card group relative flex min-h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-md transition-all dark:border-white/10 dark:bg-[#10141b] dark:text-white">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-[#0c1017]">
        <img
          src={image || "/exown-icon.png"}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />

        <div className="absolute left-2.5 top-2.5 z-20 flex flex-wrap gap-1.5">
          <span className="rounded-md border border-white/15 bg-black/50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur">
            {typeLabel}
          </span>
          {isUrgent && (
            <span className="rounded-md bg-red-500 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
              Urgent
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? "Remove from wishlist" : "Save listing"}
          aria-pressed={wishlisted}
          className="absolute right-2.5 top-2.5 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-black/45 text-white backdrop-blur transition hover:border-red-300 hover:text-red-300 active:scale-95"
        >
          <Heart size={17} fill={wishlisted ? "currentColor" : "none"} className={wishlisted ? "text-red-400" : ""} />
        </button>

        {condition && (
          <span className="absolute bottom-2.5 left-2.5 z-20 rounded-md border border-white/15 bg-white/90 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-gray-900">
            {condition.replace("_", " ")}
          </span>
        )}

        {user && sellerId === user.uid && (
          <div className="absolute bottom-2.5 right-2.5 z-40 flex gap-1">
            <Link
              href={`/product/edit/${id}`}
              className="flex items-center gap-1 rounded-md bg-white px-2 py-1.5 text-[10px] font-black text-gray-900 shadow transition hover:text-primary"
            >
              <Tag size={12} />
              Edit
            </Link>
            <button
              type="button"
              onClick={handleMarkSold}
              className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1.5 text-[10px] font-black text-white shadow transition hover:bg-emerald-700"
            >
              <CheckCircle2 size={12} />
              Sold
            </button>
            <button
              type="button"
              onClick={handleArchive}
              className="flex items-center gap-1 rounded-md bg-red-600 px-2 py-1.5 text-[10px] font-black text-white shadow transition hover:bg-red-700"
            >
              <Trash2 size={12} />
              Archive
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-black leading-5 text-gray-900 dark:text-white" title={title}>
          {title}
        </h3>

        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-black tracking-tight text-primary dark:text-[var(--accent)]">₹{price.toLocaleString("en-IN")}</p>
            {listingType === "RENT" && <p className="text-[11px] font-bold text-gray-500 dark:text-white/45">per day</p>}
          </div>
          {trustLabel && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-black text-primary">
              {trustLabel.icon}
              {trustLabel.label}
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-2 border-t border-gray-100 pt-3 text-[11px] font-semibold text-gray-500 dark:border-white/10 dark:text-white/52">
          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin size={13} className="shrink-0 text-gray-400 dark:text-white/32" />
            <span className="truncate">{location || "Campus pickup"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock3 size={13} className="text-gray-400 dark:text-white/32" />
            <span>{freshness}</span>
          </div>
        </div>
      </div>

      <Link href={`/product/${id}`} className="absolute inset-0 z-10" tabIndex={-1} aria-hidden>
        <span className="sr-only">View details for {title}</span>
      </Link>
    </article>
  );
}

function getTrustLabel(seller: ProductCardProps["seller"], isVerified?: boolean) {
  if (seller?.isTrustedSeller) {
    return { label: "Trusted", icon: <Sparkles size={12} aria-hidden="true" /> };
  }
  if (seller?.verificationLevel === "CAMPUS" || isVerified) {
    return { label: "Verified", icon: <ShieldCheck size={12} aria-hidden="true" /> };
  }
  if (seller?.verificationLevel === "BUSINESS") {
    return { label: "Business", icon: <ShieldCheck size={12} aria-hidden="true" /> };
  }
  return null;
}
