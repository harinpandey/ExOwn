"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { getMovingOutProducts } from "@/actions/product";
import ProductCard from "@/components/ui/ProductCard";
import { useLocation } from "@/context/LocationContext";

export default function MovingOutDeals() {
  const { campusObj } = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMovingOutProducts(campusObj.name)
      .then((items) => { if (active) setProducts(items); })
      .catch((error) => console.error("[MovingOutDeals] DB fetch error:", error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [campusObj.name]);

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/[0.04]" />;
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-zinc-800"><Package size={22} /></div>
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">No moving-out listings at {campusObj.shortName} right now</h4>
        <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">Graduating students post clearance deals when they are ready. Browse other listings from your campus in the meantime.</p>
        <Link href="/search" className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline">Browse Campus Listings <ArrowRight size={13} /></Link>
      </div>
    );
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
