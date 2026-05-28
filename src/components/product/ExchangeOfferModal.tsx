"use client";

import { useState } from "react";
import { X, RefreshCw, Upload, Rocket, Trash2, ShieldCheck, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

interface ExchangeOfferModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExchangeOfferModal({ product, isOpen, onClose }: ExchangeOfferModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [offeredTitle, setOfferedTitle] = useState("");
  const [offeredDescription, setOfferedDescription] = useState("");
  const [cashDifference, setCashDifference] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter((file) => {
        const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024;
        return isValidType && isValidSize;
      });

      if (validFiles.length !== newFiles.length) {
        toast.error("Only JPG, PNG, or WEBP images up to 5MB are allowed");
      }

      if (images.length + validFiles.length > 5) {
        toast.error("Max 5 images for offer");
        return;
      }
      if (validFiles.length === 0) return;

      setImages(prev => [...prev, ...validFiles]);
      const newUrls = validFiles.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push(`/login?redirect=/product/${product.id}`);
      return;
    }
    if (!offeredTitle || !offeredDescription || images.length === 0) {
      toast.error("Please fill all details and add at least one image");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Sending your exchange proposal...");

    try {
      // 1. Upload Images to Cloudinary
      const { getCloudinarySignature } = await import("@/actions/cloudinary");
      const { timestamp, signature, apiKey, cloudName, allowed_formats } = await getCloudinarySignature("ExOwn_exchange_offers");
      
      const uploadedImageUrls: string[] = [];
      for (const file of images) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", "ExOwn_exchange_offers");
        if (allowed_formats) {
          formData.append("allowed_formats", allowed_formats);
        }
        
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) uploadedImageUrls.push(uploadData.secure_url);
      }

      // 2. Create Exchange Offer Action
      const { createExchangeOffer } = await import("@/actions/exchange");
      const res = await createExchangeOffer({
        productId: product.id,
        buyerId: user.uid,
        offeredTitle,
        offeredDescription,
        offeredImages: uploadedImageUrls,
        cashDifference: cashDifference ? parseFloat(cashDifference) : 0,
      });

      if (res.success) {
        toast.success("Exchange proposal sent!", { id: loadingToast });
        onClose();
        router.push("/requests");
      } else {
        toast.error(res.error || "Failed to send proposal", { id: loadingToast });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary text-white rounded-2xl">
              <RefreshCw size={24} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">Propose Exchange</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trade your item for {product.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
          {/* Section 1: Your Item Details */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">1</div>
              <h3 className="text-xl font-black uppercase tracking-tight italic">What are you offering?</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Title</label>
                <input 
                  type="text"
                  value={offeredTitle}
                  onChange={(e) => setOfferedTitle(e.target.value)}
                  placeholder="e.g. Sony A7III with 28-70mm lens"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-4 border-transparent focus:border-primary outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cash Difference (₹) — <span className="text-primary italic">Optional</span></label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300 group-focus-within:text-primary transition-colors">₹</span>
                  <input 
                    type="number"
                    value={cashDifference}
                    onChange={(e) => setCashDifference(e.target.value)}
                    placeholder="Extra amount you'll pay"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-4 border-transparent focus:border-primary outline-none transition-all font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Item Condition & Details</label>
              <textarea 
                rows={4}
                value={offeredDescription}
                onChange={(e) => setOfferedDescription(e.target.value)}
                placeholder="Mention usage, defects, and why you want to trade..."
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-4 border-transparent focus:border-primary outline-none transition-all font-bold resize-none"
              />
            </div>
          </div>

          {/* Section 2: Photos */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">2</div>
              <h3 className="text-xl font-black uppercase tracking-tight italic">Proof of Ownership</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {imageUrls.map((url, index) => (
                <div key={url} className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-gray-800 group">
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button 
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 size={24} className="text-white" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="aspect-square rounded-2xl border-4 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group">
                   <Upload size={32} className="text-gray-300 group-hover:text-primary transition-colors" />
                   <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Add Photo</span>
                   <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          {/* Trust Banner */}
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 flex gap-4">
             <ShieldCheck size={24} className="text-blue-500 shrink-0" />
             <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-tighter text-blue-900 dark:text-blue-200 italic">Exchange Mode Security</p>
                <p className="text-xs text-blue-800/70 dark:text-blue-400/70 font-bold leading-relaxed">
                  Only meet in public campus zones. Verify the offered item's condition manually before final hand-off. ExOwn facilitates the proposal, not the physical transport.
                </p>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
           <div className="flex items-center gap-2 text-gray-400">
             <Info size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">Offers expire in 7 days</span>
           </div>
           <button 
             onClick={handleSubmit}
             disabled={isSubmitting}
             className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center gap-4 italic"
           >
             {isSubmitting ? "Processing..." : "Send Proposal"} <Rocket size={24} />
           </button>
        </div>
      </motion.div>
    </div>
  );
}
