import { getVerifiedSellersProducts } from "@/actions/product";
import ProductCard from "@/components/ui/ProductCard";
import { DEMO_VERIFIED } from "@/lib/demoData";

export default async function VerifiedSellers() {
  const dbProducts = await getVerifiedSellersProducts();
  const products = dbProducts.length > 0 ? dbProducts : DEMO_VERIFIED;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.slice(0, 5).map((product) => (
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
