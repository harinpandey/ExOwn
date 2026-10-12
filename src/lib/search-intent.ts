/**
 * Deterministic natural-language search intent parser for ExOwn.
 * Runs 100% server-side without external LLM/AI dependencies.
 */

export interface ParsedSearchIntent {
  /** Cleaned search term with extracted filter tokens and stop-words stripped */
  textQuery: string;
  /** Meaningful keyword tokens without stop-words */
  tokens: string[];
  minPrice?: number;
  maxPrice?: number;
  listingType?: "SELL" | "RENT" | "SERVICE";
  exchange?: boolean;
  condition?: "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  /** Human-readable explanation of inferred filters for UI */
  inferredFilters: {
    label: string;
    field: "price" | "listingType" | "exchange" | "condition";
  }[];
}

const STOP_WORDS = new Set([
  "a", "an", "the", "for", "with", "and", "or", "in", "on", "at", "to",
  "from", "by", "of", "please", "want", "need", "looking", "search",
  "find", "me", "i", "is", "are"
]);

/**
 * Parses numeric price string including Indian formats:
 * 50000, 50,000, 50k, 50K, 1.5 lakh, 1.5l, 1.5L
 */
export function parsePriceValue(str: string): number | null {
  if (!str) return null;
  const clean = str.replace(/[₹,\s]/g, "").trim().toLowerCase();

  // Match lakh: e.g. "1.5lakh", "1.5l", "2lakhs"
  const lakhMatch = clean.match(/^(\d+(?:\.\d+)?)(?:lakhs?|l)$/);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    if (!isNaN(val)) return Math.round(val * 100000);
  }

  // Match thousand: e.g. "50k"
  const kMatch = clean.match(/^(\d+(?:\.\d+)?)(?:k)$/);
  if (kMatch) {
    const val = parseFloat(kMatch[1]);
    if (!isNaN(val)) return Math.round(val * 1000);
  }

  // Match pure digits / decimal
  const numMatch = clean.match(/^(\d+(?:\.\d+)?)$/);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    if (!isNaN(val)) return Math.round(val);
  }

  return null;
}

const PRICE_NUM_REGEX = `(?:₹?\\s*\\d+(?:,\\d+)*(?:\\.\\d+)?(?:\\s*(?:k|lakhs?|l))?)`;

