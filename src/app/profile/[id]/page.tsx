"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { ShieldCheck, Star, Package, MapPin, Calendar } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { getUserProfile } = await import("@/actions/user");
        const { getUserListings } = await import("@/actions/product");
        
        const [userData, userListings] = await Promise.all([
          getUserProfile(id),
          getUserListings(id)
        ]);
        
        setProfile(userData);
        setListings(userListings);
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
      <div className="container mx-auto px-4 py-8 max-w-5xl flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <p className="text-gray-500 mb-8">The profile you are looking for doesn't exist or has been removed.</p>
        <button onClick={() => window.history.back()} className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const displayName = profile.name || profile.email?.split('@')[0] || "User";
  const avatarLetter = displayName[0].toUpperCase();
  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });


  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
            
            <div className="relative mx-auto w-24 h-24 bg-white dark:bg-gray-800 rounded-full p-1 mt-8 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl font-bold uppercase">
                {avatarLetter}
              </div>
            </div>
            
            <h2 className="text-xl font-bold flex items-center justify-center gap-2 mb-1">
              {displayName}
              {profile.isVerified && <ShieldCheck size={18} className="text-blue-500" />}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {profile.profile?.course || "Student"} • Batch of {profile.profile?.batch || "N/A"}
            </p>
            
            <div className="flex flex-col gap-3 mb-6 text-left text-sm text-gray-600 dark:text-gray-400 border-t border-b border-gray-100 dark:border-gray-800 py-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>{profile.profile?.hostel || "LPU Campus"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 text-sm font-medium">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                  {profile.profile?.rating || 0} <Star size={18} className="text-yellow-500 fill-yellow-500" />
                </div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mt-1">Rating</div>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-800"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.profile?.successfulDeals || 0}</div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mt-1">Deals</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Package size={24} className="text-primary" /> Active Ads by {displayName.split(' ')[0]}
            </h3>
            
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    isVerified={profile.isVerified}
                    categoryId={product.categoryId}
                    subcategoryId={product.subcategoryId || ""}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No active ads at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
