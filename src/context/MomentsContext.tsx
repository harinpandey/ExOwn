"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useNotifications } from "@/context/NotificationContext";
import { ActiveMoment, MomentCategory } from "@/lib/moments/types";
import {
  canShowMoment,
  recordMomentShown,
  recordMomentClicked,
  recordMomentDismissed,
} from "@/lib/moments/frequency";
import {
  buildActiveMoment,
  recordProductView,
  onWishlistAdded,
  onPriceDropDetected,
  checkTemporalMoment,
} from "@/lib/moments/engine";
import { recordMomentAnalytics, getActiveAdminMoments } from "@/actions/moments";
import ExOwnMomentCard from "@/components/moments/ExOwnMomentCard";

interface TriggerContextParams {
  itemTitle?: string;
  itemPrice?: number;
  itemOldPrice?: number;
  itemImage?: string;
  itemHref?: string;
  categorySlug?: string;
  viewsCount?: number;
  amountDiff?: number;
  isTransactional?: boolean;
  priority?: "low" | "normal" | "high" | "urgent";
  customCtaHref?: string;
}

interface MomentsContextType {
  currentMoment: ActiveMoment | null;
  showMoment: (moment: ActiveMoment) => void;
  dismissMoment: () => void;
  triggerEvent: (category: MomentCategory, params?: TriggerContextParams, force?: boolean) => void;
  trackProductView: (productId: string, title: string, price: number, image?: string) => void;
  trackWishlistAdd: (productId: string, title: string, image?: string) => void;
  trackPriceDrop: (productId: string, title: string, oldPrice: number, newPrice: number, image?: string) => void;
}

const MomentsContext = createContext<MomentsContextType | undefined>(undefined);

export function MomentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentCampus } = useLocation();
  const { refreshNotifications } = useNotifications();
  const [currentMoment, setCurrentMoment] = useState<ActiveMoment | null>(null);

  const dismissMoment = useCallback(() => {
    if (currentMoment) {
      recordMomentDismissed(currentMoment.templateId);
      recordMomentAnalytics({
        event: "dismiss",
        templateId: currentMoment.templateId,
        category: currentMoment.category,
        userId: user?.uid,
        timestamp: Date.now(),
      }).catch(() => {});
    }
    setCurrentMoment(null);
  }, [currentMoment, user]);

  const showMoment = useCallback(
    (moment: ActiveMoment) => {
      // Check frequency rules unless transactional
      if (!moment.isTransactional && !canShowMoment(moment.category, moment.priority, false)) {
        return;
      }

      recordMomentShown(moment.templateId, moment.isTransactional);
      setCurrentMoment(moment);

      // Track impression
      recordMomentAnalytics({
        event: "impression",
        templateId: moment.templateId,
        category: moment.category,
        userId: user?.uid,
        timestamp: Date.now(),
      }).catch(() => {});

      // If transactional or high priority, optionally sync with Notification Center
      if (moment.addToNotificationCenter || moment.isTransactional) {
        refreshNotifications().catch(() => {});
      }
    },
    [user, refreshNotifications]
  );

  const handleCtaClick = useCallback(() => {
    if (currentMoment) {
      recordMomentClicked(currentMoment.templateId);
      recordMomentAnalytics({
        event: "click",
        templateId: currentMoment.templateId,
        category: currentMoment.category,
        userId: user?.uid,
        timestamp: Date.now(),
      }).catch(() => {});
    }
  }, [currentMoment, user]);

  const triggerEvent = useCallback(
    (category: MomentCategory, params: TriggerContextParams = {}, force = false) => {
      const moment = buildActiveMoment(
        category,
        {
          ...params,
          campusName: currentCampus?.name,
          userId: user?.uid,
        },
        force
      );

      if (moment) {
        showMoment(moment);
      }
    },
    [currentCampus, user, showMoment]
  );

  const trackProductView = useCallback(
    (productId: string, title: string, price: number, image?: string) => {
      const moment = recordProductView(productId, title, price, image, currentCampus?.name);
      if (moment) {
        showMoment(moment);
      }
    },
    [currentCampus, showMoment]
  );

  const trackWishlistAdd = useCallback(
    (productId: string, title: string, image?: string) => {
      const moment = onWishlistAdded(productId, title, image);
      if (moment) {
        showMoment(moment);
      }
    },
    [showMoment]
  );

  const trackPriceDrop = useCallback(
    (productId: string, title: string, oldPrice: number, newPrice: number, image?: string) => {
      const moment = onPriceDropDetected(productId, title, oldPrice, newPrice, image);
      if (moment) {
        showMoment(moment);
      }
    },
    [showMoment]
  );

  // Background check for Temporal (Weekend) or Admin Custom moments
  useEffect(() => {
    const timer = setTimeout(async () => {
      // 1. Check custom admin moments
      try {
        const adminMoments = await getActiveAdminMoments();
        if (adminMoments && adminMoments.length > 0) {
          const valid = adminMoments.find((m) => {
            if (m.targetCampus && m.targetCampus !== currentCampus?.name) return false;
            return canShowMoment(m.category, m.priority, false);
          });

          if (valid) {
            showMoment({
              instanceId: `admin_${valid.id}_${Date.now()}`,
              templateId: valid.id,
              category: valid.category,
              title: valid.title,
              message: valid.message,
              cta: valid.cta,
              ctaHref: valid.ctaHref,
              icon: valid.icon || "Sparkles",
              image: valid.image,
              priority: valid.priority,
              timestamp: Date.now(),
              duration: 8000,
            });
            return;
          }
        }
      } catch {
        // ignore
      }

      // 2. Check temporal weekend trigger
      const temporal = checkTemporalMoment(currentCampus?.name);
      if (temporal) {
        showMoment(temporal);
      }
    }, 4500); // polite delay after page load

    return () => clearTimeout(timer);
  }, [currentCampus, showMoment]);

  return (
    <MomentsContext.Provider
      value={{
        currentMoment,
        showMoment,
        dismissMoment,
        triggerEvent,
        trackProductView,
        trackWishlistAdd,
        trackPriceDrop,
      }}
    >
      {children}

      {/* In-App Floating Moment Display */}
      <AnimatePresence>
        {currentMoment && (
          <ExOwnMomentCard
            key={currentMoment.instanceId}
            moment={currentMoment}
            onClose={dismissMoment}
            onCtaClick={handleCtaClick}
          />
        )}
      </AnimatePresence>
    </MomentsContext.Provider>
  );
}

export const useMoments = () => {
  const context = useContext(MomentsContext);
  if (!context) {
    throw new Error("useMoments must be used within a MomentsProvider");
  }
  return context;
};
