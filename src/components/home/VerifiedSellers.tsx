import { getVerifiedSellersProducts } from "@/actions/product";
import ProductCard from "@/components/ui/ProductCard";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function VerifiedSellers() {
  const verifiedProducts = await getVerifiedSellersProducts();

  if (verifiedProducts.length === 0) {
    return (
      <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
        <p className="text-gray-500">No items from verified sellers yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {verifiedProducts.slice(0, 4).map((product) => (
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
  );
}
