"use client";

import { useEffect, useState } from "react";
import CinematicLoader from "@/components/ui/CinematicLoader";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasVisited = sessionStorage.getItem("exown_welcome_loaded");
    if (!hasVisited) {
      setShowLoader(true);
    }
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("exown_welcome_loaded", "true");
    setShowLoader(false);
  };

  if (!isMounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <>
      {showLoader && <CinematicLoader onComplete={handleComplete} />}
      <div 
        className={
          showLoader 
            ? "opacity-0 h-screen overflow-hidden" 
            : "opacity-100 transition-opacity duration-500 ease-out"
        }
      >
        {children}
      </div>
    </>
  );
}
