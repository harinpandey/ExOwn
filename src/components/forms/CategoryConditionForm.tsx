"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, HelpCircle } from "lucide-react";
import { CATEGORIES, Attribute } from "@/config/categories";

interface Props {
  categoryName: string;
  subcategoryName: string;
  onComplete: (details: any, finalCondition: string) => void;
  onOtherTitleChange?: (title: string) => void;
  initialDetails?: any;
  initialCondition?: string;
}

export default function CategoryConditionForm({ 
  categoryName, 
  subcategoryName, 
  onComplete,
  onOtherTitleChange,
  initialDetails,
  initialCondition: _initialCondition 
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(initialDetails || {});
  const [otherTitle, setOtherTitle] = useState("");

  // Find the category and subcategory from config
  const category = CATEGORIES.find(c => c.name === categoryName);
  const subcategory = category?.subcategories.find(s => s.name === subcategoryName);

  // Combine common attributes and subcategory-specific attributes
  const questions: Attribute[] = [
    ...(category?.commonAttributes || []),
    ...(subcategory?.attributes || [])
  ].slice(0, 6); // Limit to 6 attributes as per UX rules

  const isOther = subcategoryName.toLowerCase() === "other";

  useEffect(() => {
    // Reset if category/subcategory changes
    setCurrentStep(0);
    setAnswers({});
    setOtherTitle("");
  }, [categoryName, subcategoryName]);

  const [showConditionSelector, setShowConditionSelector] = useState(false);

  const handleAnswer = (qId: string, value: any) => {
    const newAnswers = { ...answers, [qId]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowConditionSelector(true);
    }
  };

  const finalize = (cond: string) => {
    onComplete(answers, cond);
  };

  if (isOther && !otherTitle) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/5 rounded-[2.5rem] p-8 border-2 border-primary/10 space-y-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary text-white rounded-2xl">
            <HelpCircle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black">What are you selling?</h3>
            <p className="text-sm text-gray-500">Since you selected 'Other', please specify.</p>
          </div>
        </div>
        
        <input
          type="text"
          value={otherTitle}
          onChange={(e) => {
            setOtherTitle(e.target.value);
            onOtherTitleChange?.(e.target.value);
          }}
          placeholder="e.g. Vintage Record Player"
          className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-lg shadow-sm"
          autoFocus
        />

        <button
          onClick={() => otherTitle.trim() && setOtherTitle(otherTitle.trim())}
          disabled={!otherTitle.trim()}
          className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          Continue
        </button>
      </motion.div>
    );
  }

  if (showConditionSelector) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-primary/20 shadow-xl">
        <Check className="mx-auto text-emerald-500 mb-4" size={48} />
        <h3 className="text-2xl font-black mb-2">Final Step: Condition</h3>
        <p className="text-sm text-gray-500 mb-8">Overall, how would you rate the item's condition?</p>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Like New", value: "LIKE_NEW", color: "bg-emerald-500" },
            { label: "Good", value: "GOOD", color: "bg-blue-500" },
            { label: "Fair", value: "FAIR", color: "bg-orange-500" },
            { label: "Poor", value: "POOR", color: "bg-red-500" }
          ].map((c) => (
            <button
              key={c.value}
              onClick={() => finalize(c.value)}
              className="p-6 rounded-2xl border-2 border-transparent hover:border-primary bg-gray-50 dark:bg-gray-700/50 transition-all group"
            >
              <div className={`w-3 h-3 rounded-full ${c.color} mb-3 mx-auto`} />
              <span className="font-black text-sm uppercase tracking-widest">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentStep];

  if (!currentQ) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
        <Check className="mx-auto text-emerald-500 mb-4" size={48} />
        <h3 className="text-xl font-black">All set!</h3>
        <p className="text-sm text-gray-500 mb-6">We've gathered the key details for your listing.</p>
        <button 
          onClick={() => setShowConditionSelector(true)}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold"
        >
          Proceed to Condition
        </button>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 rounded-[2.5rem] p-8 border-2 border-primary/10 relative overflow-hidden">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentStep ? 'w-8 bg-primary' : 
                i < currentStep ? 'w-4 bg-primary/40' : 'w-4 bg-gray-200 dark:bg-gray-800'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
          Step {currentStep + 1} of {questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              {currentQ.label}
            </h3>
            <p className="text-sm text-gray-500">Select the most accurate option</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQ.type === "toggle" ? (
              <div className="flex flex-col gap-4">
                {["Yes", "No"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAnswer(currentQ.id, option === "Yes")}
                    className={`w-full p-5 text-left rounded-2xl border-2 transition-all flex items-center justify-between group ${
                      answers[currentQ.id] === (option === "Yes")
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-white dark:bg-gray-800 hover:border-primary/30"
                    }`}
                  >
                    <span className="font-bold text-lg">{option}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                       answers[currentQ.id] === (option === "Yes") ? "bg-primary border-primary" : "border-gray-200"
                    }`}>
                      {answers[currentQ.id] === (option === "Yes") && <Check size={14} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {currentQ.options?.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAnswer(currentQ.id, option)}
                    className={`px-6 py-4 rounded-2xl font-bold transition-all shadow-sm ${
                      currentQ.type === "chips" 
                      ? (answers[currentQ.id] === option 
                        ? "bg-primary text-white scale-105 shadow-primary/25" 
                        : "bg-white dark:bg-gray-800 text-gray-600 hover:bg-primary/5 hover:border-primary/30 border-2 border-transparent")
                      : (answers[currentQ.id] === option 
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 scale-105" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200")
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <HelpCircle size={14} />
        Complete this to help ExOwn AI boost your listing
      </div>
    </div>
  );
}
