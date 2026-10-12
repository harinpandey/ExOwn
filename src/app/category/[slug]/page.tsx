import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Flame, Zap, RefreshCw, ArrowRight } from "lucide-react";
import { getCategoryBySlug, searchProducts } from "@/actions/product";
import { resolveCampus } from "@/actions/location";
import CategoryHero from "@/components/category/CategoryHero";
import VisualSubcategoryRail from "@/components/category/VisualSubcategoryRail";
import ProductShelf from "@/components/ui/ProductShelf";
import ProductCard from "@/components/ui/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ campus?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { campus: rawCampus } = await searchParams;
  const resolvedCampus = rawCampus ? await resolveCampus(rawCampus) : null;
  const category = await getCategoryBySlug(slug, resolvedCampus?.id);

  if (!category) {
    return {
      title: "Category Not Found | ExOwn",
    };
  }

  const campusSuffix = resolvedCampus ? ` at ${resolvedCampus.name}` : "";
  return {
    title: `${category.name}${campusSuffix} | ExOwn Campus Marketplace`,
    description: `Find student listings, textbooks, electronics, cycles, and services in ${category.name}${campusSuffix} on ExOwn.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { campus: rawCampus } = await searchParams;

  // Resolve campus safely against DB if provided
  const resolvedCampus = rawCampus ? await resolveCampus(rawCampus) : null;
  const effectiveCampusId = rawCampus ? (resolvedCampus?.id || "invalid_campus_filter") : undefined;

  // Fetch real category and subcategories
  const category = await getCategoryBySlug(slug, effectiveCampusId);
  if (!category) {
    notFound();
  }

  // Fetch category shelves with real products
  const [trendingRes, movingOutRes, rentalsRes, allRes] = await Promise.all([
    searchProducts({
      categorySlug: slug,
      campusId: effectiveCampusId,
      sortBy: "trending",
      pageSize: 8,
    }),
    searchProducts({
      categorySlug: slug,
      campusId: effectiveCampusId,
      movingOut: true,
      pageSize: 8,
    }),
    searchProducts({
      categorySlug: slug,
      campusId: effectiveCampusId,
      listingType: "RENT",
      pageSize: 8,
    }),
    searchProducts({
      categorySlug: slug,
      campusId: effectiveCampusId,
      sortBy: "newest",
      pageSize: 12,
    }),
  ]);

  const trendingProducts = Array.isArray(trendingRes) ? trendingRes : [];
  const movingOutProducts = Array.isArray(movingOutRes) ? movingOutRes : [];
  const rentalProducts = Array.isArray(rentalsRes) ? rentalsRes : [];
  const allProducts = Array.isArray(allRes) ? allRes : [];
  const totalCount = category.liveCount || allProducts.length;

  const campusParam = resolvedCampus?.slug || resolvedCampus?.id || rawCampus || "";
  const buildSearchHref = (extraQuery?: string) => {
    const p = new URLSearchParams();
    p.set("category", slug);
    if (campusParam) p.set("campus", campusParam);
    if (extraQuery) {
      const parts = new URLSearchParams(extraQuery);
      parts.forEach((val, key) => p.set(key, val));
    }
    return `/search?${p.toString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto no-scrollbar whitespace-nowrap dark:text-gray-400"
      >
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={13} className="shrink-0 text-gray-400" />
        <Link href="/search" className="hover:text-primary transition-colors">
          Categories
        </Link>
        <ChevronRight size={13} className="shrink-0 text-gray-400" />
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {category.name}
        </span>
      </nav>

      {/* 2. Category Hero with 2.5D visual, campus scope, live count */}
      <CategoryHero
        name={category.name}
        slug={category.slug}
        liveCount={totalCount}
        campusName={resolvedCampus?.name}
      />

      {/* 3. Visual Subcategory Rail */}
      <VisualSubcategoryRail
        categorySlug={category.slug}
        categoryName={category.name}
        subcategories={category.subcategories || []}
        campusSlugOrName={campusParam}
      />

      {/* Empty State when category has 0 listings */}
      {totalCount === 0 && (
        <div className="my-10">
          <EmptyState
            title={`No listings yet in ${category.name}`}
            description={
              resolvedCampus
                ? `Be the first student to list items in ${category.name} at ${resolvedCampus.name}!`
                : `Be the first student to list an item in ${category.name} on campus!`
            }
            actionLabel="List an Item"
            actionHref={`/sell?category=${category.slug}`}
            secondaryActionLabel="Post a Want Request"
            secondaryActionHref={`/requests/new?category=${category.slug}`}
          />
        </div>
      )}

      {/* 4. Merchandising Shelves (only rendered if products exist) */}
      {trendingProducts.length > 0 && (
        <ProductShelf
          eyebrow="Popular on Campus"
          icon={<Flame size={14} className="text-orange-500" />}
          title={`Trending in ${category.name}`}
          description="Most active student items viewed this week in this category."
          href={buildSearchHref("sort=trending")}
          action="View All"
          className="px-0 py-6 sm:py-8"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {trendingProducts.slice(0, 4).map((product: any) => (
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
                listingType={product.listingType}
                condition={product.condition}
                categoryId={product.categoryId}
                subcategoryId={product.subcategoryId || ""}
                sellerId={product.sellerId}
                seller={product.seller}
              />
            ))}
          </div>
        </ProductShelf>
      )}

      {movingOutProducts.length > 0 && (
        <ProductShelf
          eyebrow="Graduating Seniors"
          icon={<Zap size={14} className="text-amber-500" />}
          title={`Moving Out Deals in ${category.name}`}
          description="Instant hostel pickup deals from students clearing room space."
          href={buildSearchHref("movingOut=true")}
          action="View Deals"
          className="px-0 py-6 sm:py-8"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {movingOutProducts.slice(0, 4).map((product: any) => (
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
                listingType={product.listingType}
                condition={product.condition}
                categoryId={product.categoryId}
                subcategoryId={product.subcategoryId || ""}
                sellerId={product.sellerId}
                seller={product.seller}
              />
            ))}
          </div>
        </ProductShelf>
      )}

      {rentalProducts.length > 0 && (
        <ProductShelf
          eyebrow="Short-Term Use"
          icon={<RefreshCw size={14} className="text-blue-500" />}
          title={`Rentals in ${category.name}`}
          description="Rent for a semester, exam period, or semester project directly from peers."
          href={buildSearchHref("listingType=RENT")}
          action="Browse Rentals"
          className="px-0 py-6 sm:py-8"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {rentalProducts.slice(0, 4).map((product: any) => (
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
                listingType={product.listingType}
                condition={product.condition}
                categoryId={product.categoryId}
                subcategoryId={product.subcategoryId || ""}
                sellerId={product.sellerId}
                seller={product.seller}
              />
            ))}
          </div>
        </ProductShelf>
      )}

      {allProducts.length > 0 && (
        <section className="py-6 sm:py-8" aria-label={`All ${category.name} Listings`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                All Listings in {category.name}
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Explore all verified peer listings available now
              </p>
            </div>
            <Link
              href={buildSearchHref()}
              className="marketplace-button inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition"
            >
              <span>Filter & Sort in Search</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {allProducts.map((product: any) => (
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
                listingType={product.listingType}
                condition={product.condition}
                categoryId={product.categoryId}
                subcategoryId={product.subcategoryId || ""}
                sellerId={product.sellerId}
                seller={product.seller}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
