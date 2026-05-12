"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { updateTransactionStatus } from "@/actions/transaction";
import toast from "react-hot-toast";

interface TransactionPromptProps {
  recordId: string;
  userId: string;
  onActionComplete?: () => void;
}

export default function TransactionPrompt({ recordId, userId, onActionComplete }: TransactionPromptProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleAction = async (status: "COMPLETED" | "CANCELLED" | "NO_RESPONSE") => {
    const res = await updateTransactionStatus(recordId, userId, status);
    if (res.success) {
      toast.success("Thank you for your feedback!");
      setIsVisible(false);
      onActionComplete?.();
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/20 p-4 animate-in slide-in-from-top duration-300">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-full text-primary">
            <HelpCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 dark:text-white">Did this transaction complete?</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Your response helps build a safer community.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleAction("COMPLETED")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 size={16} /> COMPLETED
          </button>
          <button 
            onClick={() => handleAction("CANCELLED")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white rounded-xl text-xs font-black hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
          >
            <XCircle size={16} /> CANCELLED
          </button>
          <button 
            onClick={() => handleAction("NO_RESPONSE")}
            className="px-4 py-2 text-xs font-black text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline underline-offset-4"
          >
            NO RESPONSE
          </button>
        </div>
      </div>
    </div>
  );
}
