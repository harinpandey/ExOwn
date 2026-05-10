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
  TrendingUp,
  Shield,
  Clock,
  CircleDollarSign
} from "lucide-react";

interface AiResult {
  score: number;
  recommendation: string;
  analysis: string;
  pros: string[];
  cons: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export default function SmartBuyAssistant({ product }: { product: any }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [expanded, setExpanded] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Compute automatic fields
      const listingAgeDays = Math.floor(
        (Date.now() - new Date(product.createdAt).getTime()) / 86400000
      );
      const descriptionQuality = product.description.length > 100 ? "detailed" : "vague";
      const photoCount = product.images?.length || 0;

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productData: {
            title: product.title,
            category: product.category?.name,
            price: product.price,
            originalPrice: product.originalPrice,
            condition: product.condition,
            conditionDetails: product.conditionDetails,
            listingType: product.listingType,
            brand: product.brand,
            purchaseYear: product.purchaseYear,
            isNegotiable: product.isNegotiable,
            sellerRating: product.seller.profile?.rating,
            successfulDeals: product.seller.profile?.successfulDeals,
            listingViews: product.views,
            listingAgeDays,
            descriptionQuality,
            photoCount,
            isVerified: product.seller.isVerified,
            description: product.description.slice(0, 500)
          }
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW": return "text-emerald-500 bg-emerald-500/10";
      case "MEDIUM": return "text-amber-500 bg-amber-500/10";
      case "HIGH": return "text-red-500 bg-red-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Sparkles size={24} className={loading ? "animate-pulse" : ""} />
            </div>
            <div>
              <h3 className="font-bold text-lg">ExOwn AI</h3>
              <p className="text-xs text-gray-500">Smart Buy Assistant</p>
            </div>
          </div>
          {!result && (
            <button
              onClick={analyze}
              disabled={loading}
              className="px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold text-sm hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Should I Buy?"}
            </button>
          )}
        </div>

        {loading && (
          <div className="py-8 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-gray-500">AI is scanning condition and market trends...</p>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="space-y-6"
            >
              {/* Recommendation Header */}
              <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-primary">Recommendation</span>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${getRiskColor(result.riskLevel)}`}>
                      {result.riskLevel} RISK
                    </div>
                  </div>
                  <h4 className="text-3xl font-black mb-2">{result.recommendation}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {result.analysis}
                  </p>
                </div>
                {/* Decorative score background */}
                <div className="absolute -right-4 -bottom-4 text-primary/10 font-black text-8xl italic">
                  {result.score}
                </div>
              </div>

              {/* Meters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500">Buy Meter</span>
                    <span className="text-xs font-black text-primary">{result.score}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500">Trust Factor</span>
                    <span className="text-xs font-black text-emerald-500">{result.riskLevel === 'LOW' ? 'High' : result.riskLevel === 'MEDIUM' ? 'Avg' : 'Low'}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: result.riskLevel === 'LOW' ? '90%' : result.riskLevel === 'MEDIUM' ? '60%' : '30%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full ${result.riskLevel === 'LOW' ? 'bg-emerald-500' : result.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-red-500'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Details Toggle */}
              <button 
                onClick={() => setExpanded(!expanded)}
                className="w-full py-2 flex items-center justify-center gap-1 text-xs font-bold text-gray-500 hover:text-primary transition-colors"
              >
                {expanded ? "Show Less" : "Show Why"}
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 overflow-hidden"
                  >
                    <div className="space-y-3">
                      <h5 className="text-xs font-black uppercase text-emerald-600 flex items-center gap-2">
                        <CheckCircle2 size={14} /> Pros
                      </h5>
                      <ul className="space-y-2">
                        {result.pros?.map((pro, i) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                            <span className="text-emerald-500">•</span> {pro}
                          </li>
                        )) || <li className="text-xs text-gray-400 italic">No specific pros found</li>}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-xs font-black uppercase text-red-600 flex items-center gap-2">
                        <AlertCircle size={14} /> Cons
                      </h5>
                      <ul className="space-y-2">
                        {result.cons?.map((con, i) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                            <span className="text-red-500">•</span> {con}
                          </li>
                        )) || <li className="text-xs text-gray-400 italic">No specific cons found</li>}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                  <HelpCircle size={12} /> AI analysis is experimental. Always inspect products in person.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
