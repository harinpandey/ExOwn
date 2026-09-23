"use client";

import { useLocation } from "@/context/LocationContext";

export default function ActiveCampusBanner() {
  const { selectedCampus, setSelectedCampus, campusObj } = useLocation();

  return (
    <section className="container mx-auto px-4 py-14">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-primary">Active campus location</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {selectedCampus}
          </h2>
          <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-white/52">
            Marketplace listings, search results, and local trust signals are currently tuned for {campusObj.shortName}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-xs font-black text-gray-900 shadow-sm outline-none dark:border-white/10 dark:bg-[#10141b] dark:text-white"
          >
            <option value="Lovely Professional University">LPU Campus</option>
            <option value="Delhi University">Delhi University</option>
            <option value="Chandigarh University">Chandigarh University</option>
            <option value="VIT Vellore">VIT Vellore</option>
          </select>
        </div>
      </div>
    </section>
  );
}
