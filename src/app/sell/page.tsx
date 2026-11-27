"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Upload, X, ArrowRight, ChevronLeft, Trash2, AlertCircle, RefreshCw, ShoppingBag, Key, HelpCircle, BriefcaseBusiness } from "lucide-react";
import LocationSelector from '@/components/ui/LocationSelector';
import CategoryConditionForm from "@/components/forms/CategoryConditionForm";
import CampusSelector from "@/components/ui/CampusSelector";
import { CATEGORIES, Category, Subcategory } from "@/config/categories";
import { toast } from "react-hot-toast";
import * as LucideIcons from "lucide-react";

const SEARCH_ALIASES: Record<string, string[]> = {
  "mobiles-gadgets": ["mobile", "phone", "phones", "smartphone", "iphone", "android", "handset", "telephone"],
  "computers-laptops": ["computer", "laptop", "notebook", "pc", "macbook"],
  "electronics-appliances": ["electronic", "tv", "television", "fridge", "refrigerator", "camera", "speaker", "air conditioner"],
  "furniture-hostel": ["furniture", "hostel item", "chair", "table", "bed", "mattress"],
  "books-sports-hobbies": ["book", "textbook", "notes", "study material", "calculator"],
  vehicles: ["cycle", "bicycle", "bike", "motorbike", "motorcycle", "scooty", "car"],
  properties: ["room", "pg", "paying guest", "housing", "flat", "apartment", "roommate"],
  "tickets-events": ["ticket", "concert", "movie ticket", "match ticket"],
  gaming: ["game", "console", "playstation", "xbox"],
};
const SUBCATEGORY_ALIASES: Record<string, string[]> = {
  iphones: ["iphone", "apple phone"], "android-phones": ["android", "samsung", "oneplus", "xiaomi", "redmi"],
  laptop: ["notebook", "macbook"], cycles: ["bicycle", "pedal cycle"], motorcycles: ["motorbike", "two wheeler"],
  scooters: ["scooty"], pg: ["paying guest"], shared: ["roommate", "flatmate", "shared room"],
  textbooks: ["text book", "course book"], tutoring: ["tuition", "tutor"],
};
const matchesSearch = (query: string, values: string[]) => {
  const q = query.toLowerCase().trim().replace(/[^a-z0-9 ]/g, "");
  if (!q) return true;
  const text = values.join(" ").toLowerCase().replace(/[^a-z0-9 ]/g, "");
  return q.split(/\s+/).every((part) => text.includes(part) || (part.length > 4 && text.split(/\s+/).some((word) => {
    if (Math.abs(word.length - part.length) > 1) return false;
    let edits = 0, i = 0, j = 0;
    while (i < part.length && j < word.length) {
      if (part[i] === word[j]) { i++; j++; }
      else if (++edits > 1) return false;
      else if (part.length > word.length) i++;
      else if (word.length > part.length) j++;
      else { i++; j++; }
    }
    return edits + (part.length - i) + (word.length - j) <= 1;
  })));
};
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "mobiles-gadgets": "Phones, tablets, smartwatches and mobile accessories.",
  "electronics-appliances": "Cameras, speakers, appliances and everyday electronics.",
  "computers-laptops": "Laptops, desktops, monitors and computer accessories.",
  "furniture-hostel": "Study tables, chairs, lamps and hostel essentials.",
  fashion: "Clothing, shoes, bags, watches and accessories.",
  "books-sports-hobbies": "Textbooks, notes, calculators, sports and hobby gear.",
  vehicles: "Cycles, e-bikes, scooters, motorcycles and vehicle accessories.",
  properties: "Rooms, PGs, flats and shared accommodation.",
  jobs: "Internships, part-time work and freelance opportunities.",
  services: "Tutoring, repairs, printing and student services.",
  "tickets-events": "Eligible movie, concert, sports and campus event tickets.",
  gaming: "Gaming consoles, games and gaming accessories.",
};

