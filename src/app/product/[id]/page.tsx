import Link from "next/link";
import { ArrowLeft, MessageSquare, Tag, MapPin, Clock, ShieldCheck, Share2, Heart } from "lucide-react";
import ReportButton from "@/components/ui/ReportButton";
import { formatDistanceToNow } from "date-fns";
import { getProductById } from "@/actions/product";
import { notFound } from "next/navigation";
import PricingCard from "@/components/product/PricingCard";
import SmartBuyAssistant from "@/components/ai/SmartBuyAssistant";
import WishlistButton from "@/components/product/WishlistButton";
import ActivityTracker from "@/components/product/ActivityTracker";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) return notFound();

  const seller = product?.seller;
  const sellerName = seller?.name || "New Seller";
  const sellerJoined = seller?.createdAt || new Date();
  const sellerRating = seller?.profile?.rating ?? 0;
  const sellerDeals = seller?.profile?.successfulDeals ?? 0;
  const sellerCourse = seller?.profile?.course ?? "";
  const sellerBatch = seller?.profile?.batch ?? "";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ActivityTracker productId={product.id} />
      <Link href="/search" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Column: Images & Details */}
        <div className="flex-1 space-y-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 relative">
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <WishlistButton productId={product.id} />
                <button className="p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full text-gray-600 hover:text-primary transition-colors shadow-sm">
                  <Share2 size={20} />
                </button>
              </div>

              {product.isUrgent && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
                    URGENT
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button key={idx} className={`w-24 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 ${idx === 0 ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
            <div className="mt-6 pt-4 text-sm text-gray-500">
              Category: <span className="font-medium text-gray-700 dark:text-gray-300">{product.category.name}</span>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <ReportButton productId={product.id} reportedId={seller?.id} />
              <span className="text-gray-500 text-sm">Ad ID: {product.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Seller Info */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          <PricingCard product={product} />

          {/* Seller Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Seller Details</h3>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xl font-bold uppercase shadow-inner overflow-hidden">
                {seller?.image ? (
                  <img src={seller.image} alt={sellerName} className="w-full h-full object-cover" />
                ) : (
                  sellerName[0]
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg">{sellerName}</h4>
                  {seller?.isVerified && (
                    <ShieldCheck size={18} className="text-blue-500" />
                  )}
                </div>
                {(sellerCourse || sellerBatch) && (
                  <p className="text-sm text-gray-500">
                    {sellerCourse}{sellerCourse && sellerBatch ? " • " : ""}{sellerBatch ? `Batch of ${sellerBatch}` : ""}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-yellow-500 text-sm font-bold">
                    ★ {sellerRating > 0 ? sellerRating.toFixed(1) : "New"}
                  </div>
                  {sellerDeals > 0 && (
                    <>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <span className="text-sm text-gray-500">{sellerDeals} Deals</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member since {sellerJoined.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* AI Assistant */}
          <SmartBuyAssistant product={product} />

          {/* Safety Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30 p-6">
            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
              <ShieldCheck size={20} /> Safety Tips
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 list-disc pl-5">
              <li>Meet in a public place on campus.</li>
              <li>Check the item thoroughly before buying.</li>
              <li>Don't pay in advance.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
