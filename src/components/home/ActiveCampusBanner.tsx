"use client";

import { useLocation } from "@/context/LocationContext";

export default function ActiveCampusBanner() {
  const { selectedCampus, setSelectedCampus, campusObj } = useLocation();

  return (
    <section className="container mx-auto px-4 py-14">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E4DCD3] bg-[#EFE5DA] p-5 shadow-sm dark:border-white/10 dark:bg-[#EFE5DA]/[0.04] sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-primary">Active campus location</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#183B38] dark:text-white">
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
            className="h-11 rounded-xl border border-[#E4DCD3] bg-[#E6DACE] px-4 text-xs font-black text-[#183B38] shadow-sm outline-none dark:border-white/10 dark:bg-[#10141b] dark:text-white"
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
