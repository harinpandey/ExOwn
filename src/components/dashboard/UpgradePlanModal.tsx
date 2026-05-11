"use client";

import { useState } from "react";
import { Check, Zap, Crown, ShieldCheck, X } from "lucide-react";
import { createSubscriptionOrder, verifySubscriptionPayment } from "@/actions/subscription";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const PLANS = [
  {
    type: "PRO_SELLER",
    name: "Pro Seller",
    price: 499,
    features: ["Unlimited Listings", "Verified Badge", "Priority Search Ranking", "AI Product Descriptions"],
    icon: Zap,
    color: "blue",
  },
  {
    type: "CAMPUS_BUSINESS",
    name: "Campus Business",
    price: 1999,
    features: ["Everything in Pro", "Custom Storefront", "Bulk Listing Import", "Advanced Sales Analytics", "Featured Ad Slots"],
    icon: Crown,
    color: "purple",
  }
];

export default function UpgradePlanModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (planType: any) => {
    if (!user) return toast.error("Please login first");
    
    setLoading(planType);
    try {
      const res = await createSubscriptionOrder(user.uid, planType);
      if (!res.success || !res.order) throw new Error(res.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: res.order.amount,
        currency: "INR",
        name: "ExOwn Marketplace",
        description: `Upgrade to ${planType}`,
        order_id: res.order.id,
        handler: async (response: any) => {
          const verifyRes = await verifySubscriptionPayment(user.uid, response);
          if (verifyRes.success) {
            toast.success("Welcome to the elite! Plan upgraded.");
            await refreshProfile();
            onClose();
          } else {
            toast.error("Verification failed. Contact support.");
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Payment failed to initialize");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left: Info */}
          <div className="md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-8 md:p-12 border-r border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-8">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-black mb-4 leading-tight">Scale Your Campus Reach</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
              Unlock premium tools designed for high-volume sellers and student entrepreneurs.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-bold text-emerald-600">
                <Check size={18} /> Instant Verification
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-emerald-600">
                <Check size={18} /> 24/7 Priority Support
              </div>
            </div>
          </div>

          {/* Right: Plans */}
          <div className="md:w-2/3 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const isLoading = loading === plan.type;

                return (
                  <div 
                    key={plan.type}
                    className="border-2 border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col hover:border-primary/50 transition-all group"
                  >
                    <div className={`w-12 h-12 bg-${plan.color}-100 dark:bg-${plan.color}-900/30 text-${plan.color}-600 rounded-2xl flex items-center justify-center mb-4`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-black">₹{plan.price}</span>
                      <span className="text-gray-400 font-medium">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((f) => (
                        <li key={f} className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
                          <Check size={14} className="mt-1 shrink-0 text-emerald-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade(plan.type)}
                      disabled={!!loading}
                      className={`w-full py-3 rounded-2xl font-black transition-all ${
                        plan.type === "PRO_SELLER" 
                          ? "bg-primary text-white shadow-lg shadow-primary/30" 
                          : "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      } hover:scale-[1.02] active:scale-95 disabled:opacity-50`}
                    >
                      {isLoading ? "Initializing..." : "Upgrade Now"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
