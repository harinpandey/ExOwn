"use client";

import { useState, useEffect } from "react";
import { getAiRules, createAiRule, toggleAiRule, deleteAiRule } from "@/actions/admin";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Power, 
  PowerOff,
  Code,
  Save,
  Wand2
} from "lucide-react";

export default function AiRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState({ name: "", logic: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const data = await getAiRules();
    setRules(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newRule.name || !newRule.logic) return;
    setIsSubmitting(true);
    try {
      await createAiRule({ 
        name: newRule.name, 
        rule: { logic: newRule.logic } 
      });
      setNewRule({ name: "", logic: "" });
      fetchRules();
    } catch (err) {
      alert("Failed to create rule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleAiRule(id, !current);
    fetchRules();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this rule?")) {
      await deleteAiRule(id);
      fetchRules();
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-4 bg-primary text-white rounded-3xl shadow-lg shadow-primary/30">
          <Wand2 size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black italic tracking-tight">AI Training Panel</h1>
          <p className="text-gray-500 font-medium">Fine-tune ExOwn AI logic and recommendations.</p>
        </div>
      </div>

      {/* Create Rule */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-xl mb-12">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Plus className="text-primary" /> New Decision Logic
        </h2>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Rule Name (e.g., iPhone Age Check)"
            value={newRule.name}
            onChange={(e) => setNewRule({...newRule, name: e.target.value})}
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
          />
          <div className="relative">
            <textarea 
              rows={4}
              placeholder="Logic: IF age > 4 AND price > 70% THEN Avoid Buying..."
              value={newRule.logic}
              onChange={(e) => setNewRule({...newRule, logic: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary transition-all font-mono text-sm"
            />
            <Code size={18} className="absolute right-4 bottom-4 text-gray-400" />
          </div>
          <button 
            onClick={handleCreate}
            disabled={isSubmitting || !newRule.name}
            className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-lg"
          >
            <Save size={20} /> {isSubmitting ? "Saving..." : "Deploy Rule"}
          </button>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold px-2">Active Knowledge Base</h2>
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Syncing with AI Engine...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
            <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-bold">No custom rules deployed yet.</p>
          </div>
        ) : (
          rules.map((rule) => (
            <motion.div 
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border transition-all flex items-center justify-between gap-4 ${
                rule.isActive 
                ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-md' 
                : 'bg-gray-100 dark:bg-gray-800/30 border-transparent opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${rule.isActive ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-400'}`}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold">{rule.name}</h3>
                  <p className="text-xs font-mono text-gray-500 mt-1">{(rule.rule as any).logic}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggle(rule.id, rule.isActive)}
                  className={`p-3 rounded-xl transition-all ${
                    rule.isActive 
                    ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                >
                  {rule.isActive ? <Power size={20} /> : <PowerOff size={20} />}
                </button>
                <button 
                  onClick={() => handleDelete(rule.id)}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
