"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { createReport } from "@/actions/report";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ReportButtonProps {
  productId?: string;
  reportedId?: string;
}

const REASONS = [
  { id: "FAKE_LISTING", label: "Fake Listing" },
  { id: "SPAM", label: "Spam" },
  { id: "ABUSIVE_CONTENT", label: "Abusive Content" },
  { id: "WRONG_INFORMATION", label: "Wrong Information" },
  { id: "SCAM", label: "Scam" }
];

export default function ReportButton({ productId, reportedId }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<any>("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to report.");
      router.push("/login");
      return;
    }
    
    setIsSubmitting(true);
    const res = await createReport({
      reporterId: user.uid,
      productId,
      reportedId,
      reason,
      description
    });
    
    setIsSubmitting(false);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setReason("");
        setDescription("");
      }, 2000);
    } else {
      toast.error(res.error || "Failed to submit report.");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
      >
        <Flag size={14} /> Report Listing
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {!isSuccess ? (
                <>
                  <div className="flex items-center justify-between p-8 border-b border-gray-50 dark:border-gray-800">
                    <div>
                      <h3 className="text-2xl font-black flex items-center gap-3 text-red-500 tracking-tight">
                        <AlertTriangle size={24} /> Report Listing
                      </h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Help us keep ExOwn safe</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleReport} className="p-8 space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Why are you reporting this?</label>
                      <div className="grid grid-cols-1 gap-2">
                        {REASONS.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setReason(r.id)}
                            className={`w-full p-4 rounded-2xl text-left text-sm font-bold transition-all border-2 ${
                              reason === r.id 
                              ? "bg-red-50 border-red-500 text-red-600" 
                              : "bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Additional Details (Optional)</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide more context..."
                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-red-500 outline-none transition-all font-medium resize-none text-sm"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-4 pt-2">
                      <button 
                        type="submit" 
                        disabled={!reason || isSubmitting}
                        className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-lg hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">Report Submitted</h3>
                  <p className="text-gray-500 font-medium max-w-xs mx-auto">Thank you for helping our community. Our safety team will review this listing shortly.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
