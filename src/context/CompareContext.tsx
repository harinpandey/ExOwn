"use client";

import React, { createContext, useContext, useState } from "react";
import { toast } from "react-hot-toast";

interface CompareItem {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  title: string;
}

interface CompareContextType {
  items: CompareItem[];
  toggleCompare: (item: CompareItem) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType>({
  items: [],
  toggleCompare: () => {},
  clearCompare: () => {},
  isInCompare: () => false,
});

export const CompareProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CompareItem[]>([]);

  const toggleCompare = (item: CompareItem) => {
    setItems(prev => {
      // If removing
      if (prev.some(i => i.id === item.id)) {
        return prev.filter(i => i.id !== item.id);
      }

      // If adding, check constraints
      if (prev.length > 0) {
        const firstItem = prev[0];
        
        // Strict Category & Subcategory Match
        if (firstItem.categoryId !== item.categoryId) {
          toast.error("Only similar products can be compared.");
          return prev;
        }

        if (firstItem.subcategoryId !== item.subcategoryId) {
          toast.error("Only products in the same subcategory can be compared.");
          return prev;
        }
      }

      if (prev.length >= 3) {
        toast.error("You can compare up to 3 products at a time.");
        return prev;
      }

      toast.success(`${item.title} added to compare.`);
      return [...prev, item];
    });
  };

  const clearCompare = () => setItems([]);
  const isInCompare = (id: string) => items.some(i => i.id === id);

  return (
    <CompareContext.Provider value={{ items, toggleCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
