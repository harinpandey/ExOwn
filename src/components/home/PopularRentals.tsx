"use client";

import { useEffect, useState } from "react";
import { getPopularRentals } from "@/actions/product";
import ProductCard from "@/components/ui/ProductCard";
import { useLocation } from "@/context/LocationContext";

export default function PopularRentals() {
  const { campusObj } = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPopularRentals(campusObj.name)
      .then((items) => { if (active) setProducts(items); })
      .catch((error) => console.error("[PopularRentals] DB fetch failed:", error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [campusObj.name]);

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/[0.04]" />;
  if (products.length === 0) {
    return <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-xs font-semibold text-gray-500 dark:border-white/10">No active rentals at {campusObj.shortName} right now.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.slice(0, 5).map((product) => (
        <ProductCard key={product.id} id={product.id} title={product.title} price={product.price}
          image={product.images?.[0] || ""} createdAt={product.createdAt} isUrgent={product.isUrgent}
          isVerified={product.seller?.isVerified || false} listingType={product.listingType as any}
          condition={product.condition} categoryId={product.categoryId} subcategoryId={product.subcategoryId || ""}
          sellerId={product.sellerId} seller={product.seller} />
      ))}
    </div>
  );
}