export function parseSearchIntent(rawQuery: string): ParsedSearchIntent {
  if (!rawQuery || typeof rawQuery !== "string") {
    return { textQuery: "", tokens: [], inferredFilters: [] };
  }

  let working = rawQuery.trim();
  let minPrice: number | undefined = undefined;
  let maxPrice: number | undefined = undefined;
  let listingType: "SELL" | "RENT" | "SERVICE" | undefined = undefined;
  let exchange: boolean | undefined = undefined;
  let condition: "LIKE_NEW" | "GOOD" | "FAIR" | "POOR" | undefined = undefined;
  const inferredFilters: ParsedSearchIntent["inferredFilters"] = [];

  // 1. PRICE RANGES: "between 40000 and 70000", "40000 to 70000", "40k-70k", "40k to 70k"
  const rangePattern = new RegExp(
    `\\b(?:between\\s+)?(${PRICE_NUM_REGEX})\\s*(?:to|and|-|–|—)\\s*(${PRICE_NUM_REGEX})\\b`,
    "i"
  );
  const rangeMatch = working.match(rangePattern);
  if (rangeMatch) {
    const p1 = parsePriceValue(rangeMatch[1]);
    const p2 = parsePriceValue(rangeMatch[2]);
    if (p1 !== null && p2 !== null) {
      minPrice = Math.min(p1, p2);
      maxPrice = Math.max(p1, p2);
      working = working.replace(rangeMatch[0], " ");
      inferredFilters.push({
        label: `₹${minPrice.toLocaleString("en-IN")} – ₹${maxPrice.toLocaleString("en-IN")}`,
        field: "price"
      });
    }
  }

  // 2. UPPER BOUND PRICE: "under", "below", "less than", "upto", "up to", "max"
  if (maxPrice === undefined) {
    const maxPattern = new RegExp(
      `\\b(?:under|below|less\\s+than|upto|up\\s+to|max(?:imum)?)\\s+(${PRICE_NUM_REGEX})\\b`,
      "i"
    );
    const maxMatch = working.match(maxPattern);
    if (maxMatch) {
      const p = parsePriceValue(maxMatch[1]);
      if (p !== null) {
        maxPrice = p;
        working = working.replace(maxMatch[0], " ");
        inferredFilters.push({
          label: `Under ₹${maxPrice.toLocaleString("en-IN")}`,
          field: "price"
        });
      }
    }
  }

  // 3. LOWER BOUND PRICE: "above", "over", "more than", "minimum", "min", "from"
  if (minPrice === undefined) {
    const minPattern = new RegExp(
      `\\b(?:above|over|more\\s+than|min(?:imum)?|from)\\s+(${PRICE_NUM_REGEX})\\b`,
      "i"
    );
    const minMatch = working.match(minPattern);
    if (minMatch) {
      const p = parsePriceValue(minMatch[1]);
      if (p !== null) {
        minPrice = p;
        working = working.replace(minMatch[0], " ");
        inferredFilters.push({
          label: `Above ₹${minPrice.toLocaleString("en-IN")}`,
          field: "price"
        });
      }
    }
  }

  // 4. LISTING TYPE INTENT
  // A. Rent: "laptop for rent", "rent", "rental"
  const rentPattern = /\b(?:for\s+rent|rental|rent)\b/i;
  if (rentPattern.test(working)) {
    listingType = "RENT";
    working = working.replace(rentPattern, " ");
    inferredFilters.push({ label: "For Rent", field: "listingType" });
  }

  // B. Services: "service", "services", "hire", "tutor", "repair", "photography", "freelance"
  if (!listingType) {
    const servicePattern = /\b(?:services?|hire|tutor(?:ing)?|repairs?|photography|freelance)\b/i;
    if (servicePattern.test(working)) {
      listingType = "SERVICE";
      // Remove generic service tokens from keyword query
      working = working.replace(/\b(?:services?|hire)\b/gi, " ");
      inferredFilters.push({ label: "Services", field: "listingType" });
    }
  }

  // C. Sell: "for sale", "buy", "buying", "sell", "selling"
  if (!listingType) {
    const sellPattern = /\b(?:for\s+sale|buying|buy|selling|sell)\b/i;
    if (sellPattern.test(working)) {
      listingType = "SELL";
      working = working.replace(sellPattern, " ");
      inferredFilters.push({ label: "For Sale", field: "listingType" });
    }
  }

  // 5. EXCHANGE INTENT: "exchange", "swap", "trade", "barter"
  const exchangePattern = /\b(?:exchange|swap|trade|barter)\b/i;
  if (exchangePattern.test(working)) {
    exchange = true;
    working = working.replace(exchangePattern, " ");
    inferredFilters.push({ label: "Exchange Only", field: "exchange" });
  }

  // 6. CONDITION INTENT
  // A. Like New: "like new", "almost new", "mint"
  const likeNewPattern = /\b(?:like\s+new|almost\s+new|mint(?:\s+condition)?)\b/i;
  if (likeNewPattern.test(working)) {
    condition = "LIKE_NEW";
    working = working.replace(likeNewPattern, " ");
    inferredFilters.push({ label: "Condition: Like New", field: "condition" });
  } else {
    // B. Poor: "poor condition", "damaged", "needs repair"
    const poorPattern = /\b(?:poor(?:\s+condition)?|damaged|needs\s+repair)\b/i;
    if (poorPattern.test(working)) {
      condition = "POOR";
      working = working.replace(poorPattern, " ");
      inferredFilters.push({ label: "Condition: Poor", field: "condition" });
    } else {
      // C. Fair: "fair condition", "fair"
      const fairPattern = /\b(?:fair(?:\s+condition)?)\b/i;
      if (fairPattern.test(working)) {
        condition = "FAIR";
        working = working.replace(fairPattern, " ");
        inferredFilters.push({ label: "Condition: Fair", field: "condition" });
      } else {
        // D. Good: "good condition", "good"
        const goodPattern = /\b(?:good(?:\s+condition)?)\b/i;
        if (goodPattern.test(working)) {
          condition = "GOOD";
          working = working.replace(goodPattern, " ");
          inferredFilters.push({ label: "Condition: Good", field: "condition" });
        }
      }
    }
  }

  // 7. CLEAN & TOKENIZE TEXT QUERY
  // Normalize whitespaces and non-word characters except alphanumeric and dashes
  const cleaned = working
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Extract non-stopword tokens while preserving numbers (e.g. "14", "13")
  const rawWords = cleaned.toLowerCase().split(/\s+/).filter(Boolean);
  const meaningfulTokens = rawWords.filter(
    (w) => !STOP_WORDS.has(w) && (w.length >= 2 || /^\d+$/.test(w))
  );

  // Filter stop words from textQuery as well to clean up natural language connector words (e.g. "for engineering" -> "engineering")
  // while preserving numeric strings and meaningful product names
  const filteredWords = cleaned.split(/\s+/).filter((w) => {
    const low = w.toLowerCase();
    return !STOP_WORDS.has(low);
  });

  const textQuery = (filteredWords.length > 0 ? filteredWords.join(" ") : cleaned).trim();

  return {
    textQuery,
    tokens: meaningfulTokens,
    minPrice,
    maxPrice,
    listingType,
    exchange,
    condition,
    inferredFilters
  };
}
