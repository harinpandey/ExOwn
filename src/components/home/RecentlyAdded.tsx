import { getRecentlyAdded } from "@/actions/product";
import ProductCard from "@/components/ui/ProductCard";

export default async function RecentlyAdded() {
  let products: any[] = [];
  try {
    products = await getRecentlyAdded();
  } catch (err) {
    console.error("[RecentlyAdded] DB fetch failed:", err);
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center text-xs font-semibold text-gray-500">
        No new listings posted yet on this campus.
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
          location={product.pickupLocation}
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
