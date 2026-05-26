"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, MapPin, ShieldCheck, Sparkles, Tag, CheckCircle2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";

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
    verificationLevel?: string;
    isTrustedSeller?: boolean;
    trustScore?: number;
  };
}

export default function ProductCard({ 
  id, title, price, image, location, createdAt, isUrgent, listingType, condition, categoryId: _categoryId, subcategoryId: _subcategoryId, sellerId, seller, isWishlisted = false
}: ProductCardProps) {
  const { user } = useAuth();
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
        import("react-hot-toast").then(({ toast }) => 
          toast.success(res.added ? "Added to wishlist" : "Removed from wishlist")
        );
      } else {
        setWishlisted(previousState);
        import("react-hot-toast").then(({ toast }) => toast.error(res.error || "Failed to update wishlist"));
      }
    } catch {
      setWishlisted(previousState);
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

  // Determine single best trust badge
  const renderTrustBadge = () => {
    if (seller?.isTrustedSeller) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          <Sparkles size={12} /> Trusted
        </span>
      );
    }
    if (seller?.verificationLevel === "CAMPUS") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
          <ShieldCheck size={12} /> Campus Verified
        </span>
      );
    }
    if (seller?.verificationLevel === "BUSINESS") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400">
          <ShieldCheck size={12} /> Business Verified
        </span>
      );
    }
    return null;
  };

  return (
    <div className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden premium-card">
      
      {/* Aspect Ratio 4:3 Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
        <img 
          src={image || "/placeholder-product.png"} 
          alt={title} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
        
        {/* Overlay badges (minimal) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-20">
          {isUrgent && (
            <span className="bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              Urgent
            </span>
          )}
          {condition && (
            <span className="bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
              {condition}
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon (Top-Right, Always Visible) */}
        <button 
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 p-2 bg-white/20 dark:bg-black/25 border border-white/20 dark:border-white/10 backdrop-blur-md text-gray-800 dark:text-gray-200 rounded-full hover:scale-110 active:scale-95 transition-all shadow-inner z-30"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={15} fill={wishlisted ? "#ef4444" : "none"} className={wishlisted ? "text-red-500" : ""} />
        </button>

        {/* Seller management quick actions (only if logged in and seller) */}
        {user && sellerId === user.uid && (
          <div className="absolute bottom-2.5 right-2.5 z-40 flex gap-1">
            <Link 
              href={`/product/edit/${id}`}
              className="p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-800 dark:text-gray-100 rounded-lg shadow-sm hover:text-primary transition-all text-[9px] font-extrabold flex items-center gap-1"
            >
              <Tag size={12} /> Edit
            </Link>
            <button 
              onClick={handleMarkSold}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors text-[9px] font-extrabold flex items-center gap-1"
            >
              <CheckCircle2 size={12} /> Sold
            </button>
            <button 
              onClick={handleArchive}
              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors text-[9px] font-extrabold flex items-center gap-1"
            >
              <Trash2 size={12} /> Archive
            </button>
          </div>
        )}
      </div>

      {/* Info Content Area */}
      <div className="p-4 flex flex-col flex-1 bg-white dark:bg-gray-900 relative z-30">
        
        {/* Row 1: Title & Type badge */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm-safe text-gray-800 dark:text-gray-200 line-clamp-1 leading-tight flex-1" title={title}>
            {title}
          </h3>
          {listingType && listingType !== "SELL" && (
            <span className="shrink-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase">
              {listingType}
            </span>
          )}
        </div>

        {/* Row 2: Price / Duration */}
        <div className="flex items-baseline gap-1 mb-2.5">
          <span className="text-base font-extrabold text-gray-950 dark:text-gray-50">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {listingType === "RENT" && (
            <span className="text-[10px] text-gray-400 font-semibold lowercase">/ day</span>
          )}
        </div>

        {/* Row 3: Trust & Location Metas */}
        <div className="mt-auto pt-2.5 border-t border-gray-50 dark:border-gray-800/80 flex items-center justify-between text-[10px] font-semibold text-gray-400">
          <div className="flex items-center gap-1 text-gray-500 truncate max-w-[120px]">
            <MapPin size={12} className="text-gray-300 dark:text-gray-600" />
            <span className="truncate">{location}</span>
          </div>
          {renderTrustBadge() || (
            <span className="text-gray-400 dark:text-gray-500 text-[10px]">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: false })} ago
            </span>
          )}
        </div>
      </div>

      {/* Fully clickable card layer */}
      <Link href={`/product/${id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View Details for {title}</span>
      </Link>
    </div>
  );
}
