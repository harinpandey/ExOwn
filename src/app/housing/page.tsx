"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Home,
  MapPin,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  Wifi,
  Utensils,
  Zap,
  Wind,
  Bed,
  X,
  Search,
} from "lucide-react";
import { getHousingListings, revealHousingOwnerPhone } from "@/actions/housing";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useLocation } from "@/context/LocationContext";
import { useMoments } from "@/context/MomentsContext";
import { getLocalitiesForCampus } from "@/config/localities";

export default function HousingPage() {
  const { selectedCampus, campusObj } = useLocation();
  const { triggerEvent } = useMoments();
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerPhones, setOwnerPhones] = useState<Record<string, string>>({});
  const [phoneLoadingFor, setPhoneLoadingFor] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocality, setSelectedLocality] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [maxRent, setMaxRent] = useState(25000);
  const [genderPref, setGenderPref] = useState("ANY");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const campusConfig = getLocalitiesForCampus(campusObj?.shortName || campusObj?.name || selectedCampus);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getHousingListings({
      campus: selectedCampus,
      type: selectedType,
      maxRent,
      gender: genderPref,
    })
      .then((data) => { if (active) setListings(data); })
      .catch((error) => console.error("[HousingPage] Failed to load selected campus listings:", error))
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [selectedCampus, selectedType, maxRent, genderPref]);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerEvent("HOUSING_MATCH", { campusName: campusObj?.name, customCtaHref: "/housing" });
    }, 4500);
    return () => clearTimeout(timer);
  }, [campusObj, triggerEvent]);

  const handleRevealOwnerPhone = async (listingId: string) => {
    if (!user) {
      router.push("/login?redirect=/housing");
      return;
    }

    setPhoneLoadingFor(listingId);
    try {
      const result = await revealHousingOwnerPhone(listingId);
      if (result.success && result.phone) {
        setOwnerPhones((current) => ({ ...current, [listingId]: result.phone }));
      } else {
        toast.error(result.error || "Unable to load the owner's contact number.");
      }
    } catch {
      toast.error("Unable to load the owner's contact number.");
    } finally {
      setPhoneLoadingFor(null);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const filteredListings = listings.filter((item) => {
    if (selectedLocality !== "ALL") {
      const loc = selectedLocality.toLowerCase();
      const matchLocality = item.locality?.toLowerCase().includes(loc);
      const matchAddress = item.address?.toLowerCase().includes(loc);
      if (!matchLocality && !matchAddress) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchAddress = (item.address || "").toLowerCase().includes(q);
      const matchLocality = item.locality?.toLowerCase().includes(q);
      if (!matchTitle && !matchAddress && !matchLocality) return false;
    }

    if (selectedAmenities.length > 0) {
      const hasAll = selectedAmenities.every((a) => item.amenities?.includes(a));
      if (!hasAll) return false;
    }

    return true;
  });

  const housingTypes = [
    { id: "ALL", label: "All Stay Types", icon: Home },
    { id: "PG", label: "Paying Guest (PG)", icon: Building2 },
    { id: "HOSTEL_TRANSFER", label: "Hostels", icon: Bed },
    { id: "FLAT", label: "Flats & Apartments", icon: Home },
    { id: "SHARED_ROOM", label: "Shared Rooms", icon: Bed },
  ];

  const amenityOptions = [
    { name: "WiFi", icon: Wifi },
    { name: "Food Included", icon: Utensils },
    { name: "AC", icon: Wind },
    { name: "Power Backup", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 py-8 transition-colors dark:bg-[#090c12] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E4DCD3] bg-[#EFE5DA] p-6 text-[#183B38] shadow-sm dark:border-white/10 dark:bg-[#1B302D] dark:text-white sm:p-10">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <ShieldCheck size={14} /> Campus Housing
            </span>
            <h1 className="text-2xl font-black leading-tight tracking-tight text-[#183B38] dark:text-white sm:text-4xl">
              Find your next campus home near {campusObj?.name || "your campus"}
            </h1>
            <p className="text-sm font-medium leading-7 text-gray-600 dark:text-gray-400">
              Browse live PGs, hostels, flats, and shared rooms around your university, with rent and amenities listed clearly.
            </p>

            {/* Quick Search */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2 pt-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by locality, area, PG name or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl bg-[#EFE5DA] dark:bg-[#182D2A] pl-10 pr-4 py-3 text-xs sm:text-sm text-[#183B38] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#17645F]/400 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-[#E4DCD3] bg-[#E6DACE] px-4 py-3 text-[#526663] dark:border-white/10 dark:bg-[#EFE5DA]/[0.04] dark:text-gray-200">
                <MapPin size={16} className="text-amber-300" />
                <span className="text-xs font-bold">{campusObj?.name || selectedCampus || "Selected campus"}</span>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-100/80 blur-3xl dark:bg-blue-500/10" />
        </div>

        {/* Housing Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {housingTypes.map((t) => {
            const Icon = t.icon;
            const active = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-[#17645F] text-white shadow-lg shadow-blue-500/25"
                    : "bg-[#EFE5DA] dark:bg-[#1B302D] text-[#526663] dark:text-white/80 border border-[#E4DCD3] dark:border-white/10 hover:border-blue-400"
                }`}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Student Localities Discovery Bar */}
        {campusConfig && campusConfig.localities.length > 0 ? (
          <div className="bg-[#EFE5DA] dark:bg-[#1B302D] rounded-2xl p-4 border border-[#E4DCD3] dark:border-white/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#526663] dark:text-gray-300">
                <MapPin size={14} className="text-blue-500" />
                <span>Campus Localities near {campusConfig.campusName}</span>
              </div>
              {selectedLocality !== "ALL" && (
                <button
                  onClick={() => setSelectedLocality("ALL")}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear Locality
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedLocality("ALL")}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedLocality === "ALL"
                    ? "bg-[#17645F] text-white font-bold"
                    : "bg-[#E1D3C5] dark:bg-gray-800 text-[#526663] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                All Localities
              </button>
              {campusConfig.localities.map((loc) => {
                const active = selectedLocality === loc.name;
                return (
                  <button
                    key={loc.name}
                    onClick={() => setSelectedLocality(active ? "ALL" : loc.name)}
                    title={loc.description}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? "bg-[#17645F] text-white font-bold shadow-sm"
                        : "bg-[#E1D3C5] dark:bg-gray-800 text-[#526663] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>{loc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[#EFE5DA] dark:bg-[#1B302D] rounded-2xl p-3 px-4 border border-[#E4DCD3] dark:border-white/10 shadow-sm flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gray-400" />
              <span>Curated student localities for {campusObj.name || "this campus"} coming soon. Use search below to filter by address.</span>
            </div>
          </div>
        )}

        {/* Layout Grid: Filters Sidebar + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <aside className="h-max space-y-5 rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-5 shadow-sm dark:border-white/10 dark:bg-[#1B302D] lg:sticky lg:top-24 lg:col-span-1">
            <div className="flex items-center justify-between border-b border-[#E4DCD3] dark:border-white/10 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-black text-[#183B38] dark:text-white">
                <SlidersHorizontal size={16} className="text-blue-600" /> Filters
              </h3>
              <button
                onClick={() => {
                  setSelectedType("ALL");
                  setSelectedLocality("ALL");
                  setMaxRent(25000);
                  setGenderPref("ANY");
                  setSelectedAmenities([]);
                  setSearchQuery("");
                }}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Rent Range */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#526663] dark:text-white/80 mb-2">
                <span>Max Monthly Rent</span>
                <span className="text-blue-600 dark:text-blue-400">₹{maxRent.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min={3000}
                max={30000}
                step={1000}
                value={maxRent}
                onChange={(e) => setMaxRent(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-1">
                <span>₹3,000</span>
                <span>₹30,000+</span>
              </div>
            </div>

            {/* Gender Preference */}
            <div>
              <h4 className="text-xs font-bold text-[#526663] dark:text-white/80 mb-2">Occupant Preference</h4>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "ANY", label: "Any" },
                  { id: "MALE", label: "Boys" },
                  { id: "FEMALE", label: "Girls" },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGenderPref(g.id)}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                      genderPref === g.id
                        ? "bg-[#17645F] text-white border-[#17645F] shadow-sm"
                        : "border-[#E4DCD3] dark:border-white/10 text-gray-600 dark:text-white/70 hover:bg-[#E6DACE] dark:hover:bg-[#EFE5DA]/[0.04]"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Filter */}
            <div>
              <h4 className="text-xs font-bold text-[#526663] dark:text-white/80 mb-2">Included Amenities</h4>
              <div className="space-y-1.5">
                {amenityOptions.map((a) => {
                  const Icon = a.icon;
                  const active = selectedAmenities.includes(a.name);
                  return (
                    <button
                      key={a.name}
                      onClick={() => toggleAmenity(a.name)}
                      className={`w-full flex items-center justify-between p-2.5 text-xs font-medium rounded-xl border transition ${
                        active
                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-600 dark:text-blue-400 font-bold"
                          : "border-[#E4DCD3] dark:border-white/10 text-gray-600 dark:text-white/70 hover:border-gray-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={14} />
                        {a.name}
                      </span>
                      {active && <CheckCircle2 size={14} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Results Main Area */}
          <main className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500 dark:text-white/50">
                <span className="font-black text-[#183B38] dark:text-white">{filteredListings.length}</span> housing options
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    viewMode === "grid"
                      ? "bg-[#17645F] text-white border-[#17645F]"
                      : "bg-[#EFE5DA] dark:bg-[#1B302D] text-gray-600 dark:text-white/70 border-[#E4DCD3] dark:border-white/10"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    viewMode === "list"
                      ? "bg-[#17645F] text-white border-[#17645F]"
                      : "bg-[#EFE5DA] dark:bg-[#1B302D] text-gray-600 dark:text-white/70 border-[#E4DCD3] dark:border-white/10"
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-3xl bg-gray-200 dark:bg-[#EFE5DA]/5 animate-pulse" />
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
                {filteredListings.map((item) => (
                  <article
                    key={item.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-lg dark:border-white/10 dark:bg-[#1B302D]"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                          {item.type.replace("_", " ")}
                        </span>
                        {item.isVerifiedByAdmin && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck size={12} /> Verified Property
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-[#183B38] dark:text-white line-clamp-1 group-hover:text-blue-600 transition">
                        {item.title}
                      </h3>

                      {/* Address & Distance */}
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-white/50">
                        <MapPin size={13} className="shrink-0 text-blue-500" />
                        <span className="truncate">{item.address}</span>
                      </div>

                      {/* Rent details */}
                      <div className="mt-3 flex items-baseline gap-2 bg-slate-50 dark:bg-[#EFE5DA]/[0.03] p-3 rounded-2xl">
                        <div>
                          <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                            ₹{item.monthlyRent.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs font-bold text-gray-400"> /month</span>
                        </div>
                        {item.securityDeposit && (
                          <span className="ml-auto text-[11px] font-semibold text-gray-400">
                            Deposit: ₹{item.securityDeposit.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Amenities pills */}
                      {item.amenities && item.amenities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.amenities.slice(0, 4).map((a: string) => (
                            <span
                              key={a}
                              className="rounded-lg bg-[#E1D3C5] dark:bg-[#EFE5DA]/[0.05] px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:text-white/70"
                            >
                              ✓ {a}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="mt-3 text-xs text-gray-500 dark:text-white/60 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Footer Contact */}
                    <div className="mt-4 border-t border-[#E4DCD3] dark:border-white/[0.06] pt-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#17645F]/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {item.owner?.name ? item.owner.name.charAt(0) : "O"}
                        </div>
                        <div>
                          <p className="font-bold text-[#183B38] dark:text-white text-[11px]">{item.owner?.name || "Verified Owner"}</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{item.distance}</p>
                        </div>
                      </div>

                      {ownerPhones[item.id] ? (
                        <a
                          href={`tel:${ownerPhones[item.id]}`}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
                        >
                          <Phone size={13} />
                          Call Owner
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevealOwnerPhone(item.id)}
                          disabled={phoneLoadingFor === item.id}
                          className="flex items-center gap-1.5 rounded-xl bg-[#17645F] px-3 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-[#124F4B] disabled:cursor-wait disabled:opacity-60"
                        >
                          <Phone size={13} />
                          {phoneLoadingFor === item.id ? "Loading..." : user ? "Show phone number" : "Sign in to contact"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-[#EFE5DA] dark:bg-[#1B302D] rounded-3xl border border-[#E4DCD3] dark:border-white/10 p-12 text-center shadow-sm">
                <Building2 size={40} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-base font-black text-[#183B38] dark:text-white">{listings.length === 0 ? "No live stays listed yet" : "No properties match these filters"}</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                  Try a different locality or stay type, increase your rent limit, or clear some filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedType("ALL");
                    setSelectedLocality("ALL");
                    setMaxRent(25000);
                    setGenderPref("ANY");
                    setSelectedAmenities([]);
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 bg-[#17645F] text-white rounded-xl text-xs font-bold"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
