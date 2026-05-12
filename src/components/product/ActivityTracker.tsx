"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { trackActivity } from "@/actions/activity";

export default function ActivityTracker({ productId }: { productId: string }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      trackActivity(user.uid, "VIEWED", productId);
    }
  }, [user, productId]);

  return null;
}
