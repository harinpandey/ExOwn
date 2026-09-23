"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export const CAMPUSES = [
  { id: "lpu", name: "Lovely Professional University", shortName: "LPU Campus" },
  { id: "du", name: "Delhi University", shortName: "DU Campus" },
  { id: "cu", name: "Chandigarh University", shortName: "CU Campus" },
  { id: "vit", name: "VIT Vellore", shortName: "VIT Campus" },
];

interface LocationContextType {
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
  campusObj: typeof CAMPUSES[0];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedCampus, setSelectedCampusState] = useState<string>("Lovely Professional University");

  useEffect(() => {
    const saved = localStorage.getItem("exown_selected_campus");
    if (saved) {
      setSelectedCampusState(saved);
    }
  }, []);

  const setSelectedCampus = (campus: string) => {
    setSelectedCampusState(campus);
    localStorage.setItem("exown_selected_campus", campus);
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
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
};
