"use client";

import { useEffect, useState } from "react";
import { Zap, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { calculateListingHealth } from "@/actions/listing-health";

interface ListingHealthScoreProps {
  product: any;
}

export default function ListingHealthScore({ product }: ListingHealthScoreProps) {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    async function getHealth() {
      const h = await calculateListingHealth(product);
      setHealth(h);
    }
    getHealth();
  }, [product]);

  if (!health) return null;

  const getScoreColor = () => {
    if (health.score > 80) return "text-emerald-500 bg-emerald-500/10";
    if (health.score > 50) return "text-yellow-500 bg-yellow-500/10";
    return "text-red-500 bg-red-500/10";
  };

  const getProgressColor = () => {
    if (health.score > 80) return "bg-emerald-500";
    if (health.score > 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-100 dark:border-gray-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${getScoreColor()}`}>
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-xl font-black">Listing <span className="text-primary">Health</span></h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Power up your listing for 5x more sales</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black">{health.score}%</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${getScoreColor().split(' ')[0]}`}>{health.status}</p>
        </div>
      </div>

      <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-8">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${getProgressColor()}`}
          style={{ width: `${health.score}%` }}
        />
      </div>

      {health.suggestions.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Improvement Tips</p>
          {health.suggestions.map((tip: string, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl group hover:bg-primary/5 transition-all">
              <div className="mt-0.5 text-yellow-500">
                <AlertTriangle size={14} />
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 flex-1">{tip}</p>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      )}

      {health.score > 80 && health.suggestions.length === 0 && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Perfect! Your listing is optimized for conversion.</p>
        </div>
      )}
    </div>
  );
}
