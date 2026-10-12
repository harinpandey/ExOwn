"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Package, MapPin, Calendar, ArrowLeft, CheckCircle2, User } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { getPublicProfile } = await import("@/actions/user");
        const { getUserListings } = await import("@/actions/product");

        const [userData, userListings] = await Promise.all([
          getPublicProfile(id),
          getUserListings(id)
        ]);

        setProfile(userData);
        setListings(userListings || []);
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-gray-400">
          <User size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Student profile not found</h2>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          This member account does not exist or has been removed from the campus marketplace.
        </p>
        <Link
          href="/search"
          className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Back to Browse
        </Link>
      </div>
    );
  }

  const displayName = profile.name || "Campus Member";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";
  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : "Recent";

  const isVerified =
    profile.isVerified === true ||
    profile.verificationLevel === "CAMPUS" ||
    profile.verificationLevel === "VERIFIED" ||
    profile.verificationLevel === "BUSINESS";

  const collegeName = profile.profile?.collegeName;
  const course = profile.profile?.course;
  const batch = profile.profile?.batch;
  const completedDeals = typeof profile.profile?.successfulDeals === "number" ? profile.profile.successfulDeals : 0;
  const rating = typeof profile.profile?.rating === "number" ? profile.profile.rating : 0;


  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar: Verified Identity & Trust Evidence */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />

            <div className="relative mx-auto w-20 h-20 bg-white dark:bg-gray-800 rounded-full p-1 mt-4 mb-3 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center overflow-hidden">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold uppercase">
                  {avatarLetter}
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold flex items-center justify-center gap-1.5 text-gray-900 dark:text-white">
              {displayName}
              {isVerified && (
                <span title="Identity Verified">
                  <ShieldCheck size={18} className="text-blue-500 fill-blue-500/10" />
                </span>
              )}
            </h2>

            {/* College & Course */}
            {(collegeName || course) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 font-medium">
                {[course, batch ? `Batch ${batch}` : null].filter(Boolean).join(" • ")}
              </p>
            )}

            {/* Verification Status Badge */}
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase mt-1 mb-4 ${
              isVerified
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40"
                : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}>
              {isVerified ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                  {profile.verificationLevel === "CAMPUS" ? "Campus Verified" : "Identity Verified"}
                </>
              ) : (
                "Student Member"
              )}
            </div>

            {/* Location & Joining Date */}
            <div className="flex flex-col gap-2 text-left text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-white/10 py-3.5 mt-2">
              {collegeName && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">{collegeName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>

            {/* Real Marketplace Evidence (No fabricated scores) */}
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 dark:border-white/10 pt-3 text-center">
              <div className="p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="text-base font-black text-gray-900 dark:text-white">
                  {profile.listingCount || listings.length}
                </div>
                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Active Ads</div>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="text-base font-black text-gray-900 dark:text-white">
                  {completedDeals}
                </div>
                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Completed Deals</div>
              </div>
            </div>

            {rating > 0 && (
              <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl text-center">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  ★ {rating.toFixed(1)} Community Rating
                </span>
              </div>
            )}

            {/* Safe Community Note */}
            <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100/60 dark:border-blue-900/30 text-left text-[11px] text-gray-500 dark:text-gray-400">
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Campus Safety Notice</p>
              Always conduct transactions in open campus areas and inspect items in person.
            </div>
          </div>
        </div>

        {/* Main Content: Active Listings by this seller */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package size={20} className="text-primary" />
                Active Listings ({listings.length})
              </h3>
            </div>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {listings.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.images?.[0] || ""}
                    location={product.pickupLocation}
                    createdAt={product.createdAt}
                    isUrgent={product.isUrgent}
                    listingType={product.listingType}
                    condition={product.condition}
                    isVerified={isVerified}
                    categoryId={product.categoryId}
                    subcategoryId={product.subcategoryId || ""}
                    sellerId={product.sellerId}
                    seller={{
                      name: displayName,
                      image: profile.image,
                      isVerified,
                      verificationLevel: profile.verificationLevel,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-xl">
                <Package size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500">This member has no active listings for sale right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
