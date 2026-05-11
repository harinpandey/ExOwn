"use client";

import { ShieldCheck, Star, Clock, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface SellerCardProps {
  seller: any;
  productId: string;
}

export default function SellerCard({ seller, productId }: SellerCardProps) {
  if (!seller) return null;

  const profile = seller.profile || {};
  const rating = profile.rating || 0;
  const deals = profile.successfulDeals || 0;
  const successRate = profile.successRate || 0;
  const responseTime = profile.avgResponseTime ? `${profile.avgResponseTime}m` : "Quick";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Seller Information</h3>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          seller.verificationLevel === 'CAMPUS' ? 'bg-blue-100 text-blue-600' : 
          seller.verificationLevel === 'BUSINESS' ? 'bg-purple-100 text-purple-600' : 
          'bg-gray-100 text-gray-600'
        }`}>
          {seller.verificationLevel} Tier
        </div>
      </div>

      <div className="flex items-start gap-6 mb-8">
        <div className="relative group">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-gray-50 dark:border-gray-800 shadow-inner">
            {seller.image ? (
              <img src={seller.image} alt={seller.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            ) : (
              <span className="text-3xl font-black text-primary">{seller.name?.[0] || "S"}</span>
            )}
          </div>
          {seller.isVerified && (
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
              <ShieldCheck size={18} className="text-blue-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-black text-xl text-gray-900 dark:text-white truncate">{seller.name}</h4>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-lg text-xs font-black">
              <Star size={12} fill="currentColor" />
              {rating > 0 ? rating.toFixed(1) : "New"}
            </div>
            <span className="text-xs font-bold text-gray-400">
              {deals} Successful Deals
            </span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400">
            Member Since {format(new Date(seller.createdAt), "MMM yyyy")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Response</p>
          <div className="flex items-center justify-center gap-1 text-gray-900 dark:text-white">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-black">{responseTime}</span>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Success</p>
          <p className="text-sm font-black text-primary">{successRate}%</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Trust</p>
          <p className="text-sm font-black text-emerald-500">{seller.trustScore}/100</p>
        </div>
      </div>

      <div className="space-y-3">
        <Link 
          href={`/chat/${seller.id}?product=${productId}`}
          className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
        >
          <MessageSquare size={20} /> Chat with Seller
        </Link>
        <Link 
          href={`/profile/${seller.id}`}
          className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-black text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-3"
        >
          <ExternalLink size={20} /> View Profile
        </Link>
      </div>
    </div>
  );
}
