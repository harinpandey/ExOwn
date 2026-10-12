"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Upload, X, ArrowRight, ChevronLeft,
  MapPin, Trash2, AlertCircle, RefreshCw,
  ShoppingBag, Key, HelpCircle
} from "lucide-react";
import CategoryConditionForm from "@/components/forms/CategoryConditionForm";
import CampusSelector from "@/components/ui/CampusSelector";
import { CATEGORIES, Category, Subcategory } from "@/config/categories";
import { toast } from "react-hot-toast";
import * as LucideIcons from "lucide-react";

export default function SellPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SellPageContent />
    </Suspense>
  );
}

function SellPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1: Intent, 2: Category & Campus, 3: Specs/DNA, 4: Content/Pricing, 5: Photos & Submit
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Listing Mode
  const [listingMode, setListingMode] = useState<"SELL" | "RENT" | "EXCHANGE">("SELL");

  // Media
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Category & Campus Selection
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [customOtherTitle, setCustomOtherTitle] = useState("");
  const [campusId, setCampusId] = useState("");

  // Technical Condition & Attributes
  const [conditionDetails, setConditionDetails] = useState<any>(null);
  const [finalCondition, setFinalCondition] = useState<string>("GOOD");

  // Basic Information
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  // Exchange Attributes
  const [exchangeCategories, setExchangeCategories] = useState<string[]>([]);
  const [exchangeCashAllowed, setExchangeCashAllowed] = useState(false);

  // Read initial query parameter (?type=RENT or ?type=EXCHANGE or ?type=WANT)
  useEffect(() => {
    const typeParam = searchParams.get("type")?.toUpperCase();
    if (typeParam === "RENT") {
      setListingMode("RENT");
    } else if (typeParam === "EXCHANGE") {
      setListingMode("EXCHANGE");
    } else if (typeParam === "WANT") {
      router.replace("/requests");
    }
  }, [searchParams, router]);

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

  const setCoverImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
    setImageUrls(prev => {
      const copy = [...prev];
      const [url] = copy.splice(index, 1);
      copy.unshift(url);
      return copy;
    });
    toast.success("Cover photo updated");
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!campusId) return toast.error("Please select a campus");
    if (images.length === 0) return toast.error("Please upload at least one photo");
    if (!title && selectedSubcategory?.id !== "other") return toast.error("Please enter a title");
    if (!description || description.trim().length < 10) return toast.error("Description must be at least 10 characters");
    if (!pickupLocation || pickupLocation.trim().length < 2) return toast.error("Please provide a pickup spot on campus");

    const parsedPrice = parseFloat(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return toast.error("Please enter a valid price in ₹");
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Publishing listing to campus...");

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

        if (!uploadRes.ok) {
          throw new Error("One or more images could not be uploaded. Please verify image formats and try again.");
        }

        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) {
          uploadedImageUrls.push(uploadData.secure_url);
        } else {
          throw new Error(uploadData?.error?.message || "Image upload failed");
        }
      }

      if (uploadedImageUrls.length === 0) {
        throw new Error("No images were successfully uploaded. Please try again.");
      }

      const { createProduct, getCategories, getSubcategories } = await import("@/actions/product");
      const dbCategories = await getCategories();
      const dbCat = dbCategories.find(c => c.slug === selectedCategory?.slug);
      if (!dbCat) throw new Error("Selected category not found in database.");

      const dbSubcategories = await getSubcategories(dbCat.id);
      const dbSub = selectedSubcategory?.id === 'other'
        ? null
        : dbSubcategories.find(s => s.slug === selectedSubcategory?.id);

      const productData = {
        title: selectedSubcategory?.id === 'other' ? customOtherTitle : title,
        description: description.trim(),
        categoryId: dbCat.id,
        subcategoryId: dbSub?.id || null,
        customSubcategory: selectedSubcategory?.id === 'other' ? customOtherTitle : selectedSubcategory?.name,
        condition: finalCondition,
        conditionDetails,
        price: parsedPrice,
        location: pickupLocation.trim(),
        sellerId: user.uid,
        campusId,
        images: uploadedImageUrls,
        isNegotiable,
        isUrgent,
        listingType: listingMode === "RENT" ? ("RENT" as const) : ("SELL" as const),
        isExchangeAllowed: listingMode === "EXCHANGE",
        exchangeCategories: listingMode === "EXCHANGE" ? exchangeCategories : [],
        exchangeCashAllowed: listingMode === "EXCHANGE" ? exchangeCashAllowed : false,
      };

      const res = await createProduct(productData);
      if (res.success) {
        toast.success(res.status === "LIVE" ? "Your listing is now live!" : "Listing submitted for approval.", { id: loadingToast });
        router.push(res.productId ? `/product/${res.productId}` : "/profile");
      } else {
        if (res.error && res.error.toLowerCase().includes("complete your profile")) {
          toast.dismiss(loadingToast);
          setShowProfileModal(true);
        } else {
          toast.error(res.error || "Failed to create listing", { id: loadingToast });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while publishing the listing", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const DynamicIcon = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.LayoutGrid;
    return <Icon size={size} className={className} />;
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-[#0b0e14]">
      {/* Top Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#10141b]/95">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Cancel and go back"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-white/10 dark:text-gray-400 dark:hover:bg-zinc-800"
            >
              <X size={18} />
            </button>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">
              Create Listing
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Step {step} of 5
            </span>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 w-full bg-gray-100 dark:bg-zinc-800">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* STEP 1: WHAT ARE YOU LISTING? */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">
                What would you like to do?
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose the transaction model for this listing.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* SELL */}
              <button
                type="button"
                onClick={() => setListingMode("SELL")}
                className={`flex flex-col items-start rounded-2xl border-2 p-5 text-left transition ${
                  listingMode === "SELL"
                    ? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-[#10141b] dark:hover:border-white/20"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <ShoppingBag size={22} />
                </div>
                <span className="mt-3 text-base font-bold text-gray-900 dark:text-white">
                  Sell an Item
                </span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Sell books, electronics, gadgets, cycles, or hostel essentials to students.
                </span>
              </button>

              {/* RENT */}
              <button
                type="button"
                onClick={() => setListingMode("RENT")}
                className={`flex flex-col items-start rounded-2xl border-2 p-5 text-left transition ${
                  listingMode === "RENT"
                    ? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-[#10141b] dark:hover:border-white/20"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <Key size={22} />
                </div>
                <span className="mt-3 text-base font-bold text-gray-900 dark:text-white">
                  Rent Out
                </span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Rent out items daily or weekly (cameras, calculators, lab coats, tools).
                </span>
              </button>

              {/* EXCHANGE */}
              <button
                type="button"
                onClick={() => setListingMode("EXCHANGE")}
                className={`flex flex-col items-start rounded-2xl border-2 p-5 text-left transition ${
                  listingMode === "EXCHANGE"
                    ? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-[#10141b] dark:hover:border-white/20"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <RefreshCw size={22} />
                </div>
                <span className="mt-3 text-base font-bold text-gray-900 dark:text-white">
                  Offer an Exchange
                </span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Trade an item for another desired item, with or without cash difference.
                </span>
              </button>

              {/* POST A WANT (Requests Board) */}
              <button
                type="button"
                onClick={() => router.push("/requests")}
                className="flex flex-col items-start rounded-2xl border-2 border-dashed border-gray-200 bg-white p-5 text-left transition hover:border-gray-300 dark:border-white/10 dark:bg-[#10141b] dark:hover:border-white/20"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <HelpCircle size={22} />
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    Looking to Buy?
                  </span>
                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    Requests Board
                  </span>
                </div>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Post a student want request and let sellers on campus reach out to you.
                </span>
              </button>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORY & CAMPUS */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">
                Category & Campus Location
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose the category and university campus where this listing is located.
              </p>
            </div>

            {/* Campus Selector */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10141b]">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">
                Select Campus
              </label>
              <CampusSelector onSelect={setCampusId} selectedId={campusId} />
            </div>

            {/* Category Grid */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10141b]">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">
                Select Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedSubcategory(null);
                    }}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                      selectedCategory?.id === cat.id
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <DynamicIcon name={cat.icon} size={18} />
                    <span className="truncate text-xs font-semibold">{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Subcategory Pills */}
              {selectedCategory && (
                <div className="mt-5 border-t border-gray-100 pt-4 dark:border-white/10">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2.5">
                    Subcategory
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          selectedSubcategory?.id === sub.id
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!campusId || !selectedSubcategory}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TECHNICAL DETAILS & CONDITION */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">
                Item Specifications & Condition
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {selectedCategory?.name} • {selectedSubcategory?.name}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10141b]">
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

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!conditionDetails}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TITLE, DESCRIPTION, PRICE & LOCATION */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">
                Listing Details & Pricing
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Provide clear, accurate details to help buyers find your item.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#10141b]">
              {/* Title */}
              {selectedSubcategory?.id !== "other" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Apple iPad 9th Gen 64GB with Pencil"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Description *
                  </label>
                  <span className={`text-[11px] font-semibold ${description.length < 10 ? "text-amber-500" : "text-gray-400"}`}>
                    {description.length} characters (min 10)
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention usage duration, working condition, included accessories, or reasons for parting with the item..."
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              {/* Price & Pickup Location */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                    {listingMode === "RENT" ? "Rental Price (₹/day) *" : "Price (₹) *"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-8 pr-4 text-base font-bold text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                    Pickup Location / Spot *
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="e.g. Block 34, Central Library"
                      className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Use public campus spots. Never provide private hostel room numbers.
                  </p>
                </div>
              </div>

              {/* Exchange Details (If mode is EXCHANGE) */}
              {listingMode === "EXCHANGE" && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <RefreshCw size={14} />
                    Exchange Preferences
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                    Select the categories of items you are willing to trade for:
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["Phones", "Laptops", "Cycles", "Furniture", "Books", "Electronics", "Audio"].map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setExchangeCategories(prev =>
                            prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]
                          );
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          exchangeCategories.includes(item)
                            ? "bg-emerald-600 text-white"
                            : "bg-white border border-gray-200 text-gray-700 dark:bg-zinc-800 dark:border-white/10 dark:text-zinc-200"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={exchangeCashAllowed}
                      onChange={(e) => setExchangeCashAllowed(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary"
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Open to trades with cash difference (e.g., item + cash adjustment)
                    </span>
                  </label>
                </div>
              )}

              {/* Toggles (Negotiable, Urgent) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <label className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/50 p-3 cursor-pointer dark:border-white/10 dark:bg-zinc-900">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                      Price Negotiable
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Open to reasonable offers from buyers
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/50 p-3 cursor-pointer dark:border-white/10 dark:bg-zinc-900">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-red-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 block">
                      Moving Out / Urgent Sale
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Mark as urgent to sell before semester ends
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                disabled={
                  (!title && selectedSubcategory?.id !== "other") ||
                  description.trim().length < 10 ||
                  !price ||
                  !pickupLocation
                }
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
              >
                Continue to Photos <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PHOTOS & FINAL PUBLISH */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">
                Photos & Publish
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add 1 to 10 photos of your item. The first photo is your listing cover.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#10141b]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {imageUrls.map((url, index) => (
                  <div
                    key={url}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-zinc-800"
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />

                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                        Cover Photo
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => setCoverImage(index)}
                          className="rounded-md bg-white px-2 py-1 text-[10px] font-bold text-gray-800 shadow hover:bg-gray-100"
                        >
                          Make Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded-md bg-rose-600 p-1 text-white shadow hover:bg-rose-700"
                        aria-label="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {images.length < 10 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 text-gray-500 transition hover:border-primary hover:bg-primary/5 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400">
                    <Upload size={24} className="mb-1 text-gray-400" />
                    <span className="text-xs font-semibold">Upload Photo</span>
                    <span className="text-[10px] text-gray-400">Up to 5MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Review Summary */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-xs dark:border-white/10 dark:bg-zinc-900/60">
                <span className="font-bold text-gray-700 dark:text-gray-300 block mb-2">
                  Listing Summary
                </span>
                <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                  <div>Title: <strong className="text-gray-900 dark:text-white">{title || customOtherTitle}</strong></div>
                  <div>Price: <strong className="text-gray-900 dark:text-white">₹{price}</strong></div>
                  <div>Format: <strong className="text-gray-900 dark:text-white">{listingMode}</strong></div>
                  <div>Location: <strong className="text-gray-900 dark:text-white">{pickupLocation}</strong></div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <ChevronLeft size={14} className="inline mr-1" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || images.length === 0}
                  className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
                >
                  {isSubmitting ? "Publishing to Campus..." : "Publish Listing"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Completion Guidance Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-7 max-w-md w-full border border-gray-200 dark:border-white/10 shadow-xl relative">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
              Complete Your Student Profile
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
              To keep the campus marketplace safe for all students, sellers must verify their university details once before publishing listings.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => router.push(`/complete-profile?redirect=${encodeURIComponent("/sell")}`)}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                Complete Profile <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="py-2.5 px-4 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
