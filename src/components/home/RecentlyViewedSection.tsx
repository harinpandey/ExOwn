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
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/15 p-2 text-primary">
            <History size={20} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Recently Viewed</h2>
        </div>
        <Link href="/search?filter=recent_views" className="flex items-center gap-1 text-sm font-black text-primary hover:underline">
          View History <ArrowRight size={16} />
        </Link>
      </div>
      
      {loading ? (
        <SectionSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              seller={product.seller}
            />
          ))}
        </div>
      )}
    </section>
  );
}
