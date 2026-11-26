"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MapPin, Search, X, Check } from "lucide-react";
import { CAMPUS_DIRECTORY } from "@/config/campuses";

type CampusSelectorProps = {
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
  campusName: string;
};

export default function CampusSelector({ selectedCampus, setSelectedCampus, campusName }: CampusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredCampuses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return CAMPUS_DIRECTORY;
    return CAMPUS_DIRECTORY.filter((campus) =>
      [campus.name, campus.shortName, campus.city, campus.state]
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const chooseCampus = (campus: string) => {
    setSelectedCampus(campus);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Choose campus. Current campus: ${campusName}`}
        className="relative ml-auto flex min-w-0 max-w-[34%] shrink-0 items-center gap-1.5 rounded-xl border border-[#1E5646] bg-[#1E5646] px-2.5 py-2 text-left text-white transition hover:bg-[#174536] sm:max-w-[25%] sm:gap-2.5 sm:px-3"
      >
        <MapPin size={19} className="shrink-0 text-white" aria-hidden="true" />
        <span className="min-w-0">
          <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-white/75">Your campus</span>
          <span className="block max-w-[180px] truncate text-xs font-extrabold text-white sm:max-w-[260px] sm:text-sm">
            {campusName}
          </span>
        </span>
        <ChevronDown size={14} className="shrink-0 text-white/80" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsOpen(false);
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="campus-selector-title"
              initial={{ y: 36, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 36, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-xl rounded-t-[28px] border border-[#E2E8E5] bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-[#13221D] shadow-2xl sm:rounded-[28px] sm:p-6"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#D5DDD9] sm:hidden" />
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 id="campus-selector-title" className="text-xl font-extrabold sm:text-2xl">Choose your campus</h2>
                  <p className="mt-1 text-sm text-[#4A5D56]">Find listings and student updates around your campus.</p>
                </div>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close campus selector" className="rounded-full p-2 text-[#4A5D56] hover:bg-[#F0F4F2]">
                  <X size={20} />
                </button>
              </div>

              <label className="relative mb-4 block">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718079]" />
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search campus, city or state"
                  aria-label="Search campuses"
                  className="h-12 w-full rounded-xl border border-[#E2E8E5] bg-[#F7F9F8] pl-10 pr-3 text-sm outline-none focus:border-[#1E5646] focus:ring-2 focus:ring-[#1E5646]/10"
                />
              </label>

              <div className="max-h-[48vh] space-y-2 overflow-y-auto sm:max-h-[360px]">
                {filteredCampuses.map((campus) => {
                  const isSelected = selectedCampus === campus.name || selectedCampus === campus.shortName;
                  return (
                    <button
                      key={campus.id}
                      type="button"
                      onClick={() => chooseCampus(campus.name)}
                      aria-pressed={isSelected}
                      className={`flex min-h-[68px] w-full items-center gap-3 rounded-xl border p-3 text-left transition ${isSelected ? "border-[#1E5646] bg-[#EAF2EF]" : "border-[#E2E8E5] bg-white hover:bg-[#F7F9F8]"}`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSelected ? "bg-[#D5E8E0] text-[#1E5646]" : "bg-[#F0F4F2] text-[#4A5D56]"}`}>
                        <MapPin size={19} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{campus.name}</span>
                        <span className="mt-0.5 block text-xs text-[#64736C]">{campus.city}, {campus.state}</span>
                      </span>
                      {isSelected && <Check size={20} className="shrink-0 text-[#1E5646]" aria-label="Selected" />}
                    </button>
                  );
                })}
                {filteredCampuses.length === 0 && (
                  <p className="rounded-xl bg-[#F7F9F8] px-4 py-6 text-center text-sm text-[#4A5D56]">No campus found. Try another campus or city name.</p>
                )}
              </div>

              <p className="mt-4 text-xs text-[#718079]">You can change your campus anytime from this button.</p>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
