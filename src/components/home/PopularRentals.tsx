import { getPopularRentals } from "@/actions/product";
import ProductCard from "@/components/ui/ProductCard";

export default async function PopularRentals() {
  const popularRentals = await getPopularRentals();

  if (popularRentals.length === 0) {
    return (
      <div className="col-span-full py-12 text-center bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
        <p className="text-gray-500">No rentals available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {popularRentals.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          price={product.price}
          image={product.images[0] || ""}
          location={product.pickupLocation}
          createdAt={product.createdAt}
          isUrgent={product.isUrgent}
          isVerified={product.seller.isVerified}
          listingType={product.listingType}
          categoryId={product.categoryId}
          subcategoryId={product.subcategoryId || ""}
          sellerId={product.sellerId}
        />
      ))}
    </div>
  );
}
