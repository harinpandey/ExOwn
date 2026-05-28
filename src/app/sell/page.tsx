"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Upload, X, Check, ArrowRight, ChevronLeft, 
  LayoutGrid, MapPin, Tag, Image as ImageIcon, Rocket, 
  Sparkles, Info, ShieldCheck, Trash2
} from "lucide-react";
import CategoryConditionForm from "@/components/forms/CategoryConditionForm";
import CampusSelector from "@/components/ui/CampusSelector";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, Category, Subcategory } from "@/config/categories";
import { toast } from "react-hot-toast";
import ListingHealthScore from "@/components/product/ListingHealthScore";
import * as LucideIcons from "lucide-react";

export default function SellPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // Selection State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [customOtherTitle, setCustomOtherTitle] = useState("");
  const [campusId, setCampusId] = useState("");
  
  // Dynamic Attributes State
  const [conditionDetails, setConditionDetails] = useState<any>(null);
  const [finalCondition, setFinalCondition] = useState<string>("GOOD");

  // Form Basic Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [listingType, setListingType] = useState<"SELL" | "RENT">("SELL");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  
  // Exchange Mode State
  const [isExchangeAllowed, setIsExchangeAllowed] = useState(false);
  const [exchangeCategories, setExchangeCategories] = useState<string[]>([]);
  const [exchangeCashAllowed, setExchangeCashAllowed] = useState(false);


  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/sell");
    }
  }, [user, loading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024;
        return isValidType && isValidSize;
      });

      if (validFiles.length !== newFiles.length) {
        toast.error("Only JPG, PNG, or WEBP images up to 5MB are allowed");
      }

      if (images.length + validFiles.length > 10) {
        toast.error("Maximum 10 images allowed");
        return;
      }
      setImages((prev) => [...prev, ...validFiles]);
      const newUrls = validFiles.map(file => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls]);
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
    if (!user) return;
    if (!campusId) return toast.error("Please select a campus");
    if (images.length === 0) return toast.error("Please upload at least one photo");
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Finalizing your premium listing...");

    try {
      const { getCloudinarySignature } = await import("@/actions/cloudinary");
      const { timestamp, signature, apiKey, cloudName, allowed_formats } = await getCloudinarySignature();
      
      const uploadedImageUrls: string[] = [];
      for (const file of images) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", "ExOwn_products");
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
      
      const { createProduct, getCategories } = await import("@/actions/product");
      const dbCategories = await getCategories();
      const dbCat = dbCategories.find(c => c.slug === selectedCategory?.slug);
      if (!dbCat) throw new Error("Category not found");

      const { getSubcategories } = await import("@/actions/product");
      const dbSubcategories = await getSubcategories(dbCat.id);
      const dbSub = selectedSubcategory?.id === 'other' 
        ? null 
        : dbSubcategories.find(s => s.slug === selectedSubcategory?.id);
      
      const productData = {
        title: selectedSubcategory?.id === 'other' ? customOtherTitle : title,
        description,
        categoryId: dbCat.id,
        subcategoryId: dbSub?.id || null,
        customSubcategory: selectedSubcategory?.id === 'other' ? customOtherTitle : selectedSubcategory?.name,
        condition: finalCondition,
        conditionDetails,
        price: parseFloat(price),
        location: pickupLocation,
        sellerId: user.uid,
        campusId,
        images: uploadedImageUrls,
        isNegotiable,
        isUrgent,
        listingType,
        isExchangeAllowed,
        exchangeCategories,
        exchangeCashAllowed,
      };

      
      const res = await createProduct(productData);
      if (res.success) {
        toast.success("Listing is now LIVE!", { id: loadingToast });
        router.push("/profile");
      } else {
        toast.error(res.error || "Failed to create listing", { id: loadingToast });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: "Category", icon: LayoutGrid },
    { id: 2, name: "Campus", icon: MapPin },
    { id: 3, name: "Attributes", icon: Info },
    { id: 4, name: "Exchange", icon: LucideIcons.RefreshCw },
    { id: 5, name: "Content", icon: Tag },
    { id: 6, name: "Pricing", icon: Sparkles },
    { id: 7, name: "Media", icon: ImageIcon }
  ];


  const DynamicIcon = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
    const Icon = (LucideIcons as any)[name] || LayoutGrid;
    return <Icon size={size} className={className} />;
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Premium Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <X size={20} />
            </button>
            <div className="h-8 w-px bg-gray-100 dark:bg-gray-800" />
            <h1 className="font-black text-xl italic tracking-tighter uppercase">List an Item</h1>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
               <ShieldCheck size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">Safe Marketplace</span>
             </div>
             <div className="text-right">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {step}/7</p>
               <p className="text-sm font-black uppercase tracking-tight">{steps[step-1].name}</p>
             </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-100 dark:bg-gray-800">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 7) * 100}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Wizard Flow */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Category */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="space-y-2">
                    <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase">Pick a <span className="text-primary">Category</span></h2>
                    <p className="text-gray-500 font-bold text-lg">Where does your item belong?</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedSubcategory(null);
                        }}
                        className={`group p-8 rounded-[2.5rem] border-4 transition-all flex flex-col items-start gap-6 text-left relative overflow-hidden ${
                          selectedCategory?.id === cat.id 
                          ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" 
                          : "border-transparent bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-800 shadow-xl"
                        }`}
                      >
                        <div className={`p-4 rounded-2xl transition-all ${
                          selectedCategory?.id === cat.id ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                        }`}>
                          <DynamicIcon name={cat.icon} />
                        </div>
                        <span className="text-lg font-black tracking-tighter leading-tight uppercase">{cat.name}</span>
                        {selectedCategory?.id === cat.id && (
                          <div className="absolute top-6 right-6 text-primary">
                            <Check size={24} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedCategory && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-12 border-t border-gray-100 dark:border-gray-800">
                      <h3 className="text-xl font-black mb-8 uppercase tracking-widest italic">Specific Subcategory</h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedCategory.subcategories.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubcategory(sub)}
                            className={`px-8 py-4 rounded-2xl font-black transition-all border-4 text-sm uppercase tracking-widest ${
                              selectedSubcategory?.id === sub.id
                              ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105"
                              : "border-transparent bg-white dark:bg-gray-900 text-gray-500 hover:border-primary/20 shadow-lg"
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                      
                      <div className="mt-16 flex justify-between items-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Ready to pinpoint location</p>
                        <button
                          onClick={() => setStep(2)}
                          disabled={!selectedSubcategory}
                          className="px-12 py-6 bg-primary text-white rounded-[2.5rem] font-black text-xl flex items-center gap-4 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"
                        >
                          Continue <ArrowRight size={28} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="space-y-2">
                    <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase">Target <span className="text-primary">Campus</span></h2>
                    <p className="text-gray-500 font-bold text-lg">Help local buyers find your item.</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-2xl">
                    <CampusSelector onSelect={setCampusId} selectedId={campusId} />
                  </div>

                  <div className="mt-16 flex justify-between items-center">
                    <button onClick={() => setStep(1)} className="flex items-center gap-3 text-gray-400 hover:text-primary font-black uppercase tracking-widest text-sm transition-colors">
                      <ChevronLeft size={20} /> Back to Category
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!campusId}
                      className="px-12 py-6 bg-primary text-white rounded-[2.5rem] font-black text-xl flex items-center gap-4 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"
                    >
                      Step 3 <ArrowRight size={28} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Attributes */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="space-y-2">
                    <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase">Product <span className="text-primary">DNA</span></h2>
                    <p className="text-gray-500 font-bold text-lg">Technical details for {selectedSubcategory?.name}.</p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-1 shadow-2xl border border-gray-100 dark:border-gray-800">
                    <CategoryConditionForm 
                      categoryName={selectedCategory?.name || ""}
                      subcategoryName={selectedSubcategory?.name || ""}
                      onOtherTitleChange={setCustomOtherTitle}
                      onComplete={(details, cond) => {
                        setConditionDetails(details);
                        setFinalCondition(cond);
                      }}
                    />
                  </div>

                  <div className="mt-16 flex justify-between items-center">
                    <button onClick={() => setStep(2)} className="flex items-center gap-3 text-gray-400 hover:text-primary font-black uppercase tracking-widest text-sm transition-colors">
                      <ChevronLeft size={20} /> Back to Location
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      disabled={!conditionDetails}
                      className="px-12 py-6 bg-primary text-white rounded-[2.5rem] font-black text-xl flex items-center gap-4 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"
                    >
                      Continue <ArrowRight size={28} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Exchange Mode */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="space-y-2">
                    <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase">Trade & <span className="text-primary">Swap</span></h2>
                    <p className="text-gray-500 font-bold text-lg">Exchange your item for something else.</p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-10">
                    <div className="space-y-6">
                      <label className="flex items-center gap-6 p-8 bg-primary/5 rounded-[2.5rem] cursor-pointer hover:bg-primary/10 transition-all border-4 border-transparent hover:border-primary/20 shadow-sm group">
                        <input 
                          type="checkbox" 
                          checked={isExchangeAllowed} 
                          onChange={(e) => setIsExchangeAllowed(e.target.checked)} 
                          className="w-10 h-10 rounded-2xl border-4 border-primary/20 text-primary focus:ring-primary" 
                        />
                        <div className="flex-1">
                           <p className="font-black text-2xl uppercase tracking-tighter text-gray-900 dark:text-white">Open to Exchange?</p>
                           <p className="text-sm text-gray-500 font-bold italic">Allow buyers to propose trading their items for yours.</p>
                        </div>
                      </label>
                    </div>

                    <AnimatePresence>
                      {isExchangeAllowed && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-10 pt-6 overflow-hidden"
                        >
                          <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Preferred Exchange Items</label>
                            <div className="flex flex-wrap gap-3">
                              {["Phones", "Laptops", "Cycles", "Furniture", "Books", "Electronics", "Other"].map(cat => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => {
                                    setExchangeCategories(prev => 
                                      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                                    );
                                  }}
                                  className={`px-6 py-4 rounded-2xl font-bold transition-all border-4 text-sm uppercase tracking-widest ${
                                    exchangeCategories.includes(cat)
                                    ? "bg-primary border-primary text-white shadow-lg"
                                    : "border-transparent bg-gray-50 dark:bg-gray-800 text-gray-500 hover:border-primary/20"
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="flex items-center gap-6 p-8 bg-emerald-500/5 rounded-[2.5rem] cursor-pointer hover:bg-emerald-500/10 transition-all border-4 border-transparent hover:border-emerald-500/20 shadow-sm group">
                              <input 
                                type="checkbox" 
                                checked={exchangeCashAllowed} 
                                onChange={(e) => setExchangeCashAllowed(e.target.checked)} 
                                className="w-8 h-8 rounded-xl border-4 border-emerald-500/20 text-emerald-500 focus:ring-emerald-500" 
                              />
                              <div className="flex-1">
                                 <p className="font-black text-xl uppercase tracking-tighter text-gray-900 dark:text-white">Accept Cash Adjustment?</p>
                                 <p className="text-sm text-gray-500 font-bold">Allow trades with cash difference (e.g. Phone + ₹2,000)</p>
                              </div>
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-16 flex justify-between items-center">
                    <button onClick={() => setStep(3)} className="flex items-center gap-3 text-gray-400 hover:text-primary font-black uppercase tracking-widest text-sm transition-colors">
                      <ChevronLeft size={20} /> Back to DNA
                    </button>
                    <button
                      onClick={() => setStep(5)}
                      className="px-12 py-6 bg-primary text-white rounded-[2.5rem] font-black text-xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"
                    >
                      Description <ArrowRight size={28} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Content */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="space-y-2">
                    <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase">Describe the <span className="text-primary">Vibe</span></h2>
                    <p className="text-gray-500 font-bold text-lg">Use keywords to get 5x more views.</p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-10">
                    {selectedSubcategory?.id !== 'other' && (
                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Catchy Title</label>
                        <input 
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Pristine iPhone 13 Pro Max - Blue"
                          className="w-full px-8 py-6 rounded-[2rem] bg-gray-50 dark:bg-gray-800/50 border-4 border-transparent focus:border-primary outline-none transition-all font-black text-2xl shadow-inner"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Detailed Description</label>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${description.length < 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {description.length} Characters
                        </span>
                      </div>
                      <textarea 
                        required
                        rows={8}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Mention usage duration, any defects, reason for selling, and what's included..."
                        className="w-full px-8 py-6 rounded-[2.5rem] bg-gray-50 dark:bg-gray-800/50 border-4 border-transparent focus:border-primary outline-none transition-all font-bold text-lg resize-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="mt-16 flex justify-between items-center">
                    <button onClick={() => setStep(4)} className="flex items-center gap-3 text-gray-400 hover:text-primary font-black uppercase tracking-widest text-sm transition-colors">
                      <ChevronLeft size={20} /> Back to Exchange
                    </button>
                    <button
                      onClick={() => setStep(6)}
                      disabled={(!title && selectedSubcategory?.id !== 'other') || description.length < 20}
                      className="px-12 py-6 bg-primary text-white rounded-[2.5rem] font-black text-xl flex items-center gap-4 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"
                    >
                      Pricing <ArrowRight size={28} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Pricing */}
              {step === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="space-y-2">
                    <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase">Set the <span className="text-primary">Value</span></h2>
                    <p className="text-gray-500 font-bold text-lg">Be fair, be fast.</p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-10">
                        <div className="space-y-4">
                          <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Price (₹)</label>
                          <div className="relative group">
                            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-5xl font-black text-gray-300 group-focus-within:text-primary transition-colors">₹</span>
                            <input 
                              type="number" 
                              required
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              placeholder="0"
                              className="w-full pl-20 pr-8 py-10 rounded-[2.5rem] bg-gray-50 dark:bg-gray-800/50 border-4 border-transparent focus:border-primary outline-none transition-all font-black text-6xl shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Exact Pickup Spot</label>
                          <div className="relative">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={24} />
                            <input 
                              type="text" 
                              required
                              value={pickupLocation}
                              onChange={(e) => setPickupLocation(e.target.value)}
                              placeholder="e.g. Block A, Ground Floor"
                              className="w-full pl-16 pr-8 py-6 rounded-[2rem] bg-gray-50 dark:bg-gray-800/50 border-4 border-transparent focus:border-primary outline-none transition-all font-black text-xl shadow-inner"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-10">
                        <div className="space-y-4">
                           <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Deal Type</label>
                           <div className="flex bg-gray-100 dark:bg-gray-800 p-3 rounded-[2rem] gap-2">
                             <button 
                               type="button"
                               onClick={() => setListingType("SELL")}
                               className={`flex-1 py-5 rounded-[1.5rem] font-black text-lg transition-all uppercase tracking-widest ${listingType === "SELL" ? "bg-white dark:bg-gray-700 text-primary shadow-xl scale-[1.02]" : "text-gray-400 hover:text-gray-600"}`}
                             >
                               Sell
                             </button>
                             <button 
                               type="button"
                               onClick={() => setListingType("RENT")}
                               className={`flex-1 py-5 rounded-[1.5rem] font-black text-lg transition-all uppercase tracking-widest ${listingType === "RENT" ? "bg-white dark:bg-gray-700 text-primary shadow-xl scale-[1.02]" : "text-gray-400 hover:text-gray-600"}`}
                             >
                               Rent
                             </button>
                           </div>
                        </div>

                        <div className="space-y-4 pt-4">
                          <label className="flex items-center gap-6 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all border-4 border-transparent hover:border-emerald-500/20 shadow-sm group">
                            <input type="checkbox" checked={isNegotiable} onChange={(e) => setIsNegotiable(e.target.checked)} className="w-8 h-8 rounded-xl border-4 border-gray-200 text-primary focus:ring-primary" />
                            <div className="flex-1">
                               <p className="font-black text-xl uppercase tracking-tighter text-gray-900 dark:text-white">Negotiable</p>
                               <p className="text-sm text-gray-500 font-bold">Open to price discussions</p>
                            </div>
                          </label>
                          
                          <label className="flex items-center gap-6 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border-4 border-transparent hover:border-red-500/20 shadow-sm group">
                            <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="w-8 h-8 rounded-xl border-4 border-gray-200 text-red-500 focus:ring-red-500" />
                            <div className="flex-1">
                               <p className="font-black text-xl uppercase tracking-tighter text-gray-900 dark:text-white">Urgent <span className="text-red-500">🔥</span></p>
                               <p className="text-sm text-gray-500 font-bold">Highlight this listing for 48h</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 flex justify-between items-center">
                    <button onClick={() => setStep(5)} className="flex items-center gap-3 text-gray-400 hover:text-primary font-black uppercase tracking-widest text-sm transition-colors">
                      <ChevronLeft size={20} /> Back to Description
                    </button>
                    <button
                      onClick={() => setStep(7)}
                      disabled={!price || !pickupLocation}
                      className="px-12 py-6 bg-primary text-white rounded-[2.5rem] font-black text-xl flex items-center gap-4 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"
                    >
                      Final Step <ArrowRight size={28} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 7: Media */}
              {step === 7 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="space-y-2">
                    <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase">Last Step: <span className="text-primary">Media</span></h2>
                    <p className="text-gray-500 font-bold text-lg">Visuals are everything. Upload up to 10 photos.</p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-2xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                      <AnimatePresence>
                        {imageUrls.map((url, index) => (
                          <motion.div 
                            key={url}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative aspect-square rounded-[2rem] overflow-hidden shadow-xl border-4 border-white dark:border-gray-800 group"
                          >
                            <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button" 
                                onClick={() => removeImage(index)}
                                className="p-4 bg-red-500 text-white rounded-2xl hover:scale-110 active:scale-90 transition-all shadow-lg"
                              >
                                <Trash2 size={24} />
                              </button>
                            </div>
                            {index === 0 && (
                              <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">Main Cover</div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {images.length < 10 && (
                        <label className="aspect-square rounded-[2rem] border-4 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all text-gray-400 group shadow-inner">
                          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl mb-4 group-hover:bg-primary/10 transition-all">
                             <Upload size={48} className="group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors text-center px-4">Upload High-Res Photo</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      <button 
                        onClick={() => setStep(5)}
                        className="flex-1 py-6 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-[2.5rem] font-black text-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-4"
                      >
                        <ChevronLeft size={24} /> Back
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || images.length === 0}
                        className="flex-[2] py-8 bg-primary text-white rounded-[2.5rem] font-black text-4xl shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-6 italic tracking-tighter"
                      >
                        {isSubmitting ? (
                          <>Deploying...</>
                        ) : (
                          <>Publish Listing <Rocket size={40} /></>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Real-time Health & Tips */}
          <div className="lg:col-span-4 space-y-8 sticky top-32 h-fit">
             <ListingHealthScore 
               product={{ 
                 title, 
                 description, 
                 price: parseFloat(price) || 0, 
                 images: imageUrls, 
                 condition: finalCondition, 
                 pickupLocation,
                 categoryId: selectedCategory?.id,
                 subcategoryId: selectedSubcategory?.id
               }} 
             />

             {/* Dynamic Selling Tip Card */}
             <div className="bg-primary/5 rounded-[2.5rem] border border-primary/20 p-8">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-primary text-white rounded-2xl">
                   <Sparkles size={20} />
                 </div>
                 <h3 className="font-black text-lg uppercase tracking-tight italic">ExOwn AI Tip</h3>
               </div>
               
               <AnimatePresence mode="wait">
                  <motion.p 
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-700 dark:text-gray-300 font-bold leading-relaxed mb-6"
                  >
                    {step === 1 ? "Accurate categorization helps our AI match your item with the right student buyers in under 24 hours." :
                     step === 2 ? "Buyers on campus are 80% more likely to buy if they know they can pick it up between classes." :
                     step === 3 ? "Detailed specs reduce 'Is this available?' chats and increase 'When can I meet?' requests." :
                     step === 4 ? "Keep your first sentence punchy. Most users decide in the first 3 seconds of reading." :
                     step === 5 ? "Items priced at ₹999 sell 40% faster than items priced at ₹1,000. Circular psychology works!" :
                     "High-quality, well-lit photos increase trust. Take photos of any minor defects to avoid cancellations."}
                  </motion.p>
               </AnimatePresence>

               <div className="flex items-center justify-between pt-6 border-t border-primary/10">
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest">Listing Score</span>
                 <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`w-3 h-1 rounded-full ${i <= (step/6)*5 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`} />
                    ))}
                 </div>
               </div>
             </div>
             
             {/* Preview Helper */}
             {images.length > 0 && (
               <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-xl">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Ad Preview</h4>
                 <div className="aspect-[4/5] rounded-3xl overflow-hidden mb-4 bg-gray-50 dark:bg-gray-800">
                    <img src={imageUrls[0]} alt={title || "Listing preview"} className="w-full h-full object-cover" />
                 </div>
                 <p className="font-black text-xl tracking-tight line-clamp-1 truncate">{title || "Listing Title"}</p>
                 <p className="text-3xl font-black text-primary mt-1">₹{price || "0"}</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
