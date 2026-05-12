import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import ReportButton from "@/components/ui/ReportButton";
import { getProductById } from "@/actions/product";
import { notFound } from "next/navigation";
import PricingCard from "@/components/product/PricingCard";
import SmartBuyAssistant from "@/components/ai/SmartBuyAssistant";
import ActivityTracker from "@/components/product/ActivityTracker";
import ImageGallery from "@/components/product/ImageGallery";
import SellerCard from "@/components/product/SellerCard";
import ProductCard from "@/components/ui/ProductCard";
import { incrementProductViews, getTrendingProducts } from "@/actions/product";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) return notFound();

  // Increment view counter (server-side)
  await incrementProductViews(id);

  // Fetch similar listings
  const similarProducts = await getTrendingProducts(); // Placeholder for category-specific similar products

  const seller = product?.seller;
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <ActivityTracker productId={product.id} />
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={14} />
        <Link href={`/search?category=${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Left Column: Images & Details */}
        <div className="flex-1 space-y-12">
          {/* Premium Image Gallery */}
          <div className="relative group">
            <ImageGallery images={product.images} title={product.title} />
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 md:p-12 shadow-xl">
            <h2 className="text-3xl font-black mb-6 italic text-gray-900 dark:text-white leading-tight">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg font-medium">
              {product.description}
            </p>
            <div className="mt-10 pt-8 border-t border-gray-50 dark:border-gray-800 flex flex-wrap items-center justify-between gap-6">
              <ReportButton productId={product.id} reportedId={seller?.id} />
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Ad ID: {product.id.slice(0, 8)}</span>
                <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 text-[10px] font-black uppercase tracking-widest">{product.category.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Seller Info */}
        <div className="w-full lg:w-[450px] flex flex-col gap-8">
          <PricingCard product={product} />

          {/* Seller Card */}
          <SellerCard seller={seller} productId={product.id} />

          {/* AI Assistant */}
          <SmartBuyAssistant product={product} />

          {/* Safety Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800/30 p-8">
            <h3 className="text-xl font-black text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2 italic">
              <ShieldCheck size={24} /> Safety Tips
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-4 font-bold">
              <li className="flex gap-3">
                <span className="text-blue-500">•</span>
                <span>Meet in a public place on campus.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500">•</span>
                <span>Check the item thoroughly before buying.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500">•</span>
                <span>ExOwn never handles payments directly. Don't pay in advance.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Similar Listings Section */}
      <div className="mt-24 pt-16 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-4xl font-black italic tracking-tighter text-gray-900 dark:text-white">Similar Listings</h3>
            <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mt-2">Found in {product.category.name}</p>
          </div>
          <Link href={`/search?category=${product.category.slug}`} className="px-8 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-sm">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {similarProducts.filter(p => p.id !== product.id).slice(0, 4).map((p) => (
            <ProductCard 
              key={p.id}
              id={p.id}
              title={p.title}
              price={p.price}
              image={p.images[0]}
              location={p.pickupLocation}
              createdAt={p.createdAt}
              listingType={p.listingType as any}
              seller={p.seller}
              categoryId={p.categoryId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
