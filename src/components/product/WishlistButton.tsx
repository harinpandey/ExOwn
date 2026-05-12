"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
}

export default function WishlistButton({ productId, initialWishlisted = false }: WishlistButtonProps) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);

  useEffect(() => {
    if (user && !initialWishlisted) {
      import("@/actions/wishlist").then(({ isInWishlist }) => {
        isInWishlist(user.uid, productId).then(setWishlisted);
      });
    }
  }, [user, productId, initialWishlisted]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to save items");
      return;
    }

    const prev = wishlisted;
    setWishlisted(!prev);

    try {
      const { toggleWishlist } = await import("@/actions/wishlist");
      const res = await toggleWishlist(user.uid, productId);
      if (!res.success) {
        setWishlisted(prev);
        toast.error(res.error || "Failed to update wishlist");
      } else {
        toast.success(res.added ? "Added to wishlist" : "Removed from wishlist");
      }
    } catch (err) {
      setWishlisted(prev);
      toast.error("An error occurred");
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={`p-3 backdrop-blur-md rounded-full transition-all shadow-sm ${
        wishlisted 
          ? "bg-red-500 text-white" 
          : "bg-white/80 dark:bg-gray-900/80 text-gray-600 hover:text-red-500"
      }`}
      title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
    </button>
  );
}
