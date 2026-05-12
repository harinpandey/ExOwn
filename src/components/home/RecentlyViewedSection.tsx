"use client";

import { useEffect, useState } from "react";
import { getRecentlyViewed } from "@/actions/activity";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ui/ProductCard";
import { SectionSkeleton } from "@/components/ui/ProductSkeleton";
import { History, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RecentlyViewedSection() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getRecentlyViewed(user.uid).then(data => {
        setProducts(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || (products.length === 0 && !loading)) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg text-purple-600 dark:text-purple-400">
            <History size={20} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Recently Viewed</h2>
        </div>
        <Link href="/search?filter=recent_views" className="text-primary font-semibold flex items-center gap-1 hover:underline">
          View History <ArrowRight size={16} />
        </Link>
      </div>
      
      {loading ? (
        <SectionSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              image={product.images[0] || ""}
              location={product.pickupLocation}
              createdAt={product.createdAt}
              isUrgent={product.isUrgent}
              isVerified={product.seller?.isVerified || false}
              listingType={product.listingType}
              categoryId={product.categoryId}
              subcategoryId={product.subcategoryId || ""}
              sellerId={product.sellerId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
