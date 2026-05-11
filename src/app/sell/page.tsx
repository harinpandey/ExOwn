"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Upload, X, Check, ArrowRight, Search, ChevronLeft, LayoutGrid, MapPin, Tag, Image as ImageIcon, Rocket } from "lucide-react";
import CategoryConditionForm from "@/components/forms/CategoryConditionForm";
import CampusSelector from "@/components/ui/CampusSelector";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, Category, Subcategory } from "@/config/categories";
import { toast } from "react-hot-toast";
import ListingHealthScore from "@/components/product/ListingHealthScore";

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
  const [subcategorySearch, setSubcategorySearch] = useState("");
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
    const loadingToast = toast.loading("Uploading your listing...");

    try {
      // 1. Get Cloudinary Signature
      const { getCloudinarySignature } = await import("@/actions/cloudinary");
      const { timestamp, signature, apiKey, cloudName } = await getCloudinarySignature();
      
      // 2. Upload images
      const uploadedImageUrls: string[] = [];
      for (const file of images) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", "ExOwn_products");
        
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) uploadedImageUrls.push(uploadData.secure_url);
      }
      
      // 3. Create Product
      const { createProduct, getCategories } = await import("@/actions/product");
      const dbCategories = await getCategories();
      const dbCat = dbCategories.find(c => c.slug === selectedCategory?.slug);
      if (!dbCat) throw new Error("Category not found");

      // 4. Find DB Subcategory ID
      const { getSubcategories } = await import("@/actions/product");
      const dbSubcategories = await getSubcategories(dbCat.id);
      const dbSub = selectedSubcategory?.id === 'other' 
        ? null 
        : dbSubcategories.find(s => s.slug === selectedSubcategory?.id);
      
      if (selectedSubcategory?.id !== 'other' && !dbSub) {
        throw new Error(`Subcategory "${selectedSubcategory?.name}" not found in database. Please contact support.`);
      }

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
      };
      
      const res = await createProduct(productData);
      if (res.success) {
        toast.success("Listing submitted for review!", { id: loadingToast });
        router.push("/profile");
      } else {
        toast.error(res.error || "Failed to create listing", { id: loadingToast });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: "Category", icon: LayoutGrid },
    { id: 2, name: "Location", icon: MapPin },
    { id: 3, name: "Condition", icon: Check },
    { id: 4, name: "Ad Info", icon: Tag },
    { id: 5, name: "Photos", icon: ImageIcon },
    { id: 6, name: "Publish", icon: Rocket }
  ];

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Modern Step Indicator */}
        <div className="flex items-center justify-between mb-12 bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm overflow-x-auto no-scrollbar">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-3 shrink-0">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
                step === s.id ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : 
                step > s.id ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
              }`}>
                {step > s.id ? <Check size={20} /> : <s.icon size={20} />}
              </div>
              <span className={`text-xs font-black uppercase tracking-widest hidden lg:block ${step >= s.id ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                {s.name}
              </span>
              {s.id < 6 && <div className="w-4 h-px bg-gray-200 dark:bg-gray-800 mx-2 hidden lg:block" />}
            </div>
          ))}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {/* Step 1: Category */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">What are you selling?</h1>
                    <p className="text-gray-500 font-medium">Select a category to start your listing.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedSubcategory(null);
                        }}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 text-center group ${
                          selectedCategory?.id === cat.id 
                          ? "border-primary bg-primary/5 text-primary scale-105 shadow-xl shadow-primary/10" 
                          : "border-transparent hover:border-primary/20 bg-gray-50 dark:bg-gray-800/50"
                        }`}
                      >
                        <div className={`p-4 rounded-2xl transition-all ${
                          selectedCategory?.id === cat.id ? "bg-primary text-white" : "bg-white dark:bg-gray-800 text-gray-500"
                        }`}>
                          <LayoutGrid size={24} />
                        </div>
                        <span className="text-sm font-black tracking-tight leading-tight">{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  {selectedCategory && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 pt-12 border-t border-gray-100 dark:border-gray-800">
                      <h2 className="text-xl font-black mb-6">Choose Subcategory</h2>
                      <div className="flex flex-wrap gap-3">
                        {selectedCategory.subcategories.map(sub => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setSelectedSubcategory(sub)}
                            className={`px-8 py-3.5 rounded-2xl font-black transition-all border-2 ${
                              selectedSubcategory?.id === sub.id
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                              : "border-transparent bg-gray-50 dark:bg-gray-800/50 text-gray-500 hover:border-primary/40"
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                      <div className="mt-12 flex justify-end">
                        <button
                          onClick={() => setStep(2)}
                          disabled={!selectedSubcategory}
                          className="px-10 py-5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-[2rem] font-black text-lg flex items-center gap-3 disabled:opacity-50 hover:scale-105 transition-all shadow-2xl"
                        >
                          Next Step <ArrowRight size={24} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Campus Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <div className="mb-10">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Target Campus</h1>
                    <p className="text-gray-500 font-medium">Where is this item available for pickup?</p>
                  </div>
                  
                  <CampusSelector onSelect={setCampusId} selectedId={campusId} />

                  <div className="mt-12 flex justify-end">
                    <button
                      onClick={() => setStep(3)}
                      disabled={!campusId}
                      className="px-10 py-5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-[2rem] font-black text-lg flex items-center gap-3 disabled:opacity-50 hover:scale-105 transition-all shadow-2xl"
                    >
                      Continue <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Condition Details (Dynamic) */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <div className="mb-10">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">{selectedSubcategory?.name} Details</h1>
                    <p className="text-gray-500 font-medium">Complete these product-specific questions.</p>
                  </div>

                  <CategoryConditionForm 
                    categoryName={selectedCategory?.name || ""}
                    subcategoryName={selectedSubcategory?.name || ""}
                    onOtherTitleChange={setCustomOtherTitle}
                    onComplete={(details, cond) => {
                      setConditionDetails(details);
                      setFinalCondition(cond);
                    }}
                  />

                  <div className="mt-12 flex justify-end">
                    <button
                      onClick={() => setStep(4)}
                      disabled={!conditionDetails}
                      className="px-10 py-5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-[2rem] font-black text-lg flex items-center gap-3 disabled:opacity-50 hover:scale-105 transition-all shadow-2xl"
                    >
                      Next Step <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Ad Info (Title/Desc) */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => setStep(3)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <div className="mb-8">
                    <ListingHealthScore product={{ title, description, price: parseFloat(price) || 0, images: imageUrls, condition: finalCondition, pickupLocation }} />
                  </div>
                  <div className="mb-10">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Tell us more</h1>
                    <p className="text-gray-500 font-medium">Add a catchy title and detailed description.</p>
                  </div>

                  <div className="space-y-8">
                    {selectedSubcategory?.id !== 'other' && (
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Ad Title</label>
                        <input 
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. iPhone 13 Pro Max - 256GB"
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-lg"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Description</label>
                      <textarea 
                        required
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Condition details, usage duration, reason for selling..."
                        className="w-full px-6 py-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all font-medium resize-none text-lg"
                      />
                    </div>
                  </div>

                  <div className="mt-12 flex justify-end">
                    <button
                      onClick={() => setStep(5)}
                      disabled={(!title && selectedSubcategory?.id !== 'other') || !description}
                      className="px-10 py-5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-[2rem] font-black text-lg flex items-center gap-3 disabled:opacity-50 hover:scale-105 transition-all shadow-2xl"
                    >
                      Pricing & Photos <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Pricing & Listing Type */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => setStep(4)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <div className="mb-8">
                    <ListingHealthScore product={{ title, description, price: parseFloat(price) || 0, images: imageUrls, condition: finalCondition, pickupLocation }} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <h2 className="text-3xl font-black tracking-tight">Set Price</h2>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Price (₹)</label>
                        <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-400">₹</span>
                          <input 
                            type="number" 
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0"
                            className="w-full pl-14 pr-6 py-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all font-black text-4xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Exact Pickup Location</label>
                        <input 
                          type="text" 
                          required
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="e.g. BH-4 reception"
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-8">
                      <h2 className="text-3xl font-black tracking-tight">Listing Options</h2>
                      
                      <div className="flex bg-gray-100 dark:bg-gray-800 p-2 rounded-2xl">
                        <button 
                          type="button"
                          onClick={() => setListingType("SELL")}
                          className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${listingType === "SELL" ? "bg-white dark:bg-gray-700 text-primary shadow-sm" : "text-gray-400"}`}
                        >
                          Sell
                        </button>
                        <button 
                          type="button"
                          onClick={() => setListingType("RENT")}
                          className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${listingType === "RENT" ? "bg-white dark:bg-gray-700 text-primary shadow-sm" : "text-gray-400"}`}
                        >
                          Rent
                        </button>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center gap-3 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group shadow-sm">
                          <input type="checkbox" checked={isNegotiable} onChange={(e) => setIsNegotiable(e.target.checked)} className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-700 text-primary focus:ring-primary" />
                          <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">Price is Negotiable</span>
                        </label>
                        <label className="flex items-center gap-3 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group shadow-sm">
                          <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-700 text-red-500 focus:ring-red-500" />
                          <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-500 transition-colors">Mark as Urgent 🔥</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-end">
                    <button
                      onClick={() => setStep(6)}
                      disabled={!price || !pickupLocation}
                      className="px-10 py-5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-[2rem] font-black text-lg flex items-center gap-3 disabled:opacity-50 hover:scale-105 transition-all shadow-2xl"
                    >
                      Photos <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Photos & Publish */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => setStep(5)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <div className="mb-8">
                    <ListingHealthScore product={{ title, description, price: parseFloat(price) || 0, images: imageUrls, condition: finalCondition, pickupLocation }} />
                  </div>

                  <div className="mb-10">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Almost there!</h1>
                    <p className="text-gray-500 font-medium">Upload clear photos to attract more buyers.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-[2rem] overflow-hidden shadow-md group">
                        <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(index)}
                          className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-xl hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {images.length < 10 && (
                      <label className="aspect-square rounded-[2rem] border-4 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all text-gray-400 group">
                        <Upload size={32} className="mb-2 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Add Photo</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>

                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || images.length === 0}
                    className="w-full py-6 bg-primary text-white rounded-[2.5rem] font-black text-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? "Finalizing..." : "Publish Listing"}
                    {!isSubmitting && <Rocket size={28} />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
