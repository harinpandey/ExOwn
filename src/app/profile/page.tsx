"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Package, Heart, Settings, ShieldCheck, Star, LogOut, Edit2 } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

export default function ProfileDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "favorites" | "settings">("listings");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchListings = async () => {
        try {
          const { getUserListings } = await import("@/actions/product");
          const listings = await getUserListings(user.uid);
          setMyListings(listings);
        } catch (err) {
          console.error("Failed to fetch listings:", err);
        } finally {
          setListingsLoading(false);
        }
      };
      fetchListings();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      if (auth) {
        await signOut(auth);
        router.push("/");
      }
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = user.displayName || user.email?.split("@")[0] || "User";
  const avatarLetter = displayName[0].toUpperCase();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* User Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-secondary/20"></div>

            <div className="relative mx-auto w-24 h-24 bg-white dark:bg-gray-800 rounded-full p-1 mt-8 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {avatarLetter}
                </div>
              )}
              <Link href="/settings" className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm hover:scale-110 transition-transform">
                <Edit2 size={12} />
              </Link>
            </div>

            <h2 className="text-xl font-bold flex items-center justify-center gap-2">
              {displayName}
              <ShieldCheck size={18} className="text-blue-500" />
            </h2>
            <p className="text-sm text-gray-500 mb-4">{user.email}</p>

            <div className="flex justify-center gap-4 text-sm font-medium border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                  4.9 <Star size={16} className="text-yellow-500 fill-yellow-500" />
                </div>
                <div className="text-gray-500 text-xs">Rating</div>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-800"></div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {myListings.length}
                </div>
                <div className="text-gray-500 text-xs">Listings</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-2 shadow-sm">
            <nav className="flex flex-col space-y-1">
              <button
                onClick={() => setActiveTab("listings")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors text-left ${
                  activeTab === "listings"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Package size={20} /> My Listings
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                  activeTab === "favorites"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Heart size={20} /> Favorites
              </button>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors text-left"
              >
                <Settings size={20} /> Account Settings
              </Link>
              <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-4"></div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 transition-colors text-left"
              >
                <LogOut size={20} /> Sign Out
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === "listings" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">My Active Listings</h3>
                <Link
                  href="/sell"
                  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  + New Ad
                </Link>
              </div>

              {listingsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : myListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {myListings.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      image={product.images?.[0] || ""}
                      location={product.pickupLocation}
                      createdAt={product.createdAt}
                      isUrgent={product.isUrgent}
                      isVerified={product.seller.isVerified}
                      categoryId={product.categoryId}
                      subcategoryId={product.subcategoryId || ""}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No active listings</h4>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    You haven't listed any items for sale yet. Start selling to clear out your room and make money!
                  </p>
                  <Link
                    href="/sell"
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors inline-block"
                  >
                    Post an Ad Now
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Saved Items</h3>
              <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                <h4 className="text-lg font-semibold mb-2">No saved items</h4>
                <p className="text-gray-500 mb-6">Items you heart will appear here.</p>
                <Link href="/search" className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors inline-block">
                  Browse Items
                </Link>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-semibold">Display Name</p>
                    <p className="text-sm text-gray-500">{displayName}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Verified</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <div>
                    <p className="font-semibold">Sign in method</p>
                    <p className="text-sm text-gray-500">Google</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
