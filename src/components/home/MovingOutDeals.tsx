import { getMovingOutProducts } from "@/actions/product";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

export default async function MovingOutDeals() {
  let products: any[] = [];
  try {
    products = await getMovingOutProducts();
  } catch (err) {
    console.error("[MovingOutDeals] DB fetch error:", err);
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-400 mb-3">
          <Package size={22} />
        </div>
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
          No moving-out listings around this campus right now
        </h4>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Seniors post clearance deals when graduating or relocating. Check back soon or browse all campus deals.
        </p>
        <Link
          href="/search"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
        >
          Browse All Marketplace Listings <ArrowRight size={13} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.slice(0, 5).map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          price={product.price}
          image={product.images?.[0] || ""}
          // location prop removed to protect privacy
          createdAt={product.createdAt}
          isUrgent={product.isUrgent}
          isVerified={product.seller?.isVerified || false}
          listingType={product.listingType as any}
          condition={product.condition}
          categoryId={product.categoryId}
          subcategoryId={product.subcategoryId || ""}
          sellerId={product.sellerId}
          seller={product.seller}
        />
      ))}
    </div>
  );
}