export default function SellPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#E6DACE] dark:bg-gray-950 flex items-center justify-center">
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
  const [isTicketTransferAllowed, setIsTicketTransferAllowed] = useState(false);

  // Listing Mode
  const [listingMode, setListingMode] = useState<"SELL" | "RENT" | "EXCHANGE" | "SERVICE">("SELL");

  // Media
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Category & Campus Selection
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [customOtherTitle, setCustomOtherTitle] = useState("");
  const [campusId, setCampusId] = useState("");
  const [campusSlug, setCampusSlug] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [subcategorySearch, setSubcategorySearch] = useState("");

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

  // Read initial query parameter (?type=RENT, EXCHANGE, SERVICE or WANT)
  useEffect(() => {
    const typeParam = searchParams.get("type")?.toUpperCase();
    if (typeParam === "RENT") {
      setListingMode("RENT"); setStep(2);
    } else if (typeParam === "EXCHANGE") {
      setListingMode("EXCHANGE"); setStep(2);
    } else if (typeParam === "SERVICE") {
      setListingMode("SERVICE"); setStep(2);
    } else if (typeParam === "WANT") {
      router.replace("/requests");
    }

    if (searchParams.get("category") === "tickets-events") {
      const ticketCategory = CATEGORIES.find((category) => category.slug === "tickets-events");
      if (ticketCategory) {
        setSelectedCategory(ticketCategory);
        setSelectedSubcategory(null);
        setStep(2);
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(searchParams.toString() ? `/sell?${searchParams.toString()}` : "/sell")}`);
    }
  }, [user, loading, router, searchParams]);

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

      if (images.length + validFiles.length > 20) {
        toast.error("Maximum 20 images allowed");
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

    const isTicketListing = selectedCategory?.slug === "tickets-events";
    if (isTicketListing) {
      if (listingMode !== "SELL") {
        return toast.error("Tickets can only be listed as eligible sales or transfers.");
      }
      const ticketDetails = [
        title,
        description,
        selectedSubcategory?.name,
        customOtherTitle,
      ].filter(Boolean).join(" ");
      if (/\b(train|railway|irctc|pnr)\b/i.test(ticketDetails)) {
        return toast.error("Train tickets cannot be resold on ExOwn. Use official railway cancellation or authorised name-change rules.");
      }
      if (!isTicketTransferAllowed) {
        return toast.error("Confirm that the original event issuer allows this ticket to be transferred or resold.");
      }
    }

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

      const { createProduct, getCategories, getSubcategories, ensureTicketCategory } = await import("@/actions/product");
      const dbCategories = await getCategories();
      const dbCat = selectedCategory?.slug === "tickets-events"
        ? await ensureTicketCategory()
        : dbCategories.find(c => c.slug === selectedCategory?.slug);
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
        conditionDetails: isTicketListing
          ? { ...(conditionDetails && typeof conditionDetails === "object" ? conditionDetails : {}), ticketTransferAllowed: true }
          : conditionDetails,
        price: parsedPrice,
        location: pickupLocation.trim(),
        campusId,
        images: uploadedImageUrls,
        isNegotiable,
        isUrgent,
        listingType: listingMode === "RENT" ? ("RENT" as const) : listingMode === "SERVICE" ? ("SERVICE" as const) : ("SELL" as const),
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
    <div className="min-h-screen bg-[#E6DACE] pb-20 dark:bg-[#0b0e14]">
      {/* Top Header */}
      <div className="sticky top-0 z-40 border-b border-[#E4DCD3] bg-[#EFE5DA]/95 backdrop-blur dark:border-white/10 dark:bg-[#1B302D]/95">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Cancel and go back"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4DCD3] text-gray-500 hover:bg-[#E1D3C5] dark:border-white/10 dark:text-gray-400 dark:hover:bg-zinc-800"
            >
              <X size={18} />
            </button>
            <h1 className="text-base font-bold text-[#183B38] dark:text-white">
              Post a Listing
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[#EAF2EF] px-2.5 py-1 text-[11px] font-bold text-[#17645F] sm:inline-flex dark:bg-[#14251D] dark:text-[#9BC5B1]">
              Free listing
            </span>
            <span className="text-xs font-semibold tabular-nums text-gray-500 dark:text-gray-400">
              {step} / 6
            </span>
          </div>
        </div>

        {/* Step Progress */}
        <div className="mx-auto max-w-4xl px-4 pt-3">
          <div className="grid grid-cols-6 gap-1.5" aria-label="Listing progress">
            {["Type", "Category", "Subcategory", "Details", "Ad info", "Photos"].map((label, index) => (
              <div key={label} className="min-w-0">
                <div className={`h-1.5 rounded-full transition-colors ${step > index ? "bg-[#17645F]" : "bg-gray-200 dark:bg-zinc-800"}`} />
                <span className={`mt-1.5 hidden truncate text-[10px] font-semibold sm:block ${step === index + 1 ? "text-[#17645F] dark:text-[#9BC5B1]" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* STEP 1: WHAT ARE YOU LISTING? */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#183B38] sm:text-2xl dark:text-white">
                What would you like to post?
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose the transaction model for this listing.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* SELL */}
              <button
                type="button"
                onClick={() => { setListingMode("SELL"); setStep(2); }}
                className={`flex flex-col items-start rounded-2xl border-2 p-5 text-left transition ${
                  listingMode === "SELL"
                    ? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
                    : "border-[#E4DCD3] bg-[#EFE5DA] hover:border-gray-300 dark:border-white/10 dark:bg-[#1B302D] dark:hover:border-white/20"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <ShoppingBag size={22} />
                </div>
                <span className="mt-3 text-base font-bold text-[#183B38] dark:text-white">
                  Post an Item
                </span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Post books, electronics, gadgets, cycles, or hostel essentials for other students.
                </span>
              </button>

              {/* RENT */}
              <button
                type="button"
                onClick={() => { setListingMode("RENT"); setStep(2); }}
                className={`flex flex-col items-start rounded-2xl border-2 p-5 text-left transition ${
                  listingMode === "RENT"
                    ? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
                    : "border-[#E4DCD3] bg-[#EFE5DA] hover:border-gray-300 dark:border-white/10 dark:bg-[#1B302D] dark:hover:border-white/20"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <Key size={22} />
                </div>
                <span className="mt-3 text-base font-bold text-[#183B38] dark:text-white">
                  Rent Out
                </span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Rent out items daily or weekly (cameras, calculators, lab coats, tools).
                </span>
              </button>

              {/* EXCHANGE */}
              <button
                type="button"
                onClick={() => { setListingMode("EXCHANGE"); setStep(2); }}
                className={`flex flex-col items-start rounded-2xl border-2 p-5 text-left transition ${
                  listingMode === "EXCHANGE"
                    ? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
                    : "border-[#E4DCD3] bg-[#EFE5DA] hover:border-gray-300 dark:border-white/10 dark:bg-[#1B302D] dark:hover:border-white/20"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <RefreshCw size={22} />
                </div>
                <span className="mt-3 text-base font-bold text-[#183B38] dark:text-white">
                  Offer an Exchange
                </span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Trade an item for another desired item, with or without cash difference.
                </span>
              </button>

              {/* SERVICE */}
              <button
                type="button"
                onClick={() => { setListingMode("SERVICE"); setStep(2); }}
                className={`flex flex-col items-start rounded-2xl border-2 p-5 text-left transition ${
                  listingMode === "SERVICE"
                    ? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
                    : "border-[#E4DCD3] bg-[#EFE5DA] hover:border-gray-300 dark:border-white/10 dark:bg-[#1B302D] dark:hover:border-white/20"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <BriefcaseBusiness size={22} />
                </div>
                <span className="mt-3 text-base font-bold text-[#183B38] dark:text-white">Offer a Service</span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Offer tutoring, repairs, design, printing or other student services.
                </span>
              </button>

              {/* POST A REQUEST (Requests Board) */}
              <button
                type="button"
                onClick={() => router.push("/requests")}
                className="flex flex-col items-start rounded-2xl border-2 border-dashed border-[#E4DCD3] bg-[#EFE5DA] p-5 text-left transition hover:border-gray-300 dark:border-white/10 dark:bg-[#1B302D] dark:hover:border-white/20"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <HelpCircle size={22} />
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-base font-bold text-[#183B38] dark:text-white">
                    Looking to Buy?
                  </span>
                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    Requests Board
                  </span>
                </div>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Tell students what you need and let people on campus reach out to you.
                </span>
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Select an option to continue directly to its listing categories.
            </p>
          </div>
        )}

        {/* STEP 2: CATEGORY & CAMPUS */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#183B38] sm:text-2xl dark:text-white">
                Category & Campus Location
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose the category and campus so nearby students can discover your listing.
              </p>
            </div>

            {/* Campus Selector */}
            <div className="rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-5 shadow-sm dark:border-white/10 dark:bg-[#1B302D]">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">
                Select Campus
              </label>
              <CampusSelector
                onSelect={(id, slug) => {
                  setCampusId(id);
                  setCampusSlug(slug);
                  setPickupLocation("");
                }}
                selectedId={campusId}
              />
            </div>

            {/* Category Grid */}
            <div className="rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-5 shadow-sm dark:border-white/10 dark:bg-[#1B302D]">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">
                What are you listing?
              </label>
              <input
                type="search"
                value={categorySearch}
                onChange={(event) => setCategorySearch(event.target.value)}
                placeholder="Search categories..."
                className="mb-4 w-full rounded-xl border border-[#E4DCD3] bg-[#E6DACE] px-4 py-3 text-sm text-[#183B38] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CATEGORIES.filter((cat) => matchesSearch(categorySearch, [cat.name, cat.slug, CATEGORY_DESCRIPTIONS[cat.slug] || "", ...(SEARCH_ALIASES[cat.slug] || []), ...cat.subcategories.flatMap((sub) => [sub.name, sub.id, ...(SUBCATEGORY_ALIASES[sub.id] || [])])])).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedSubcategory(null);
                      setSubcategorySearch("");
                      if (cat.slug === "tickets-events") {
                        setListingMode("SELL");
                        setIsTicketTransferAllowed(false);
                      }
                      setStep(3);
                    }}
                    className={`flex min-h-[150px] flex-col items-start rounded-2xl border-2 p-5 text-left transition ${
                      selectedCategory?.id === cat.id
                        ? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
                        : "border-[#E4DCD3] bg-[#EFE5DA] hover:border-gray-300 dark:border-white/10 dark:bg-[#1B302D] dark:hover:border-white/20"
                    }`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF2EF] text-[#17645F] dark:bg-[#14251D] dark:text-[#9BC5B1]">
                      <DynamicIcon name={cat.icon} size={22} />
                    </span>
                    <span className="mt-3 text-sm font-bold text-[#183B38] dark:text-white">{cat.name}</span>
                    <span className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {CATEGORY_DESCRIPTIONS[cat.slug] || "Find the right listing type for your campus community."}
                    </span>
                  </button>
                ))}
              </div>

            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#183B38] dark:text-gray-400 dark:hover:text-white"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tap a category to view its subcategories
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE A SUBCATEGORY */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-1 rounded-full p-2 text-gray-600 transition hover:bg-[#E1D3C5] dark:text-gray-300 dark:hover:bg-zinc-800"
                aria-label="Back to categories"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1">
                <span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  {listingMode === "SELL" ? "SELLING" : listingMode === "RENT" ? "RENTING OUT" : listingMode === "EXCHANGE" ? "EXCHANGE" : "SERVICE"}
                </span>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-[#183B38] sm:text-2xl dark:text-white">
                  {selectedCategory?.name || "Choose a category"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">What type of item or listing is it?</p>
              </div>
            </div>

            {!campusId && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <p className="mb-3 text-sm font-semibold text-amber-900 dark:text-amber-200">Choose your campus to continue</p>
                <CampusSelector
                  onSelect={(id, slug) => {
                    setCampusId(id);
                    setCampusSlug(slug);
                    setPickupLocation("");
                  }}
                  selectedId={campusId}
                />
              </div>
            )}

            <input
              type="search"
              value={subcategorySearch}
              onChange={(event) => setSubcategorySearch(event.target.value)}
              placeholder="Search items..."
              className="w-full rounded-xl border border-[#E4DCD3] bg-[#EFE5DA] px-4 py-3 text-sm text-[#183B38] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-white/10 dark:bg-[#1B302D] dark:text-white"
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(selectedCategory?.subcategories || [])
                .filter((sub) => matchesSearch(subcategorySearch, [sub.name, sub.id, ...(SUBCATEGORY_ALIASES[sub.id] || [])]))
                .map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    disabled={!campusId}
                    onClick={() => {
                      if (!campusId) {
                        toast.error("Please select your campus first");
                        return;
                      }
                      setSelectedSubcategory(sub);
                      setStep(4);
                    }}
                    className="group flex items-center justify-between rounded-xl border border-[#E4DCD3] bg-[#EFE5DA] p-4 text-left transition hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#1B302D] dark:hover:border-primary/40"
                  >
                    <span className="text-sm font-semibold text-[#183B38] dark:text-white">{sub.name}</span>
                    <ArrowRight size={16} className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                ))}
            </div>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">Select a subcategory to open its listing form</p>
          </div>
        )}

        {/* STEP 4: CATEGORY-SPECIFIC DETAILS & CONDITION */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#183B38] sm:text-2xl dark:text-white">
                Item Specifications & Condition
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {selectedCategory?.name} • {selectedSubcategory?.name}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-5 shadow-sm dark:border-white/10 dark:bg-[#1B302D]">
              <CategoryConditionForm
                categoryName={selectedCategory?.name || ""}
                subcategoryName={selectedSubcategory?.name || ""}
                onOtherTitleChange={setCustomOtherTitle}
                onComplete={(details, cond) => {
                  setConditionDetails(details);
                  setFinalCondition(cond);
                  // Selecting the final condition completes this step and moves
                  // directly to ad details; no separate Continue button needed.
                  setStep(5);
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#183B38] dark:text-gray-400 dark:hover:text-white"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Choose your condition to continue automatically
              </span>
            </div>
          </div>
        )}

        {/* STEP 5: TITLE, DESCRIPTION, PRICE & LOCATION */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#183B38] sm:text-2xl dark:text-white">
                Listing Details & Pricing
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Provide clear, accurate details to help buyers find your item.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#1B302D]">
              {/* Title */}
              {selectedSubcategory?.id !== "other" && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Ad title *
                    </label>
                    <span className={`text-[11px] font-semibold tabular-nums ${title.length > 70 ? "text-rose-600" : "text-gray-400"}`}>{title.length}/70</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={70}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={selectedCategory?.slug === "tickets-events" ? "e.g. Concert ticket — 2 seated tickets" : "e.g. iPhone 13 128GB in good condition"}
                    className="w-full rounded-xl border border-gray-300 bg-[#EFE5DA] px-4 py-2.5 text-sm font-medium text-[#183B38] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
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
                    {description.length}/1500 characters
                  </span>
                </div>
                <textarea
                  rows={5}
                  maxLength={1500}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={selectedCategory?.slug === "tickets-events" ? "Include event name, date, venue, ticket category/seat, number of tickets and the official transfer method. Do not include QR codes, barcodes, PNRs or booking references." : "Mention usage duration, working condition, included accessories, or reasons for parting with the item..."}
                  className="w-full rounded-xl border border-gray-300 bg-[#EFE5DA] p-3 text-sm text-[#183B38] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              {selectedCategory?.slug === "tickets-events" && (
                <div className="rounded-xl border border-[#DCE8E2] bg-[#EAF2EF] p-4 dark:border-[#2A4136] dark:bg-[#14251D]">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isTicketTransferAllowed}
                      onChange={(event) => setIsTicketTransferAllowed(event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#B9CEC3] text-[#17645F] focus:ring-[#17645F]"
                    />
                    <span>
                      <span className="block text-xs font-extrabold text-[#183B38] dark:text-[#E8F0EB]">I confirm this ticket is eligible for transfer or resale.</span>
                      <span className="mt-1 block text-[11px] leading-5 text-[#526663] dark:text-[#B4C5BC]">I checked the original organiser/provider rules and will use its approved transfer method. I will not list a train ticket or expose a live QR code, barcode, PNR or booking reference.</span>
                    </span>
                  </label>
                </div>
              )}

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
                      className="w-full rounded-xl border border-gray-300 bg-[#EFE5DA] py-2.5 pl-8 pr-4 text-base font-bold text-[#183B38] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                    {selectedCategory?.slug === "tickets-events" ? "Public Handover / Meet-up Spot *" : "Pickup Location / Spot *"}
                  </label>
                  <LocationSelector
                    campusSlug={campusSlug}
                    selectedLocation={pickupLocation}
                    onSelect={setPickupLocation}
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    {selectedCategory?.slug === "tickets-events" ? "Use a public campus spot if an in-person handover is needed. Complete digital transfers only through the original issuer." : "Use public campus spots. Never provide private hostel room numbers."}
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
                            : "bg-[#EFE5DA] border border-[#E4DCD3] text-[#526663] dark:bg-zinc-800 dark:border-white/10 dark:text-zinc-200"
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
                    <span className="text-xs font-medium text-[#526663] dark:text-gray-300">
                      Open to trades with cash difference (e.g., item + cash adjustment)
                    </span>
                  </label>
                </div>
              )}

              {/* Toggles (Negotiable, Urgent) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E4DCD3] dark:border-white/10">
                <label className="flex items-center gap-2.5 rounded-xl border border-[#E4DCD3] bg-[#E6DACE]/50 p-3 cursor-pointer dark:border-white/10 dark:bg-zinc-900">
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

                <label className="flex items-center gap-2.5 rounded-xl border border-[#E4DCD3] bg-[#E6DACE]/50 p-3 cursor-pointer dark:border-white/10 dark:bg-zinc-900">
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
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#183B38] dark:text-gray-400 dark:hover:text-white"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(6)}
                disabled={
                  (!title && selectedSubcategory?.id !== "other") ||
                  description.trim().length < 10 ||
                  !price ||
                  !pickupLocation ||
                  (selectedCategory?.slug === "tickets-events" && !isTicketTransferAllowed)
                }
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
              >
                Continue to Photos <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: PHOTOS & FINAL PUBLISH */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#183B38] sm:text-2xl dark:text-white">
                Photos & Publish
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add up to 20 clear photos. Your first photo is the cover image buyers see first.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#1B302D]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#526663] dark:text-gray-300">Photos</p>
                <span className="rounded-full bg-[#E1D3C5] px-2.5 py-1 text-xs font-bold tabular-nums text-gray-600 dark:bg-zinc-800 dark:text-gray-300">{images.length} / 20</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {imageUrls.map((url, index) => (
                  <div
                    key={url}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-[#E4DCD3] dark:border-white/10 bg-[#E1D3C5] dark:bg-zinc-800"
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
                          className="rounded-md bg-[#EFE5DA] px-2 py-1 text-[10px] font-bold text-gray-800 shadow hover:bg-[#E1D3C5]"
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

                {images.length < 20 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-[#E6DACE]/50 text-gray-500 transition hover:border-primary hover:bg-primary/5 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400">
                    <Upload size={24} className="mb-1 text-gray-400" />
                    <span className="text-xs font-semibold">Add photos</span>
                    <span className="text-[10px] text-gray-400">JPG, PNG or WEBP · 5MB max</span>
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
              <div className="rounded-xl border border-[#E4DCD3] bg-[#E6DACE]/70 p-4 text-xs dark:border-white/10 dark:bg-zinc-900/60">
                <span className="font-bold text-[#526663] dark:text-gray-300 block mb-2">
                  Listing Summary
                </span>
                <div className="grid grid-cols-1 gap-2 text-gray-600 dark:text-gray-400 sm:grid-cols-2">
                  <div>Title: <strong className="text-[#183B38] dark:text-white">{title || customOtherTitle}</strong></div>
                  <div>Price: <strong className="text-[#183B38] dark:text-white">₹{price}{listingMode === "RENT" ? "/day" : ""}</strong></div>
                  <div>Category: <strong className="text-[#183B38] dark:text-white">{selectedCategory?.name} · {selectedSubcategory?.name}</strong></div>
                  <div>Condition: <strong className="text-[#183B38] dark:text-white">{finalCondition.replaceAll("_", " ")}</strong></div>
                  <div>Format: <strong className="text-[#183B38] dark:text-white">{listingMode}</strong></div>
                  <div>Campus spot: <strong className="text-[#183B38] dark:text-white">{pickupLocation}</strong></div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#DCE8E2] bg-[#F4F8F6] p-4 dark:border-[#2A4136] dark:bg-[#14251D]/70">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E2EEE8] text-[#17645F] dark:bg-[#20392E] dark:text-[#9BC5B1]">
                    <HelpCircle size={17} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#183B38] dark:text-[#E8F0EB]">Before you publish</p>
                    <p className="mt-1 text-xs leading-5 text-[#526663] dark:text-[#B4C5BC]">
                      Your ExOwn profile and campus help buyers know who they are contacting. Your phone number stays private unless you choose to share it in chat. Listings may be reviewed before going live.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="rounded-xl border border-[#E4DCD3] px-5 py-3 text-xs font-bold text-[#526663] transition hover:bg-[#E6DACE] dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
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
          <div className="bg-[#EFE5DA] dark:bg-[#182D2A] rounded-2xl p-6 sm:p-7 max-w-md w-full border border-[#E4DCD3] dark:border-white/10 shadow-xl relative">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>

            <h3 className="text-lg font-bold text-[#183B38] dark:text-white mb-1.5">
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
                className="py-2.5 px-4 bg-[#E1D3C5] dark:bg-zinc-800 text-[#526663] dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
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
