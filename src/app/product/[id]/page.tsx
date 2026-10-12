import Link from "next/link";
import { Shield, ChevronRight, FileText, Layers, RefreshCw } from "lucide-react";
import ReportButton from "@/components/ui/ReportButton";
import { getProductById, incrementProductViews, getTrendingProducts } from "@/actions/product";
import { notFound } from "next/navigation";
import PricingCard from "@/components/product/PricingCard";
import ActivityTracker from "@/components/product/ActivityTracker";
import ImageGallery from "@/components/product/ImageGallery";
import SellerCard from "@/components/product/SellerCard";
import ProductCard from "@/components/ui/ProductCard";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product: any = null;
  try {
    product = await getProductById(id);
  } catch (err) {
    console.error("[ProductPage] getProductById failed:", err);
  }

  if (!product) return notFound();

  // Increment view counter (server-side, fire-and-forget — do not let failure crash page)
  incrementProductViews(id).catch(() => {});

  // Fetch similar real listings from the database
  let similarProducts: any[] = [];
  try {
    const trending = await getTrendingProducts();
    if (Array.isArray(trending)) {
      similarProducts = trending.filter((p: any) => p.id !== product.id).slice(0, 4);
    }
  } catch {
    // Non-critical — silently degrade to empty list
  }

  const seller = product?.seller;
  const postedDate = product?.createdAt ? format(new Date(product.createdAt), "MMM d, yyyy") : null;
  const formattedCondition = formatCondition(product?.condition);
  const locationLabel = product?.pickupLocation?.trim() || product?.campus?.name || "Campus location not provided";

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 max-w-7xl">
      <ActivityTracker
        productId={product.id}
        title={product.title}
        price={product.price}
        image={product.images?.[0]}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto no-scrollbar whitespace-nowrap dark:text-gray-400">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={13} className="shrink-0 text-gray-400" />
        {product.category?.slug && (
          <>
            <Link
              href={`/search?category=${product.category.slug}`}
              className="hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
            <ChevronRight size={13} className="shrink-0 text-gray-400" />
          </>
        )}
        <span className="truncate max-w-[260px] font-medium text-gray-900 dark:text-gray-200">
          {product.title}
        </span>
      </nav>

      {/* Main 2-Column Product Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Image Gallery & Core Listing Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gallery Viewport */}
          <ImageGallery images={product.images} title={product.title} />

          {/* Description Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 shadow-sm dark:border-white/10 dark:bg-[#10141b]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-gray-400" />
              Description
            </h2>
            <div className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line font-normal">
              {product.description || "No description provided by the seller."}
            </div>

            {/* Ad Meta Footer & Report Action */}
            <div className="mt-8 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 dark:border-white/10">
              <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                <span>Ad ID: {product.id.slice(0, 8)}</span>
                {postedDate && <span>• Posted {postedDate}</span>}
              </div>
              <ReportButton productId={product.id} reportedId={seller?.id} />
            </div>
          </div>

          {/* Listing Specifics / Specifications */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 shadow-sm dark:border-white/10 dark:bg-[#10141b]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers size={18} className="text-gray-400" />
              Listing Details
            </h2>

            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-zinc-800/60">
                <dt className="text-gray-500 dark:text-gray-400 font-medium">Category</dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {product.category?.name || "Uncategorized"}
                </dd>
              </div>

              {formattedCondition && (
                <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-zinc-800/60">
                  <dt className="text-gray-500 dark:text-gray-400 font-medium">Condition</dt>
                  <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {formattedCondition}
                  </dd>
                </div>
              )}

              <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-zinc-800/60">
                <dt className="text-gray-500 dark:text-gray-400 font-medium">Listing Format</dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {product.listingType === "RENT"
                    ? "Rental"
                    : product.listingType === "SERVICE"
                    ? "Service"
                    : product.listingType === "EXCHANGE"
                    ? "Exchange Only"
                    : "For Sale"}
                </dd>
              </div>

              <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-zinc-800/60">
                <dt className="text-gray-500 dark:text-gray-400 font-medium">Pickup Location</dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-white truncate">
                  {locationLabel}
                </dd>
              </div>

              {product.brand && (
                <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-zinc-800/60">
                  <dt className="text-gray-500 dark:text-gray-400 font-medium">Brand</dt>
                  <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {product.brand}
                  </dd>
                </div>
              )}

              {product.purchaseYear && (
                <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-zinc-800/60">
                  <dt className="text-gray-500 dark:text-gray-400 font-medium">Purchase Year</dt>
                  <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {product.purchaseYear}
                  </dd>
                </div>
              )}

              {product.rentalDetail && (
                <div className="rounded-xl bg-blue-50/60 p-3.5 dark:bg-blue-950/20 sm:col-span-2">
                  <dt className="text-blue-700 dark:text-blue-300 font-medium">Rental Terms</dt>
                  <dd className="mt-1 font-semibold text-blue-950 dark:text-blue-100">
                    Security Deposit: ₹{Number(product.rentalDetail.securityDeposit || 0).toLocaleString("en-IN")}
                  </dd>
                </div>
              )}

              {product.isExchangeAllowed && (
                <div className="rounded-xl bg-emerald-50/60 p-3.5 dark:bg-emerald-950/20 sm:col-span-2">
                  <dt className="text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                    <RefreshCw size={13} />
                    Exchange Preferences
                  </dt>
                  <dd className="mt-1 text-emerald-950 dark:text-emerald-100 font-medium">
                    {Array.isArray(product.exchangeCategories) && product.exchangeCategories.length > 0
                      ? `Preferred items: ${product.exchangeCategories.join(", ")}`
                      : "Seller is open to fair value item exchanges."}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Right Column: Pricing & Seller Info & Safe Meetup */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Action & Pricing Card */}
          <PricingCard product={product} />

          {/* Seller Card */}
          <SellerCard seller={seller} productId={product.id} />

          {/* Safe Meetup Guidelines */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 shadow-sm dark:border-white/10 dark:bg-[#10141b]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Safe Meetup Guidance
            </h3>
            <ul className="mt-3 space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Always meet in a public, well-lit campus location (e.g. food court, campus library, student center).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Inspect the item thoroughly before finalizing any deal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Never transfer funds in advance to unknown accounts.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Similar Listings Section (Only rendered when real database results exist) */}
      {similarProducts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Similar Listings
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Explore more listings from {product.category?.name || "campus"}
              </p>
            </div>
            {product.category?.slug && (
              <Link
                href={`/search?category=${product.category.slug}`}
                className="text-xs font-bold text-primary hover:underline"
              >
                View all
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {similarProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                price={p.price}
                image={p.images?.[0] || ""}
                location={p.pickupLocation}
                createdAt={p.createdAt}
                listingType={p.listingType as any}
                condition={p.condition}
                isUrgent={p.isUrgent}
                isVerified={p.seller?.isVerified || false}
                seller={p.seller}
                categoryId={p.categoryId}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function formatCondition(condition?: string): string | null {
  if (!condition) return null;
  switch (condition.toUpperCase()) {
    case "NEW":
      return "Brand New";
    case "LIKE_NEW":
      return "Like New";
    case "GOOD":
      return "Good";
    case "FAIR":
      return "Fair";
    case "POOR":
      return "Poor";
    default:
      return condition.replace("_", " ");
  }
}
