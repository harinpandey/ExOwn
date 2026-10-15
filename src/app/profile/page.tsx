"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  Package, Heart, Settings, ShieldCheck, LogOut,
  Edit2, CreditCard, Crown, Clock, RefreshCw,
  AlertCircle, ArrowRight, CheckCircle2, ChevronRight, Handshake, MapPin
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import UpgradePlanModal from "@/components/dashboard/UpgradePlanModal";
import BillingHistory from "@/components/dashboard/BillingHistory";
import { getSubscription } from "@/actions/subscription";
import { getWishlist } from "@/actions/wishlist";
import { format } from "date-fns";

export default function ProfileDashboardPage() {
  const { user, loading, logout, isProfileComplete } = useAuth();
  const router = useRouter();

  const [myListings, setMyListings] = useState<any[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  const [offersData, setOffersData] = useState<{ received: any[]; sent: any[] }>({ received: [], sent: [] });
  const [offersLoading, setOffersLoading] = useState(false);

  const [rentalsData, setRentalsData] = useState<{ owned: any[]; rented: any[] }>({ owned: [], rented: [] });
  const [rentalsLoading, setRentalsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"listings" | "favorites" | "offers" | "rentals" | "billing" | "settings">("listings");
  const [listingFilter, setListingFilter] = useState<"ALL" | "LIVE" | "SOLD" | "PENDING">("ALL");
  const [subscription, setSubscription] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        try {
          const { getUserListings } = await import("@/actions/product");
          const { getUserProfile } = await import("@/actions/user");
          const [listings, sub, profile] = await Promise.all([
            getUserListings(user.uid),
            getSubscription(user.uid),
            getUserProfile(user.uid, user.uid),
          ]);
          setMyListings(listings || []);
          setSubscription(sub);
          setDbUser(profile);
        } catch (err) {
          console.error("Dashboard data fetch failed:", err);
        } finally {
          setListingsLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [user]);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setFavoritesLoading(true);
    setFavoritesError(null);
    try {
      const items = await getWishlist(user.uid);
      setFavorites(items || []);
    } catch (err) {
      console.error("Favorites fetch failed:", err);
      setFavoritesError("Could not load your saved items. Please try again.");
    } finally {
      setFavoritesLoading(false);
    }
  }, [user]);

  const fetchOffers = useCallback(async () => {
    if (!user) return;
    setOffersLoading(true);
    try {
      const { getUserOffers } = await import("@/actions/offer");
      const data = await getUserOffers(user.uid);
      setOffersData(data);
    } catch (err) {
      console.error("Offers fetch failed:", err);
    } finally {
      setOffersLoading(false);
    }
  }, [user]);

  const fetchRentals = useCallback(async () => {
    if (!user) return;
    setRentalsLoading(true);
    try {
      const { getUserRentals } = await import("@/actions/rental");
      const data = await getUserRentals(user.uid);
      setRentalsData(data);
    } catch (err) {
      console.error("Rentals fetch failed:", err);
    } finally {
      setRentalsLoading(false);
    }
  }, [user]);

  const handleWishlistChange = useCallback((productId: string, added: boolean) => {
    if (!added) {
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
    }
  }, []);

  useEffect(() => {
    if (activeTab === "favorites" && user) {
      fetchFavorites();
    } else if (activeTab === "offers" && user) {
      fetchOffers();
    } else if (activeTab === "rentals" && user) {
      fetchRentals();
    }
  }, [activeTab, user, fetchFavorites, fetchOffers, fetchRentals]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = dbUser?.name || user.displayName || user.email?.split("@")[0] || "Campus Member";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";
  const memberSince = dbUser?.createdAt
    ? format(new Date(dbUser.createdAt), "MMM yyyy")
    : "Recent";

  const isVerified =
    dbUser?.isVerified === true ||
    dbUser?.verificationLevel === "CAMPUS" ||
    dbUser?.verificationLevel === "VERIFIED" ||
    dbUser?.verificationLevel === "BUSINESS";

  const verificationLabel =
    dbUser?.verificationLevel === "CAMPUS"
      ? "Campus Verified"
      : isVerified
      ? "Identity Verified"
      : "Unverified Member";

  const collegeName = dbUser?.profile?.collegeName;
  const course = dbUser?.profile?.course;
  const completedDeals = typeof dbUser?.profile?.successfulDeals === "number" ? dbUser.profile.successfulDeals : 0;
  const profileCompleted = isProfileComplete || dbUser?.isProfileCompleted;

  const filteredListings = myListings.filter((product) => {
    if (listingFilter === "ALL") return true;
    return product.status === listingFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 1. Header Profile Identity Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white dark:border-gray-800 shadow-md overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0">
              {dbUser?.image || user.photoURL ? (
                <img
                  src={dbUser?.image || user.photoURL}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-3xl font-bold uppercase">
                  {avatarLetter}
                </div>
              )}
              <Link
                href="/settings"
                className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border border-white dark:border-gray-800 shadow hover:scale-110 transition"
                title="Edit Profile Photo"
              >
                <Edit2 size={12} />
              </Link>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {displayName}
                </h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                    <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                    {verificationLabel}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                    Student Member
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-600 dark:text-gray-400">
                {collegeName ? (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" />
                    {collegeName}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" />
                    Campus Member
                  </span>
                )}
                {course && <span>• {course}</span>}
                <span>• Joined {memberSince}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            <Link
              href={`/profile/${user.uid}`}
              className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-zinc-200 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition inline-flex items-center gap-1"
            >
              Public Profile <ChevronRight size={14} />
            </Link>
            <Link
              href="/settings"
              className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition inline-flex items-center gap-1"
            >
              <Settings size={14} /> Settings
            </Link>
          </div>
        </div>

        {/* 2. Profile Completion Bar if not complete */}
        {!profileCompleted && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Complete Your Student Profile
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Add your verified university name and course details to publish ads and unlock buyer trust.
                </p>
              </div>
            </div>
            <Link
              href="/complete-profile?redirect=/profile"
              className="self-start sm:self-auto px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition inline-flex items-center gap-1.5 shadow-sm shrink-0"
            >
              Complete Now <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* 3. Real Evidence Strip */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
            <div className="text-lg font-black text-gray-900 dark:text-white">
              {myListings.length}
            </div>
            <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Total Ads</div>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
            <div className="text-lg font-black text-gray-900 dark:text-white">
              {completedDeals}
            </div>
            <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Completed Deals</div>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 size={16} />
              {isVerified ? "Verified" : "Member"}
            </div>
            <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Campus Status</div>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
            <div className="text-lg font-black text-gray-900 dark:text-white">
              {subscription?.status === "ACTIVE" ? subscription.planType : "Standard"}
            </div>
            <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Listing Tier</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-2 shadow-sm">
            <nav className="flex flex-col space-y-1 text-xs">
              <button
                onClick={() => setActiveTab("listings")}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold transition-colors text-left ${
                  activeTab === "listings"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2.5"><Package size={16} /> My Listings</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 font-bold">
                  {myListings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("favorites")}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold transition-colors text-left ${
                  activeTab === "favorites"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2.5"><Heart size={16} /> Saved Items</span>
                {favorites.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 font-bold">
                    {favorites.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("offers")}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold transition-colors text-left ${
                  activeTab === "offers"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2.5"><Handshake size={16} /> Offers</span>
              </button>

              <button
                onClick={() => setActiveTab("rentals")}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold transition-colors text-left ${
                  activeTab === "rentals"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2.5"><Clock size={16} /> Rentals</span>
              </button>

              <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />

              <button
                onClick={() => setActiveTab("billing")}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold transition-colors text-left ${
                  activeTab === "billing"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2.5"><CreditCard size={16} /> Plan & Billing</span>
              </button>

              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold transition-colors text-left"
              >
                <Settings size={16} /> Account Settings
              </Link>

              <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 font-bold transition-colors text-left"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </div>

          {/* Membership Tier Card */}
          <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Crown size={48} />
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Account Tier</p>
            <h3 className="text-base font-bold mb-3 flex items-center gap-1.5">
              {subscription?.planType || "Standard Free"}
              {subscription?.status === "ACTIVE" && <ShieldCheck size={14} className="text-emerald-400" />}
            </h3>

            {subscription?.status === "ACTIVE" ? (
              <p className="text-xs text-gray-400 mb-4">
                Active until {format(new Date(subscription.expiryDate), "dd MMM yyyy")}.
              </p>
            ) : (
              <p className="text-xs text-gray-400 mb-4">
                Basic campus membership with standard ad placement.
              </p>
            )}

            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="w-full py-2 bg-white text-gray-900 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition"
            >
              {subscription?.status === "ACTIVE" ? "Manage Plan" : "Explore Plans"}
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB: MY LISTINGS */}
          {activeTab === "listings" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    My Listings ({myListings.length})
                  </h3>
                  <p className="text-xs text-gray-500">
                    Manage your active, pending, and completed items.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl bg-gray-100 dark:bg-zinc-800 p-1 text-[11px] font-bold">
                    {(['ALL', 'LIVE', 'PENDING', 'SOLD'] as const).map((filter) => (
<button
  key={filter}
  onClick={() => setListingFilter(filter)}
  className={`px-2.5 py-1 rounded-lg transition ${
    listingFilter === filter
      ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-white"
      : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
  }`}
>
  {filter}
</button>
                    ))}
                  </div>
                  <Link
                    href="/sell"
                    className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition shadow-sm"
                  >
                    + Post Ad
                  </Link>
                </div>
              </div>

              {listingsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredListings.map((product) => (
                    <ProductCard
key={product.id}
id={product.id}
title={product.title}
price={product.price}
image={product.images?.[0] || ""}

createdAt={product.createdAt}
isUrgent={product.isUrgent}
listingType={product.listingType}
condition={product.condition}
isVerified={isVerified}
categoryId={product.categoryId}
subcategoryId={product.subcategoryId || ""}
sellerId={product.sellerId}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-2xl">
                  <Package size={40} className="mx-auto text-gray-300 mb-3" />
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {listingFilter === "ALL" ? "No listings posted yet" : `No ${listingFilter.toLowerCase()} listings`}
                  </h4>
                  <p className="text-xs text-gray-500 mb-5 max-w-sm mx-auto leading-relaxed">
                    Clear out items you no longer need and sell them safely to other students around your campus.
                  </p>
                  <Link
                    href="/sell"
                    className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition inline-block shadow-sm"
                  >
                    Start Selling
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB: SAVED ITEMS / WISHLIST */}
          {activeTab === "favorites" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Saved Items {favorites.length > 0 && `(${favorites.length})`}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Items you have bookmarked to check back on later.
                  </p>
                </div>
                <button
                  onClick={fetchFavorites}
                  disabled={favoritesLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  <RefreshCw size={13} className={favoritesLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {favoritesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : favoritesError ? (
                <div className="text-center py-10 border-2 border-dashed border-red-200 dark:border-red-900/40 rounded-2xl bg-red-50/40 dark:bg-red-950/10">
                  <AlertCircle size={36} className="mx-auto text-red-400 mb-2" />
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Could not load saved items</h4>
                  <p className="text-xs text-gray-500 mb-4">{favoritesError}</p>
                  <button
                    onClick={fetchFavorites}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition inline-flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} /> Try Again
                  </button>
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {favorites.map((product) => (
                    <ProductCard
key={product.id}
id={product.id}
title={product.title}
price={product.price}
image={product.images?.[0] || ""}

createdAt={product.createdAt}
isUrgent={product.isUrgent}
listingType={product.listingType}
condition={product.condition}
isVerified={product.seller?.isVerified || false}
categoryId={product.categoryId}
subcategoryId={product.subcategoryId || ""}
sellerId={product.sellerId}
isWishlisted={true}
onWishlistToggle={handleWishlistChange}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-2xl">
                  <Heart size={40} className="mx-auto text-gray-300 mb-3" />
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No saved items</h4>
                  <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                    Tap the heart button on any listing card to save items you are interested in.
                  </p>
                  <Link
                    href="/search"
                    className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition inline-block shadow-sm"
                  >
                    Explore Campus Marketplace
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB: OFFERS & PROPOSALS */}
          {activeTab === "offers" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Offers & Counteroffers
                </h3>
                <p className="text-xs text-gray-500">
                  Real negotiation records between student buyers and sellers.
                </p>
              </div>

              {offersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Received Offers */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
Received Offers ({offersData.received.length})
                    </h4>
                    {offersData.received.length > 0 ? (
<div className="space-y-2.5">
  {offersData.received.map((offer) => (
    <div
      key={offer.id}
      className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
    >
      <div>
        <span className="font-bold text-gray-900 dark:text-white block">
          {offer.product?.title || "Listing"}
        </span>
        <span className="text-gray-500">
          Offered: <strong className="text-gray-900 dark:text-white font-bold">₹{offer.price?.toLocaleString("en-IN")}</strong> (Listed at ₹{offer.product?.price?.toLocaleString("en-IN")})
        </span>
        {offer.message && (
          <p className="mt-1 text-gray-600 dark:text-gray-400 italic">"{offer.message}"</p>
        )}
      </div>
      <span className={`self-start sm:self-center px-2.5 py-1 rounded-full font-bold text-[10px] tracking-wide uppercase ${
        offer.status === "ACCEPTED"
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          : offer.status === "REJECTED"
          ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
      }`}>
        {offer.status}
      </span>
    </div>
  ))}
</div>
                    ) : (
<p className="text-xs text-gray-400 italic py-2">No incoming offers received yet.</p>
                    )}
                  </div>

                  {/* Sent Offers */}
                  <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
Sent Offers ({offersData.sent.length})
                    </h4>
                    {offersData.sent.length > 0 ? (
<div className="space-y-2.5">
  {offersData.sent.map((offer) => (
    <div
      key={offer.id}
      className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
    >
      <div>
        <span className="font-bold text-gray-900 dark:text-white block">
          {offer.product?.title || "Listing"}
        </span>
        <span className="text-gray-500">
          Your Offer: <strong className="text-gray-900 dark:text-white font-bold">₹{offer.price?.toLocaleString("en-IN")}</strong>
        </span>
      </div>
      <span className={`self-start sm:self-center px-2.5 py-1 rounded-full font-bold text-[10px] tracking-wide uppercase ${
        offer.status === "ACCEPTED"
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          : offer.status === "REJECTED"
          ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
      }`}>
        {offer.status}
      </span>
    </div>
  ))}
</div>
                    ) : (
<p className="text-xs text-gray-400 italic py-2">You have not made any price offers yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: RENTALS */}
          {activeTab === "rentals" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Rental Requests & Items
                </h3>
                <p className="text-xs text-gray-500">
                  Rental periods, deposits, and status tracking.
                </p>
              </div>

              {rentalsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
Items You Put For Rent ({rentalsData.owned.length})
                    </h4>
                    {rentalsData.owned.length > 0 ? (
<div className="space-y-2.5">
  {rentalsData.owned.map((rental) => (
    <div
      key={rental.id}
      className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
    >
      <div>
        <span className="font-bold text-gray-900 dark:text-white block">
          {rental.product?.title}
        </span>
        <span className="text-gray-500">
          Renter: {rental.renter?.name || "Student"} • Deposit: ₹{rental.securityDeposit}
        </span>
      </div>
      <span className="px-2.5 py-1 rounded-full font-bold text-[10px] uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
        {rental.status}
      </span>
    </div>
  ))}
</div>
                    ) : (
<p className="text-xs text-gray-400 italic py-2">No items currently rented out.</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
Items You Borrowed / Requested ({rentalsData.rented.length})
                    </h4>
                    {rentalsData.rented.length > 0 ? (
<div className="space-y-2.5">
  {rentalsData.rented.map((rental) => (
    <div
      key={rental.id}
      className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
    >
      <div>
        <span className="font-bold text-gray-900 dark:text-white block">
          {rental.product?.title}
        </span>
        <span className="text-gray-500">
          Owner: {rental.owner?.name || "Student"}
        </span>
      </div>
      <span className="px-2.5 py-1 rounded-full font-bold text-[10px] uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
        {rental.status}
      </span>
    </div>
  ))}
</div>
                    ) : (
<p className="text-xs text-gray-400 italic py-2">No active rental requests made.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: BILLING & SUBSCRIPTIONS */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Subscription Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl text-xs">
                    <p className="text-gray-500 mb-1">Active Plan</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
{subscription?.planType || "Standard Campus Member"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl text-xs">
                    <p className="text-gray-500 mb-1">Status</p>
                    <p className={`font-bold text-sm ${subscription?.status === 'ACTIVE' ? 'text-emerald-500' : 'text-gray-600 dark:text-gray-400'}`}>
{subscription?.status || "Standard"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Payment History</h3>
                <BillingHistory />
              </div>
            </div>
          )}
        </div>
      </div>

      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
