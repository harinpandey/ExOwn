"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import type { SmartBuyAnalysis, RecommendationType, RiskLevelType } from "@/types/smart-buy";

export default function SmartBuyAssistant({ product }: { product: any }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartBuyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const listingAgeDays = Math.floor(
        (Date.now() - new Date(product.createdAt).getTime()) / 86400000
      );
      const descriptionQuality = product.description?.length > 100 ? "detailed" : "vague";
      const photoCount = product.images?.length || 0;

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productData: {
            title: product.title,
            category: product.category?.name,
            price: product.price,
            originalPrice: product.originalPrice || null,
            condition: product.condition,
            conditionDetails: product.conditionDetails,
            listingType: product.listingType,
            brand: product.brand || null,
            purchaseYear: product.purchaseYear || null,
            isNegotiable: product.isNegotiable,
            sellerRating: product.seller?.profile?.rating || null,
            successfulDeals: product.seller?.profile?.successfulDeals || null,
            listingViews: product.views || 0,
            listingAgeDays,
            descriptionQuality,
            photoCount,
            isVerified: product.seller?.isVerified || false,
            description: (product.description || "").slice(0, 500),
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to analyze product at this moment.");
      }

      const data: SmartBuyAnalysis = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error("Smart Buy Assistant analysis error:", err);
      setError(err.message || "Failed to analyze product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationBadge = (rec: RecommendationType) => {
    switch (rec) {
      case "Strong Buy":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "Fair Deal":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "Caution":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Avoid":
        return "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const getRiskBadge = (risk: RiskLevelType) => {
    switch (risk) {
      case "LOW":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800";
      case "MEDIUM":
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
      case "HIGH":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Sparkles size={18} className={loading ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
              Listing Intelligence
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Automated listing assessment
            </p>
          </div>
        </div>

        {!result && !loading && (
          <button
            onClick={analyze}
            className="px-3.5 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary dark:hover:bg-primary dark:hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span>Analyze Listing</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-6 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">
            Evaluating price, condition, and seller signals...
          </p>
        </div>
      )}

      {/* Error / Retry State */}
      {error && !loading && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
          <button
            onClick={analyze}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <RefreshCw size={12} /> Retry evaluation
          </button>
        </div>
      )}

      {/* Results View */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-1"
          >
            {/* Recommendation & Risk Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Deal Assessment
                </span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${getRecommendationBadge(
                    result.recommendation
                  )}`}
                >
                  {result.recommendation}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Risk Level
                </span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${getRiskBadge(
                    result.riskLevel
                  )}`}
                >
                  {result.riskLevel}
                </span>
              </div>
            </div>

            {/* Score & Confidence Overview */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Evaluation Score
                </span>
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  {result.score !== null ? `${result.score} / 100` : "Not enough data"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Confidence
                </span>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {result.confidence}
                </span>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {result.analysis}
              </p>
            </div>

            {/* Expandable Details: Pros, Cons, and Evidence */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full py-1.5 flex items-center justify-center gap-1 text-xs font-bold text-gray-500 hover:text-primary transition"
              >
                <span>{expanded ? "Hide signal details" : "View signal details"}</span>
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 pt-2 text-xs overflow-hidden"
                  >
                    {/* Pros & Cons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-1.5">
                        <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 size={13} />
                          <span>Positive Signals</span>
                        </div>
                        {result.pros.length > 0 ? (
                          <ul className="space-y-1 text-gray-600 dark:text-gray-300 pl-4 list-disc text-[11px]">
                            {result.pros.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-gray-400 italic">
                            No strong positive signals available from the supplied listing data.
                          </p>
                        )}
                      </div>

                      <div className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30 space-y-1.5">
                        <div className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400">
                          <ShieldAlert size={13} />
                          <span>Points of Caution</span>
                        </div>
                        {result.cons.length > 0 ? (
                          <ul className="space-y-1 text-gray-600 dark:text-gray-300 pl-4 list-disc text-[11px]">
                            {result.cons.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-gray-400 italic">
                            No major cautions detected from the supplied listing data.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Evidence summary if present */}
                    {result.evidence && result.evidence.length > 0 && (
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1 text-[11px]">
                        <span className="font-bold text-gray-500 uppercase tracking-wider block text-[10px]">
                          Evaluated Signals
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.evidence.map((ev, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-[10px]"
                            >
                              {ev}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Secondary Disclaimer */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                <HelpCircle size={11} className="shrink-0" />
                <span>AI analysis is experimental. Always inspect products in person.</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
