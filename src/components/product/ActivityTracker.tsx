"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { trackActivity } from "@/actions/activity";
import { useMoments } from "@/context/MomentsContext";

interface Props {
  productId: string;
  title?: string;
  price?: number;
  image?: string;
}

export default function ActivityTracker({ productId, title, price, image }: Props) {
  const { user } = useAuth();
  const { trackProductView } = useMoments();

  useEffect(() => {
    if (user) {
      trackActivity(user.uid, "VIEWED", productId);
    }

    // Trigger ExOwn Moments repeated-view check
    if (productId && title && price != null) {
      trackProductView(productId, title, price, image);
    }
  }, [user, productId, title, price, image, trackProductView]);

  return null;
}
