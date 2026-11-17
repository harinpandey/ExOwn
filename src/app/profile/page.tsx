"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  Package, Heart, Settings, ShieldCheck, LogOut,
  Edit2, CreditCard, Crown, Clock, RefreshCw,
  AlertCircle, ArrowRight, CheckCircle2, ChevronRight, Handshake, MapPin, MessageSquare
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import UpgradePlanModal from "@/components/dashboard/UpgradePlanModal";
import BillingHistory from "@/components/dashboard/BillingHistory";
import { getSubscription } from "@/actions/subscription";
import { getWishlist } from "@/actions/wishlist";
import { format } from "date-fns";
import toast from "react-hot-toast";

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
  const [offerActionId, setOfferActionId] = useState<string | null>(null);
  const [exchangeOffersData, setExchangeOffersData] = useState<{ received: any[]; sent: any[] }>({ received: [], sent: [] });
  const [exchangeOffersLoading, setExchangeOffersLoading] = useState(false);
  const [exchangeView, setExchangeView] = useState<"RECEIVED" | "SENT">("RECEIVED");
  const [exchangeActionId, setExchangeActionId] = useState<string | null>(null);
  const [serviceQuotesData, setServiceQuotesData] = useState<{ received: any[]; sent: any[] }>({ received: [], sent: [] });
  const [serviceQuotesLoading, setServiceQuotesLoading] = useState(false);
  const [serviceQuoteView, setServiceQuoteView] = useState<"RECEIVED" | "SENT">("RECEIVED");
  const [serviceQuoteActionId, setServiceQuoteActionId] = useState<string | null>(null);

  const [rentalsData, setRentalsData] = useState<{ owned: any[]; rented: any[] }>({ owned: [], rented: [] });
  const [rentalsLoading, setRentalsLoading] = useState(false);
  const [rentalActionId, setRentalActionId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"listings" | "favorites" | "offers" | "exchanges" | "serviceQuotes" | "rentals" | "billing" | "settings">("listings");
  const [listingFilter, setListingFilter] = useState<"ALL" | "LIVE" | "SOLD" | "PENDING">("ALL");
  const [subscription, setSubscription] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [user, loading, router]);

  // Direct links from exchange notifications open the correct profile inbox tab.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const view = params.get("view")?.toUpperCase();
    if (tab === "exchanges") {
      setActiveTab("exchanges");
      if (view === "SENT" || view === "RECEIVED") setExchangeView(view);
    } else if (tab === "serviceQuotes") {
      setActiveTab("serviceQuotes");
      if (view === "SENT" || view === "RECEIVED") setServiceQuoteView(view);
    }
  }, []);

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

  const handleOfferDecision = async (offerId: string, status: "ACCEPTED" | "REJECTED") => {
    if (!user || offerActionId) return;
    setOfferActionId(offerId);
    try {
      const { updateOfferStatus } = await import("@/actions/offer");
      const result = await updateOfferStatus(offerId, user.uid, status);
      if (!result.success) {
        toast.error(result.error || "Unable to update this offer.");
        return;
      }
      toast.success(status === "ACCEPTED" ? "Price offer accepted." : "Price offer declined.");
      await fetchOffers();
    } catch (error) {
      console.error("[Profile] Price offer action failed:", error);
      toast.error("Unable to update this offer. Please try again.");
    } finally {
      setOfferActionId(null);
    }
  };

  const fetchExchangeOffers = useCallback(async () => {
    if (!user) return;
    setExchangeOffersLoading(true);
    try {
      const { getExchangeOffers } = await import("@/actions/exchange");
      const [received, sent] = await Promise.all([
        getExchangeOffers(user.uid, "RECEIVED"),
        getExchangeOffers(user.uid, "SENT"),
      ]);
      setExchangeOffersData({
        received: Array.isArray(received) ? received : [],
        sent: Array.isArray(sent) ? sent : [],
      });
    } catch (error) {
      console.error("Exchange offers fetch failed:", error);
      toast.error("Could not load exchange proposals. Please try again.");
    } finally {
      setExchangeOffersLoading(false);
    }
  }, [user]);

  const fetchServiceQuotes = useCallback(async () => {
    if (!user) return;
    setServiceQuotesLoading(true);
    try {
      const { getServiceQuoteRequests } = await import("@/actions/service");
      const [received, sent] = await Promise.all([
        getServiceQuoteRequests(user.uid, "RECEIVED"),
        getServiceQuoteRequests(user.uid, "SENT"),
      ]);
      setServiceQuotesData({
        received: Array.isArray(received) ? received : [],
        sent: Array.isArray(sent) ? sent : [],
      });
    } catch (error) {
      console.error("Service quote requests fetch failed:", error);
      toast.error("Could not load service inquiries. Please try again.");
    } finally {
      setServiceQuotesLoading(false);
    }
  }, [user]);

  const handleServiceQuoteAction = async (quoteId: string, action: "REPLIED" | "CANCEL") => {
    if (!user || serviceQuoteActionId) return;
    setServiceQuoteActionId(quoteId);
    try {
      const serviceActions = await import("@/actions/service");
      const result = action === "REPLIED"
        ? await serviceActions.markServiceQuoteReplied(quoteId, user.uid)
        : await serviceActions.cancelServiceQuoteRequest(quoteId, user.uid);

      if (!result.success) {
        toast.error(result.error || "Unable to update this service inquiry.");
        return;
      }
      toast.success(action === "REPLIED" ? "Inquiry marked as replied." : "Inquiry cancelled.");
      await fetchServiceQuotes();
    } catch (error) {
      console.error("Service quote action failed:", error);
      toast.error("Unable to update this service inquiry. Please try again.");
    } finally {
      setServiceQuoteActionId(null);
    }
  };

  const handleExchangeDecision = async (offerId: string, status: "ACCEPTED" | "REJECTED") => {
    if (!user || exchangeActionId) return;
    setExchangeActionId(offerId);
    try {
      const { respondToExchangeOffer } = await import("@/actions/exchange");
      const result = await respondToExchangeOffer(user.uid, offerId, status);
      if (!result.success) {
        toast.error(result.error || "Unable to update exchange proposal.");
        return;
      }
      toast.success(status === "ACCEPTED" ? "Exchange proposal accepted." : "Exchange proposal declined.");
      await fetchExchangeOffers();
    } catch (error) {
      console.error("Exchange proposal decision failed:", error);
      toast.error("Unable to update exchange proposal. Please try again.");
    } finally {
      setExchangeActionId(null);
    }
  };

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

  const handleRentalAction = async (rentalId: string, action: "APPROVE" | "RETURN" | "CANCEL") => {
    if (!user || rentalActionId) return;
    setRentalActionId(rentalId);
    try {
      const rentalActions = await import("@/actions/rental");
      const result = action === "APPROVE"
        ? await rentalActions.approveRental(rentalId, user.uid)
        : action === "RETURN"
        ? await rentalActions.markRentalReturned(rentalId, user.uid)
        : await rentalActions.cancelRentalRequest(rentalId, user.uid);

      if (!result.success) {
        toast.error(result.error || "Unable to update this rental.");
        return;
      }

      toast.success(
        action === "APPROVE" ? "Rental request approved."
          : action === "RETURN" ? "Item marked as returned."
          : "Rental request cancelled."
      );
      await fetchRentals();
    } catch (error) {
      console.error("[Profile] Rental action failed:", error);
      toast.error("Unable to update this rental. Please try again.");
    } finally {
      setRentalActionId(null);
    }
  };

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
    } else if (activeTab === "exchanges" && user) {
      fetchExchangeOffers();
    } else if (activeTab === "serviceQuotes" && user) {
      fetchServiceQuotes();
    } else if (activeTab === "rentals" && user) {
      fetchRentals();
    }
  }, [activeTab, user, fetchFavorites, fetchOffers, fetchExchangeOffers, fetchServiceQuotes, fetchRentals]);

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
                onClick={() => setActiveTab("exchanges")}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold transition-colors text-left ${
                  activeTab === "exchanges"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2.5"><RefreshCw size={16} /> Exchange Offers</span>
                {exchangeOffersData.received.filter((offer) => offer.status === "PENDING").length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    {exchangeOffersData.received.filter((offer) => offer.status === "PENDING").length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("serviceQuotes")}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold transition-colors text-left ${
                  activeTab === "serviceQuotes"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2.5"><MessageSquare size={16} /> Service Requests</span>
                {serviceQuotesData.received.filter((quote) => quote.status === "PENDING").length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    {serviceQuotesData.received.filter((quote) => quote.status === "PENDING").length}
                  </span>
                )}
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
      <div className="min-w-0 flex-1">
        <span className="block font-bold text-gray-900 dark:text-white">
          {offer.product?.title || "Listing"}
        </span>
        <span className="text-gray-500">
          Offered: <strong className="font-bold text-gray-900 dark:text-white">₹{offer.price?.toLocaleString("en-IN")}</strong> (Listed at ₹{offer.product?.price?.toLocaleString("en-IN")})
        </span>
        {offer.message && (
          <p className="mt-1 text-gray-600 dark:text-gray-400 italic">"{offer.message}"</p>
        )}
        <p className="mt-1 text-[10px] text-gray-400">{format(new Date(offer.createdAt), "dd MMM yyyy")}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 font-bold text-[10px] tracking-wide uppercase ${
          offer.status === "ACCEPTED"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            : offer.status === "REJECTED"
            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
        }`}>
          {offer.status}
        </span>
        {offer.status === "PENDING" && (
          <>
            <button
              type="button"
              disabled={offerActionId === offer.id}
              onClick={() => handleOfferDecision(offer.id, "REJECTED")}
              className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-black text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300"
            >
              Decline
            </button>
            <button
              type="button"
              disabled={offerActionId === offer.id}
              onClick={() => handleOfferDecision(offer.id, "ACCEPTED")}
              className="rounded-lg bg-primary px-3 py-2 text-[10px] font-black text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {offerActionId === offer.id ? "Saving..." : "Accept"}
            </button>
          </>
        )}
      </div>
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

          {/* TAB: EXCHANGE PROPOSALS */}
          {activeTab === "exchanges" && (
            <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exchange Proposals</h3>
                  <p className="mt-1 text-xs text-gray-500">Review proposals for your listings or track the ones you sent.</p>
                </div>
                <div className="flex rounded-xl bg-gray-100 p-1 text-[11px] font-bold dark:bg-zinc-800">
                  <button
                    type="button"
                    onClick={() => setExchangeView("RECEIVED")}
                    className={`rounded-lg px-3 py-2 transition ${exchangeView === "RECEIVED" ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    Received ({exchangeOffersData.received.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setExchangeView("SENT")}
                    className={`rounded-lg px-3 py-2 transition ${exchangeView === "SENT" ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    Sent ({exchangeOffersData.sent.length})
                  </button>
                </div>
              </div>

              {exchangeOffersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (exchangeView === "RECEIVED" ? exchangeOffersData.received : exchangeOffersData.sent).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-14 text-center dark:border-white/10">
                  <RefreshCw size={30} className="mx-auto mb-3 text-gray-400" />
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">
                    {exchangeView === "RECEIVED" ? "No exchange proposals received" : "No exchange proposals sent"}
                  </h4>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
                    {exchangeView === "RECEIVED" ? "When another student proposes an exchange for one of your listings, it will appear here." : "When you propose an exchange for a campus listing, you can track its status here."}
                  </p>
                  <Link href="/search?exchange=true" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                    Explore exchange listings <ChevronRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(exchangeView === "RECEIVED" ? exchangeOffersData.received : exchangeOffersData.sent).map((offer) => (
                    <article key={offer.id} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-zinc-800/40">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-200 dark:bg-zinc-700">
                          {offer.offeredImages?.[0] ? (
                            <img src={offer.offeredImages[0]} alt={offer.offeredTitle} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-bold text-gray-400">No photo</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white">{offer.offeredTitle}</h4>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${offer.status === "ACCEPTED" || offer.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : offer.status === "REJECTED" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"}`}>
                              {offer.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            For <Link href={`/product/${offer.product.id}`} className="font-bold text-primary hover:underline">{offer.product.title}</Link>
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-gray-600 dark:text-gray-300">{offer.offeredDescription}</p>
                          {offer.cashDifference != null && offer.cashDifference > 0 && (
                            <p className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              Cash difference offered: ₹{offer.cashDifference.toLocaleString("en-IN")}
                            </p>
                          )}
                          <p className="mt-2 text-[10px] text-gray-400">
                            {exchangeView === "RECEIVED" ? `From ${offer.buyer?.name || "Campus member"}` : "Your proposal"} · {format(new Date(offer.createdAt), "dd MMM yyyy")}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Link href={`/chat/${exchangeView === "RECEIVED" ? offer.buyerId : offer.product.seller.id}?product=${offer.product.id}`} className="rounded-lg border border-gray-200 px-3 py-2 text-[11px] font-bold text-gray-700 hover:border-primary hover:text-primary dark:border-white/10 dark:text-gray-200">
                              Open chat
                            </Link>
                            {exchangeView === "RECEIVED" && offer.status === "PENDING" && (
                              <>
                                <button
                                  type="button"
                                  disabled={exchangeActionId === offer.id}
                                  onClick={() => handleExchangeDecision(offer.id, "REJECTED")}
                                  className="rounded-lg border border-red-200 px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300"
                                >
                                  Decline
                                </button>
                                <button
                                  type="button"
                                  disabled={exchangeActionId === offer.id}
                                  onClick={() => handleExchangeDecision(offer.id, "ACCEPTED")}
                                  className="rounded-lg bg-primary px-3 py-2 text-[11px] font-bold text-white hover:bg-primary-dark disabled:opacity-50"
                                >
                                  {exchangeActionId === offer.id ? "Updating..." : "Accept"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SERVICE QUOTE REQUESTS */}
          {activeTab === "serviceQuotes" && (
            <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Service Requests</h3>
                  <p className="mt-1 text-xs text-gray-500">Review inquiries for your services or track the quotes you requested.</p>
                </div>
                <div className="flex rounded-xl bg-gray-100 p-1 text-[11px] font-bold dark:bg-zinc-800">
                  <button
                    type="button"
                    onClick={() => setServiceQuoteView("RECEIVED")}
                    className={`rounded-lg px-3 py-2 transition ${serviceQuoteView === "RECEIVED" ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    Received ({serviceQuotesData.received.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceQuoteView("SENT")}
                    className={`rounded-lg px-3 py-2 transition ${serviceQuoteView === "SENT" ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    Sent ({serviceQuotesData.sent.length})
                  </button>
                </div>
              </div>

              {serviceQuotesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (serviceQuoteView === "RECEIVED" ? serviceQuotesData.received : serviceQuotesData.sent).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-14 text-center dark:border-white/10">
                  <MessageSquare size={30} className="mx-auto mb-3 text-gray-400" />
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">
                    {serviceQuoteView === "RECEIVED" ? "No service inquiries received" : "No service inquiries sent"}
                  </h4>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
                    {serviceQuoteView === "RECEIVED" ? "Student inquiries for your service listings will appear here." : "Your quote requests to campus service providers will appear here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(serviceQuoteView === "RECEIVED" ? serviceQuotesData.received : serviceQuotesData.sent).map((quote) => {
                    const product = quote.serviceDetail.product;
                    const partnerId = serviceQuoteView === "RECEIVED" ? quote.user.id : product.seller.id;
                    const partnerName = serviceQuoteView === "RECEIVED" ? quote.user.name : product.seller.name;
                    return (
                      <article key={quote.id} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-zinc-800/40">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-black text-gray-900 dark:text-white">{product.title}</h4>
                              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${quote.status === "REPLIED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : quote.status === "CANCELLED" ? "bg-gray-100 text-gray-500 dark:bg-zinc-700" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"}`}>
                                {quote.status}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-gray-500">{serviceQuoteView === "RECEIVED" ? "From" : "Provider"}: {partnerName || "Campus member"} · {format(new Date(quote.createdAt), "dd MMM yyyy")}</p>
                            <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-gray-700 dark:text-gray-300">{quote.content}</p>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <Link href={`/chat/${partnerId}?product=${product.id}`} className="rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-bold text-gray-700 hover:border-primary hover:text-primary dark:border-white/10 dark:text-gray-200">
                              Open chat
                            </Link>
                            {serviceQuoteView === "RECEIVED" && quote.status === "PENDING" && (
                              <button
                                type="button"
                                disabled={serviceQuoteActionId === quote.id}
                                onClick={() => handleServiceQuoteAction(quote.id, "REPLIED")}
                                className="rounded-lg bg-primary px-3 py-2 text-[10px] font-bold text-white hover:bg-primary-dark disabled:opacity-50"
                              >
                                {serviceQuoteActionId === quote.id ? "Saving..." : "Mark replied"}
                              </button>
                            )}
                            {serviceQuoteView === "SENT" && quote.status === "PENDING" && (
                              <button
                                type="button"
                                disabled={serviceQuoteActionId === quote.id}
                                onClick={() => handleServiceQuoteAction(quote.id, "CANCEL")}
                                className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300"
                              >
                                {serviceQuoteActionId === quote.id ? "Saving..." : "Cancel request"}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
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
      <div className="min-w-0">
        <span className="block font-bold text-gray-900 dark:text-white">
          {rental.product?.title}
        </span>
        <span className="text-gray-500">
          Renter: {rental.renter?.name || "Student"} • Deposit: ₹{rental.securityDeposit}
        </span>
        <p className="mt-1 text-[10px] text-gray-400">
          {format(new Date(rental.startDate), "dd MMM yyyy")} – {format(new Date(rental.endDate), "dd MMM yyyy")}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
          {rental.status}
        </span>
        {rental.status === "PENDING" && (
          <button
            type="button"
            disabled={rentalActionId === rental.id}
            onClick={() => handleRentalAction(rental.id, "APPROVE")}
            className="rounded-lg bg-primary px-3 py-2 text-[10px] font-black text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {rentalActionId === rental.id ? "Saving..." : "Approve"}
          </button>
        )}
        {rental.status === "ACTIVE" && (
          <button
            type="button"
            disabled={rentalActionId === rental.id}
            onClick={() => handleRentalAction(rental.id, "RETURN")}
            className="rounded-lg border border-emerald-200 px-3 py-2 text-[10px] font-black text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-900/50 dark:text-emerald-300"
          >
            {rentalActionId === rental.id ? "Saving..." : "Mark returned"}
          </button>
        )}
      </div>
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
      <div className="min-w-0">
        <span className="block font-bold text-gray-900 dark:text-white">
          {rental.product?.title}
        </span>
        <span className="text-gray-500">
          Owner: {rental.owner?.name || "Student"}
        </span>
        <p className="mt-1 text-[10px] text-gray-400">
          {format(new Date(rental.startDate), "dd MMM yyyy")} – {format(new Date(rental.endDate), "dd MMM yyyy")}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
          {rental.status}
        </span>
        {rental.status === "PENDING" && (
          <button
            type="button"
            disabled={rentalActionId === rental.id}
            onClick={() => handleRentalAction(rental.id, "CANCEL")}
            className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-black text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300"
          >
            {rentalActionId === rental.id ? "Saving..." : "Cancel request"}
          </button>
        )}
      </div>
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
