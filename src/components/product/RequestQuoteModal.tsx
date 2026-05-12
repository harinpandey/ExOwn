"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { requestServiceQuote } from "@/actions/service";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function RequestQuoteModal({ product, isOpen, onClose }: { product: any, isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(`Hi, I'm interested in your "${product.title}" service. Could you provide a quote?`);

  if (!isOpen) return null;

  const handleRequest = async () => {
    if (!user) return toast.error("Please login to request a quote");
    if (!product.serviceDetail) return toast.error("Service details missing");
    
    setLoading(true);
    try {
      const res = await requestServiceQuote({
        serviceDetailId: product.serviceDetail.id,
        userId: user.uid,
        content: message,
      });

      if (res.success) {
        toast.success("Quote request sent to provider!");
        onClose();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <X size={24} />
        </button>

        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
          <MessageSquare size={32} />
        </div>

        <h2 className="text-3xl font-black mb-2 italic">Request Quote</h2>
        <p className="text-gray-500 mb-8 font-medium">Explain your requirements to get an accurate price estimate.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Message to Provider</label>
            <textarea 
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-3xl border-none outline-none focus:ring-2 focus:ring-primary font-bold text-sm resize-none"
              placeholder="Describe what you need help with..."
            />
          </div>

          <button
            onClick={handleRequest}
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? "Sending..." : <><Send size={20} /> Send Inquiry</>}
          </button>
        </div>
      </div>
    </div>
  );
}
