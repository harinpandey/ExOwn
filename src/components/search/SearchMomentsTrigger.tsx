"use client";

import { useEffect } from "react";
import { useMoments } from "@/context/MomentsContext";

interface Props {
  query?: string;
  category?: string;
  listingType?: string;
}

export default function SearchMomentsTrigger({ query, category, listingType }: Props) {
  const { triggerEvent } = useMoments();

  useEffect(() => {
    const timer = setTimeout(() => {
      // 1. Exam Season Trigger
      const q = (query || "").toLowerCase();
      if (
        category === "books-sports-hobbies" ||
        q.includes("calculator") ||
        q.includes("book") ||
        q.includes("notes") ||
        q.includes("formula")
      ) {
        triggerEvent("EXAM_SEASON", {
          customCtaHref: "/search?category=books-sports-hobbies",
        });
        return;
      }

      // 2. Search match or trending category
      if (category) {
        triggerEvent("TRENDING_CATEGORY", {
          categorySlug: category,
          customCtaHref: `/search?category=${category}`,
        });
        return;
      }

      // 3. General query match
      if (query && query.length > 2) {
        triggerEvent("SEARCH_MATCH", {
          itemTitle: query,
          customCtaHref: `/search?q=${encodeURIComponent(query)}`,
        });
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [query, category, listingType, triggerEvent]);

  return null;
}
