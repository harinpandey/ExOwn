"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Upload, X, Check, ArrowRight, LayoutGrid, MapPin, Tag, Image as ImageIcon, Rocket, ChevronLeft, Loader2 } from "lucide-react";
import CategoryConditionForm from "@/components/forms/CategoryConditionForm";
import CampusSelector from "@/components/ui/CampusSelector";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, Category, Subcategory } from "@/config/categories";
import { toast } from "react-hot-toast";
import ListingHealthScore from "@/components/product/ListingHealthScore";

export default function EditListingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [listingType, setListingType] = useState<"SELL" | "RENT">("SELL");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [campusId, setCampusId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [conditionDetails, setConditionDetails] = useState<any>(null);
  const [finalCondition, setFinalCondition] = useState<string>("GOOD");

  const fetchProduct = useCallback(async () => {
    try {
      const { getProductById } = await import("@/actions/product");
      const product = await getProductById(id as string);
      
      if (!product) {
        toast.error("Product not found");
        router.push("/profile");
        return;
      }

      if (product.sellerId !== user?.uid) {
        toast.error("Unauthorized to edit this listing");
        router.push("/profile");
        return;
      }

      // Pre-fill state
      setTitle(product.title);
      setDescription(product.description || "");
      setPrice(product.price.toString());
      setPickupLocation(product.pickupLocation || "");
      setListingType(product.listingType as any);
      setIsNegotiable(product.isNegotiable);
      setIsUrgent(product.isUrgent);
      setCampusId(product.campusId);
      setImages(product.images);
      setConditionDetails(product.conditionDetails);
      setFinalCondition(product.condition);

      // Map Category/Subcategory back to config
      const cat = CATEGORIES.find(c => c.id === product.categoryId || c.slug === product.categoryId); // Fallback to slug if id is slug
      if (cat) {
        setSelectedCategory(cat);
        const sub = cat.subcategories.find(s => s.id === product.subcategoryId || s.name === product.customSubcategory);
        if (sub) setSelectedSubcategory(sub);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching product:", err);
      toast.error("Failed to load product details");
    }
  }, [id, router, user?.uid]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/product/edit/${id}`);
      return;
    }

    if (user && id) {
      fetchProduct();
    }
  }, [user, authLoading, id, router, fetchProduct]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...files]);
      const urls = files.map(file => URL.createObjectURL(file));
      setNewImageUrls(prev => [...prev, ...urls]);
    }
  };

  const removeExistingImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewImageUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating your listing...");

    try {
      const uploadedUrls: string[] = [];
      
      // Upload new images if any
      if (newFiles.length > 0) {
        const { getCloudinarySignature } = await import("@/actions/cloudinary");
        const { timestamp, signature, apiKey, cloudName, allowed_formats } = await getCloudinarySignature();
        
        for (const file of newFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", apiKey);
          formData.append("timestamp", timestamp.toString());
          formData.append("signature", signature);
          formData.append("folder", "ExOwn_products");
          if (allowed_formats) {
            formData.append("allowed_formats", allowed_formats);
          }
          
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.secure_url) uploadedUrls.push(data.secure_url);
        }
      }

      const { updateProduct } = await import("@/actions/product");
      const res = await updateProduct(id as string, user.uid, {
        title,
        description,
        price: parseFloat(price),
        pickupLocation,
        listingType,
        isNegotiable,
        isUrgent,
        campusId,
        images: [...images, ...uploadedUrls],
        conditionDetails,
        condition: finalCondition,
      });

      if (res.success) {
        toast.success("Listing updated successfully!", { id: loadingToast });
        router.push(`/product/${id}`);
      } else {
        toast.error(res.error || "Failed to update listing", { id: loadingToast });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const steps = [
    { id: 1, name: "Category", icon: LayoutGrid },
    { id: 2, name: "Location", icon: MapPin },
    { id: 3, name: "Condition", icon: Check },
    { id: 4, name: "Ad Info", icon: Tag },
    { id: 5, name: "Photos", icon: ImageIcon },
    { id: 6, name: "Publish", icon: Rocket }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Step Indicator */}
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
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl text-center">
                  <h1 className="text-4xl font-black tracking-tighter mb-2">Category</h1>
                  <p className="text-gray-500 mb-8">You can't change the category after publishing. If you need to, please archive and create a new listing.</p>
                  <div className="flex justify-center">
                    <div className="px-10 py-5 bg-primary/10 text-primary rounded-[2rem] font-black text-xl border-2 border-primary/20">
                      {selectedCategory?.name} {">"} {selectedSubcategory?.name}
                    </div>
                  </div>
                  <div className="mt-12 flex justify-center">
                    <button onClick={() => setStep(2)} className="px-10 py-5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-[2rem] font-black text-lg flex items-center gap-3 shadow-2xl">
                      Next: Location <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <h1 className="text-4xl font-black tracking-tighter mb-10 text-center">Target Campus</h1>
                  <CampusSelector onSelect={setCampusId} selectedId={campusId} />
                  <div className="mt-12 flex justify-end">
                    <button onClick={() => setStep(3)} disabled={!campusId} className="px-10 py-5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-[2rem] font-black text-lg flex items-center gap-3 disabled:opacity-50 hover:scale-105 transition-all shadow-2xl">
                      Next: Condition <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <h1 className="text-4xl font-black tracking-tighter mb-10 text-center">Condition Details</h1>
                  <CategoryConditionForm 
                    categoryName={selectedCategory?.name || ""}
                    subcategoryName={selectedSubcategory?.name || ""}
                    initialDetails={conditionDetails}
                    initialCondition={finalCondition}
                    onComplete={(details, cond) => {
                      setConditionDetails(details);
                      setFinalCondition(cond);
                    }}
                  />
                  <div className="mt-12 flex justify-end">
                    <button onClick={() => setStep(4)} disabled={!conditionDetails} className="px-10 py-5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-[2rem] font-black text-lg flex items-center gap-3 disabled:opacity-50 hover:scale-105 transition-all shadow-2xl">
                      Next: Ad Info <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => setStep(3)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <div className="mb-8">
                    <ListingHealthScore product={{ title, description, price: parseFloat(price) || 0, images: [...images, ...newImageUrls], condition: finalCondition, pickupLocation }} />
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter mb-10 text-center">Edit Info</h1>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Title</label>
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Description</label>
                      <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-all font-medium resize-none text-lg" />
                    </div>
                  </div>
                  <div className="mt-12 flex justify-end">
                    <button onClick={() => setStep(5)} disabled={!title || !description} className="px-10 py-5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-[2rem] font-black text-lg flex items-center gap-3 disabled:opacity-50 hover:scale-105 transition-all shadow-2xl">
                      Next: Pricing <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => setStep(4)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <div className="mb-8">
                    <ListingHealthScore product={{ title, description, price: parseFloat(price) || 0, images: [...images, ...newImageUrls], condition: finalCondition, pickupLocation }} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <h2 className="text-3xl font-black">Set Price</h2>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-400">₹</span>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full pl-14 pr-6 py-6 rounded-3xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-all font-black text-4xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Pickup Location</label>
                        <input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-all font-bold" />
                      </div>
                    </div>
                    <div className="space-y-8">
                      <h2 className="text-3xl font-black">Options</h2>
                      <div className="flex bg-gray-100 dark:bg-gray-800 p-2 rounded-2xl">
                        <button onClick={() => setListingType("SELL")} className={`flex-1 py-3 rounded-xl font-black text-sm ${listingType === "SELL" ? "bg-white dark:bg-gray-700 text-primary" : "text-gray-400"}`}>Sell</button>
                        <button onClick={() => setListingType("RENT")} className={`flex-1 py-3 rounded-xl font-black text-sm ${listingType === "RENT" ? "bg-white dark:bg-gray-700 text-primary" : "text-gray-400"}`}>Rent</button>
                      </div>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl cursor-pointer">
                          <input type="checkbox" checked={isNegotiable} onChange={(e) => setIsNegotiable(e.target.checked)} className="w-5 h-5 rounded text-primary" />
                          <span className="font-bold">Negotiable</span>
                        </label>
                        <label className="flex items-center gap-3 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl cursor-pointer">
                          <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="w-5 h-5 rounded text-red-500" />
                          <span className="font-bold">Urgent 🔥</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 flex justify-end">
                    <button onClick={() => setStep(6)} disabled={!price || !pickupLocation} className="px-10 py-5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-[2rem] font-black text-lg flex items-center gap-3 shadow-2xl">
                      Next: Photos <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl">
                  <button onClick={() => setStep(5)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <div className="mb-8">
                    <ListingHealthScore product={{ title, description, price: parseFloat(price) || 0, images: [...images, ...newImageUrls], condition: finalCondition, pickupLocation }} />
                  </div>
                  <h1 className="text-4xl font-black mb-10 text-center">Update Photos</h1>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {images.map((url, index) => (
                      <div key={`exist-${index}`} className="relative aspect-square rounded-[2rem] overflow-hidden group">
                        <img src={url} alt={`${title} existing photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button onClick={() => removeExistingImage(index)} className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-xl hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                      </div>
                    ))}
                    {newImageUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative aspect-square rounded-[2rem] overflow-hidden group border-2 border-emerald-500">
                        <img src={url} alt={`${title} new photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button onClick={() => removeNewImage(index)} className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-xl hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                      </div>
                    ))}
                    {(images.length + newFiles.length) < 10 && (
                      <label className="aspect-square rounded-[2rem] border-4 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-primary text-gray-400">
                        <Upload size={32} />
                        <input type="file" multiple className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                  <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-6 bg-primary text-white rounded-[2.5rem] font-black text-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3">
                    {isSubmitting ? "Saving Changes..." : "Update Listing"}
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
