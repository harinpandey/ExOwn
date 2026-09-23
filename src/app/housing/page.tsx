"use client";

import { useEffect, useState } from "react";
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
import { getHousingListings } from "@/actions/housing";
import { useLocation } from "@/context/LocationContext";

export default function HousingPage() {
  const { selectedCampus, campusObj } = useLocation();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [maxRent, setMaxRent] = useState(25000);
  const [genderPref, setGenderPref] = useState("ANY");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function loadHousing() {
      setLoading(true);
      const data = await getHousingListings({
        campus: selectedCampus,
        type: selectedType,
        maxRent: maxRent,
        gender: genderPref,
      });
      setListings(data);
      setLoading(false);
    }
    loadHousing();
  }, [selectedCampus, selectedType, maxRent, genderPref]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const filteredListings = listings.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAddress = item.address.toLowerCase().includes(q);
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090d] py-6 px-4 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur">
              <ShieldCheck size={14} /> Verified Student Housing
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Find Your Next Campus Home near {campusObj.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
              Explore PGs, Hostels, Flats, and Shared Rooms verified by university peers with direct owner contact and no brokerage fees.
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
                  className="w-full rounded-2xl bg-white dark:bg-gray-900 pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
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
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-2xl px-4 py-2 border border-white/20">
                <MapPin size={16} className="text-amber-300" />
                <span className="text-xs font-bold">{campusObj.name}</span>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white dark:bg-[#10141b] text-gray-700 dark:text-white/80 border border-gray-200 dark:border-white/10 hover:border-blue-400"
                }`}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Layout Grid: Filters Sidebar + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-1 space-y-5 bg-white dark:bg-[#10141b] p-5 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm h-max">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white">
                <SlidersHorizontal size={16} className="text-blue-600" /> Filters
              </h3>
              <button
                onClick={() => {
                  setSelectedType("ALL");
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
              <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-white/80 mb-2">
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
              <h4 className="text-xs font-bold text-gray-700 dark:text-white/80 mb-2">Occupant Preference</h4>
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
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 dark:text-white/80 mb-2">Included Amenities</h4>
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
                          : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:border-gray-300"
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
              <p className="text-xs font-bold text-gray-500 dark:text-white/50">
                Showing <span className="text-gray-900 dark:text-white">{filteredListings.length}</span> verified property options
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-[#10141b] text-gray-600 dark:text-white/70 border-gray-200 dark:border-white/10"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-[#10141b] text-gray-600 dark:text-white/70 border-gray-200 dark:border-white/10"
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-3xl bg-gray-200 dark:bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
                {filteredListings.map((item) => (
                  <article
                    key={item.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#10141b] p-5 shadow-sm transition hover:border-blue-500/40 hover:shadow-xl"
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
                      <h3 className="text-base font-black text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition">
                        {item.title}
                      </h3>

                      {/* Address & Distance */}
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-white/50">
                        <MapPin size={13} className="shrink-0 text-blue-500" />
                        <span className="truncate">{item.address}</span>
                      </div>

                      {/* Rent details */}
                      <div className="mt-3 flex items-baseline gap-2 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-2xl">
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
                              className="rounded-lg bg-gray-100 dark:bg-white/[0.05] px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:text-white/70"
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
                    <div className="mt-4 border-t border-gray-100 dark:border-white/[0.06] pt-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {item.owner?.name ? item.owner.name.charAt(0) : "O"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-[11px]">{item.owner?.name || "Verified Owner"}</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{item.distance}</p>
                        </div>
                      </div>

                      <a
                        href={`tel:${item.owner?.phone || "+919876543210"}`}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20"
                      >
                        <Phone size={13} />
                        Contact Owner
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#10141b] rounded-3xl border border-gray-200 dark:border-white/10 p-12 text-center shadow-sm">
                <Building2 size={40} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">No properties matched filters</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                  Try adjusting max rent budget, stay type, or removing amenity filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedType("ALL");
                    setMaxRent(25000);
                    setGenderPref("ANY");
                    setSelectedAmenities([]);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
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
