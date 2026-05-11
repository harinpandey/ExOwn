"use client";

import { useState } from "react";
import { MessageSquare, Tag, MapPin, Clock, Phone, ShieldCheck, BarChart2, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useCompare } from "@/context/CompareContext";
import { useRouter } from "next/navigation";

import RentNowModal from "./RentNowModal";
import RequestQuoteModal from "./RequestQuoteModal";

interface PricingCardProps {
  product: any;
}

export default function PricingCard({ product }: PricingCardProps) {
  const { user, isProfileComplete } = useAuth();
  const { toggleCompare, isInCompare } = useCompare();
  const router = useRouter();
  const [offerMode, setOfferMode] = useState(false);
  const [offerAmount, setOfferAmount] = useState(product.price.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const isRental = product.listingType === "RENT";
  const isService = product.listingType === "SERVICE";
  
  const seller = product?.seller;
  const isVerified = seller?.isVerified || false;

  const handleMakeOffer = async () => {
    if (!user) {
      router.push(`/login?redirect=/product/${product.id}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { sendMessage } = await import("@/actions/chat");
      const message = `Hi, I'm interested in your "${product.title}". My offer is ₹${offerAmount}${isRental ? "/day" : ""}.`;
      await sendMessage(user.uid, seller?.id, message);
      router.push(`/chat/${seller?.id}`);
    } catch (err) {
      console.error("Failed to send offer:", err);
      toast.error("Failed to send offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-10 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
          isRental ? "bg-yellow-400 text-gray-900" : isService ? "bg-purple-500 text-white" : "bg-primary text-white"
        }`}>
          {isRental ? "Rental" : isService ? "Service" : "For Sale"}
        </span>
        {seller?.isTrustedSeller && (
          <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={12} /> Trusted Seller
          </span>
        )}
        {seller?.verificationLevel === "CAMPUS" && (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck size={12} /> Campus Verified
          </span>
        )}
        {seller?.verificationLevel === "BUSINESS" && (
          <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck size={12} /> Verified Business
          </span>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-black mb-4 text-gray-900 dark:text-white leading-tight">
        {product.title}
      </h1>
      <div className="text-5xl font-black text-primary mb-8 flex items-baseline gap-1">
        ₹{product.price.toLocaleString("en-IN")}
        {isRental && <span className="text-lg text-gray-500 font-medium">/day</span>}
        {isService && <span className="text-lg text-gray-500 font-medium"> starting</span>}
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold">
          {isService ? (product.serviceDetail?.experience || "Expert") : (product.condition === "NEW" ? "Brand New" : "Used Item")}
        </span>
        {product.isNegotiable && (
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-bold flex items-center gap-2">
            <Tag size={16} /> Negotiable
          </span>
        )}
      </div>

      <div className="space-y-6 mb-10 border-y border-gray-100 dark:border-gray-800 py-6">
        <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <MapPin size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{isService ? "Service Area" : "Pickup Location"}</p>
            <p className="font-bold text-lg">{product.pickupLocation}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Clock size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Response Time</p>
            <p className="font-bold text-lg">{seller?.profile?.avgResponseTime || "Quick Responder"}</p>
          </div>
          <div className="text-center px-4 border-l border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Success</p>
            <p className="font-black text-2xl text-primary">{seller?.profile?.successRate || 0}%</p>
          </div>
          <div className="text-right pl-4 border-l border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Trust</p>
            <p className="font-black text-2xl text-emerald-500">{seller?.trustScore ?? "N/A"}/100</p>
          </div>
        </div>
      </div>

      {!offerMode ? (
        <div className="grid grid-cols-1 gap-4">
          {isService ? (
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
            >
              <MessageSquare size={24} /> Request Quote
            </button>
          ) : isRental ? (
            <button
              onClick={() => setIsRentModalOpen(true)}
              className="w-full py-4 bg-yellow-400 text-gray-900 rounded-2xl font-black text-xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-yellow-500/20"
            >
              <Calendar size={24} /> Rent Now
            </button>
          ) : (
            <Link
              href={!user ? `/login?redirect=/product/${product.id}` : !isProfileComplete ? "/complete-profile" : `/chat/${seller?.id}?product=${product.id}`}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
            >
              <MessageSquare size={24} /> Chat with Seller
            </Link>
          )}
          
          <button 
            onClick={() => toggleCompare(product.id)}
            className={`w-full py-4 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 border-4 ${
              isInCompare(product.id)
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
            }`}
          >
            <BarChart2 size={24} /> {isInCompare(product.id) ? "In Comparison" : "Compare"}
          </button>
          
          {!isService && !isRental && (
            <button 
              onClick={() => {
                if (!isProfileComplete) {
                  router.push("/complete-profile");
                  return;
                }
                setOfferMode(true);
              }}
              className="w-full py-4 bg-white dark:bg-gray-800 text-primary border-4 border-primary rounded-2xl font-black text-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Make an Offer
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border-4 border-primary/20">
          <label className="block text-sm font-black uppercase tracking-wider mb-2">Your Offer (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500 font-bold text-xl">₹</span>
            <input 
              type="number" 
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-4 focus:ring-primary/20 text-2xl font-black"
              placeholder="0"
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleMakeOffer}
              disabled={isSubmitting}
              className="flex-1 py-4 bg-primary text-white rounded-xl font-black text-lg hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Submit Offer"}
            </button>
            <button 
              onClick={() => setOfferMode(false)}
              className="px-6 py-4 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-black text-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <RentNowModal product={product} isOpen={isRentModalOpen} onClose={() => setIsRentModalOpen(false)} />
      <RequestQuoteModal product={product} isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
}
