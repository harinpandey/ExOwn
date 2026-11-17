"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CAMPUS_DIRECTORY } from "@/config/campuses";

export const CAMPUSES = CAMPUS_DIRECTORY;

interface LocationContextType {
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
  campusObj: (typeof CAMPUSES)[number];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

function persistCampusCookie(campus: string) {
  document.cookie = `exown_selected_campus=${encodeURIComponent(campus)}; path=/; max-age=31536000; samesite=lax`;
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedCampus, setSelectedCampusState] = useState<string>("Lovely Professional University");

  useEffect(() => {
    const saved = localStorage.getItem("exown_selected_campus");
    if (saved) {
      setSelectedCampusState(saved);
      persistCampusCookie(saved);
    } else {
      persistCampusCookie("Lovely Professional University");
    }
  }, []);

  const setSelectedCampus = (campus: string) => {
    setSelectedCampusState(campus);
    localStorage.setItem("exown_selected_campus", campus);
    persistCampusCookie(campus);
  };

  const campusObj = CAMPUSES.find(c => c.name === selectedCampus || c.shortName === selectedCampus) || CAMPUSES[0];

  return (
    <LocationContext.Provider value={{ selectedCampus, setSelectedCampus, campusObj }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within LocationProvider");
  return context;
};
