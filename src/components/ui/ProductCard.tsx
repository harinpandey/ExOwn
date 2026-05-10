"use client";

import Link from "next/link";
import { Heart, MapPin, Clock, ShieldCheck, Tag, BarChart2, Eye, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCompare } from "@/context/CompareContext";
import { motion, AnimatePresence } from "framer-motion";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  location: string;
  createdAt: Date;
  isUrgent?: boolean;
  isVerified?: boolean;
  listingType?: "SELL" | "RENT";
  condition?: string;
  categoryId: string;
  subcategoryId?: string;
}

export default function ProductCard({ 
  id, title, price, image, location, createdAt, isUrgent, isVerified, listingType, condition, categoryId, subcategoryId
}: ProductCardProps) {
  const { toggleCompare, isInCompare } = useCompare();
  const selected = isInCompare(id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`group relative flex flex-col bg-white dark:bg-gray-900 rounded-3xl border ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 dark:border-gray-800'} overflow-hidden hover:shadow-2xl transition-all duration-500`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {isUrgent && (
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
              URGENT
            </span>
          )}
          {condition && (
            <span className="bg-white/90 text-gray-800 text-[10px] font-black px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border border-gray-100">
              {condition}
            </span>
          )}
        </div>

        {/* AI Badge - ONLY ON HOVER */}
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 border border-emerald-400">
              <Sparkles size={12} /> AI RECOMMENDED
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Hover Quick Actions */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-30">
          <Link 
            href={`/product/${id}`}
            className="p-3 bg-white text-gray-800 rounded-2xl hover:bg-primary hover:text-white transition-all transform hover:scale-110 shadow-xl"
            title="Quick View"
          >
            <Eye size={20} />
          </Link>
          <button 
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              toggleCompare({ id, title, categoryId, subcategoryId }); 
            }}
            className={`p-3 rounded-2xl transition-all transform hover:scale-110 shadow-xl ${selected ? 'bg-primary text-white' : 'bg-white text-gray-800 hover:bg-primary hover:text-white'}`}
            title="Compare"
          >
            <BarChart2 size={20} />
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              import("react-hot-toast").then(({ toast }) => toast.success("Added to favorites!"));
            }}
            className="p-3 bg-white text-gray-800 rounded-2xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 shadow-xl"
            title="Save"
          >
            <Heart size={20} />
          </button>
        </div>

        {/* Verified Student Badge on Image */}
        {isVerified && (
          <div className="absolute bottom-4 left-4 z-20">
            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5 border border-blue-500">
              <ShieldCheck size={12} /> VERIFIED STUDENT
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1 bg-white dark:bg-gray-900 relative z-40">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-black text-base line-clamp-1 text-gray-800 dark:text-gray-100 leading-tight flex-1" title={title}>
            {title}
          </h3>
          {listingType === "RENT" && (
            <span className="ml-2 bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-md">RENT</span>
          )}
        </div>
        
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-xl font-black text-gray-900 dark:text-gray-50">₹{price.toLocaleString('en-IN')}</span>
          {listingType === "RENT" && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">/ Day</span>}
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
            <MapPin size={12} className="text-gray-300" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
              <Clock size={12} className="text-gray-300" />
              <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
            <Link 
              href={`/product/${id}`}
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
      
      {/* Invisible Link Wrapper for entire card */}
      <Link href={`/product/${id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {title}</span>
      </Link>
    </motion.div>
  );
}
