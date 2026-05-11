"use client";

import { useCompare } from "@/context/CompareContext";
import { getProductsByIds } from "@/actions/product";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, ShieldCheck, Tag, ShoppingCart, X, Ghost, Sparkles, Brain, AlertTriangle, Trophy, BadgeIndianRupee, RefreshCw } from "lucide-react";
import Link from "next/link";


export default function ComparePage() {
  const { items, toggleCompare, clearCompare } = useCompare();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const router = useRouter();


  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const ids = items.map(i => i.id);
        const data = await getProductsByIds(ids);
        const sorted = ids.map(id => data.find(p => p.id === id)).filter(Boolean);
        setProducts(sorted);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [items, router]);

  const handleRemove = (product: any) => {
    toggleCompare({
      id: product.id,
      title: product.title,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId
    });
    setAiAnalysis(null); // Reset analysis if items change
  };

  const runAiAnalysis = async () => {
    if (products.length < 2) return;
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: products.map(p => p.id) })
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setAiLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center container mx-auto px-4">
        <div className="w-32 h-32 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-8">
          <Ghost size={64} className="text-gray-300 dark:text-gray-700" />
        </div>
        <h1 className="text-4xl font-black mb-4 text-center">Nothing to compare yet</h1>
        <p className="text-gray-500 text-center mb-10 max-w-md">
          Add items to your comparison list while browsing to see their features side-by-side.
        </p>
        <Link 
          href="/search"
          className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          Start Browsing
        </Link>
      </div>
    );
  }

  const rows = [
    { label: "Price", key: "price", format: (val: number) => `₹${val.toLocaleString()}` },
    { label: "Original Price", key: "originalPrice", format: (val: number | null) => val ? `₹${val.toLocaleString()}` : "N/A" },
    { label: "Condition", key: "condition" },
    { label: "Type", key: "listingType" },
    { label: "Brand", key: "brand", format: (val: string | null) => val || "Generic" },
    { label: "Age / Year", key: "purchaseYear", format: (val: number | null) => val ? `${new Date().getFullYear() - val} years old (${val})` : "N/A" },
    { label: "Seller Rating", key: "seller", format: (val: any) => `${val?.profile?.rating || 0}/5.0` },
    { label: "Location", key: "pickupLocation" },
    { label: "Negotiable", key: "isNegotiable", format: (val: boolean) => val ? "Yes" : "Fixed" },
    { label: "Views", key: "views" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-2 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Search
          </button>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50">Compare Products</h1>
        </div>
        <button 
          onClick={clearCompare}
          className="px-6 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center gap-2 text-sm"
        >
          <Trash2 size={18} /> Clear All
        </button>
      </div>

      {/* AI Smart Assistant Section */}
      <div className="mb-12">
        <div className="bg-gradient-to-br from-primary/10 via-white to-primary/5 dark:from-primary/20 dark:via-gray-900 dark:to-gray-800 rounded-[3rem] p-1 border-4 border-primary/20 shadow-2xl relative overflow-hidden">
          {/* Animated Background Sparkle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
          
          <div className="relative p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20 animate-bounce-slow">
                <Brain size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">ExOwn <span className="text-primary">Smart Compare</span></h2>
                <p className="text-gray-500 font-bold max-w-md leading-tight">Our AI analyzes value, risk, and student-friendliness across your selections.</p>
              </div>
            </div>
            
            <button 
              onClick={runAiAnalysis}
              disabled={aiLoading || products.length < 2}
              className="px-12 py-6 bg-primary text-white rounded-[2.5rem] font-black text-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:scale-100"
            >
              {aiLoading ? (
                <>Analyzing... <RefreshCw size={28} className="animate-spin" /></>
              ) : (
                <>Analyze With AI <Sparkles size={28} /></>
              )}
            </button>
          </div>

          <AnimatePresence>
            {aiAnalysis && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 border-t-4 border-primary/10 bg-white/50 dark:bg-gray-800/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Winner Card */}
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border-4 border-primary/20 shadow-xl relative group">
                    <div className="absolute -top-4 -right-4 p-3 bg-primary text-white rounded-2xl shadow-lg">
                      <Trophy size={20} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Best Overall</h4>
                    <p className="font-black text-lg leading-tight mb-3 italic">{products.find(p => p.id === aiAnalysis.winner_id)?.title || "The Winner"}</p>
                    <p className="text-xs text-gray-500 font-bold leading-relaxed">{aiAnalysis.winner_reason}</p>
                  </div>

                  {/* Budget Pick */}
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border-4 border-emerald-500/20 shadow-xl relative">
                    <div className="absolute -top-4 -right-4 p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
                      <BadgeIndianRupee size={20} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4">Value King</h4>
                    <p className="font-black text-lg leading-tight mb-3 italic">{products.find(p => p.id === aiAnalysis.budget_pick_id)?.title || "Budget Choice"}</p>
                    <p className="text-xs text-gray-500 font-bold leading-relaxed">{aiAnalysis.budget_reason}</p>
                  </div>

                  {/* Risk Alerts */}
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border-4 border-amber-500/20 shadow-xl relative lg:col-span-1">
                    <div className="absolute -top-4 -right-4 p-3 bg-amber-500 text-white rounded-2xl shadow-lg">
                      <AlertTriangle size={20} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4">Risk Awareness</h4>
                    <ul className="space-y-2">
                      {aiAnalysis.risk_alerts?.map((risk: string, i: number) => (
                        <li key={i} className="text-[10px] font-bold text-gray-600 dark:text-gray-400 flex gap-2">
                          <span className="text-amber-500">•</span> {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl relative flex flex-col justify-center">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 italic">The Bottom Line</h4>
                    <p className="text-xs font-bold leading-relaxed italic opacity-80">{aiAnalysis.summary}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="p-6 bg-gray-50/50 dark:bg-gray-800/30 w-48 sticky left-0 z-10 backdrop-blur-md">
                  <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Specifications</span>
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-6 min-w-[280px]">
                    <div className="relative group">
                      <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                        <img 
                          src={product.images[0]} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <button 
                        onClick={() => handleRemove(product)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-800/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X size={16} />
                      </button>
                      <h3 className="font-bold text-lg mb-1 line-clamp-2 leading-tight text-gray-900 dark:text-gray-100">{product.title}</h3>
                      <p className="text-primary font-black text-xl mb-4">₹{product.price.toLocaleString()}</p>
                      <Link 
                        href={`/product/${product.id}`}
                        className="w-full py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all"
                      >
                        View Details
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="p-6 bg-gray-50/50 dark:bg-gray-800/30 font-bold text-sm text-gray-600 dark:text-gray-400 sticky left-0 z-10 backdrop-blur-md">
                    {row.label}
                  </td>
                  {products.map((product) => {
                    const value = row.key.split('.').reduce((o, i) => o?.[i], product);
                    return (
                      <td key={product.id} className="p-6 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {row.format ? row.format(value) : value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-50">Smart Tip</h2>
          <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex gap-4">
            <div className="p-3 bg-primary/10 text-primary h-max rounded-2xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="font-bold mb-1">Look for Verified Badges</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Products from verified students go through a basic accountability check. Always prioritize sellers with higher ratings for a safer transaction.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-3xl p-6 text-white flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">Ready to Buy?</h3>
            <p className="text-gray-400 text-sm mb-6">Compare similar items to find the best value for your money.</p>
          </div>
          <Link 
            href="/search"
            className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
          >
            Find More Items
            <ShoppingCart size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
