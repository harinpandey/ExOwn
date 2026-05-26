"use client";

import { useEffect, useState, useCallback } from "react";
import CinematicLoader from "@/components/ui/CinematicLoader";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const hasVisited = sessionStorage.getItem("exown_welcome_loaded");
      if (!hasVisited) {
        setShowLoader(true);
      }
    } catch {
      // sessionStorage unavailable (SSR, incognito restrictions)
    }
  }, []);

  const handleComplete = useCallback(() => {
    try {
      sessionStorage.setItem("exown_welcome_loaded", "true");
    } catch {
      // sessionStorage unavailable
    }
    setShowLoader(false);
  }, []);

  if (!isMounted) {
    // During SSR / first paint — render children invisible to avoid layout shift
    return <div style={{ opacity: 0 }}>{children}</div>;
  }

  return (
    <>
      {showLoader && <CinematicLoader onComplete={handleComplete} />}
      <div
        className={
          showLoader
            ? "opacity-0 pointer-events-none overflow-hidden max-h-screen"
            : "animate-[pageFadeIn_500ms_ease-out_both]"
        }
      >
        {children}
      </div>
    </>
  );
}
