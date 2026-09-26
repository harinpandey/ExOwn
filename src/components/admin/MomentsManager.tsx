"use client";

import { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  TrendingUp,
  MousePointerClick,
  Eye,
  XCircle,
  Play,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
} from "lucide-react";
import { MOMENT_TEMPLATES } from "@/lib/moments/quotes";
import { AdminCustomMoment, MomentCategory, MomentPriority } from "@/lib/moments/types";
import { createAdminMoment, toggleAdminMoment, deleteAdminMoment } from "@/actions/moments";
import { useMoments } from "@/context/MomentsContext";
import toast from "react-hot-toast";

interface Props {
  initialMoments: AdminCustomMoment[];
  analytics: {
    totalImpressions: number;
    totalClicks: number;
    totalDismisses: number;
    totalEngagements: number;
    ctr: number;
    dismissRate: number;
    categoryBreakdown: Record<string, { impressions: number; clicks: number; dismisses: number }>;
  };
}

const CATEGORIES: MomentCategory[] = [
  "NEW_LISTING",
  "PRICE_DROP",
  "SAVED_ITEM",
  "REPEATED_VIEW",
  "NEARBY_LISTING",
  "TRENDING_CATEGORY",
  "OFFER_RECEIVED",
  "OFFER_ACCEPTED",
  "COUNTER_OFFER",
  "LISTING_GETTING_VIEWS",
  "LISTING_NOT_GETTING_ENGAGEMENT",
  "SELL_REMINDER",
  "HOUSING_MATCH",
  "ROOMMATE_MATCH",
  "EXCHANGE_OPPORTUNITY",
  "SERVICE_DISCOVERY",
  "EXAM_SEASON",
  "CAMPUS_ACTIVITY",
  "WEEKEND",
  "WELCOME",
  "RE_ENGAGEMENT",
  "SAFETY_SECURITY",
  "HELPFUL_ADVICE",
  "ANNOUNCEMENT",
];

export default function MomentsManager({ initialMoments, analytics }: Props) {
  const { showMoment } = useMoments();
  const [moments, setMoments] = useState<AdminCustomMoment[]>(initialMoments);
  const [activeTab, setActiveTab] = useState<"active" | "create" | "library" | "analytics">("active");

  // Form State
  const [title, setTitle] = useState("Semester Special: Cycle Rental Drop 🚲");
  const [message, setMessage] = useState("Cycles near Law Gate and BH-1 just dropped by ₹150 for weekly passes.");
  const [category, setCategory] = useState<MomentCategory>("CAMPUS_ACTIVITY");
  const [cta, setCta] = useState("View Campus Cycles");
  const [ctaHref, setCtaHref] = useState("/search?category=bikes-transport");
  const [priority, setPriority] = useState<MomentPriority>("normal");
  const [targetAudience, setTargetAudience] = useState<"ALL" | "BUYERS" | "SELLERS" | "HOUSING">("ALL");
  const [targetCampus, setTargetCampus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Library filter
  const [libraryCategory, setLibraryCategory] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message || !cta) {
      toast.error("Please fill in title, message, and CTA");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAdminMoment({
        title,
        message,
        category,
        cta,
        ctaHref,
        priority,
        targetAudience,
        targetCampus: targetCampus || undefined,
      });

      if (res.success && res.moment) {
        setMoments([res.moment, ...moments]);
        toast.success("ExOwn Moment created and activated!");
        setActiveTab("active");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create moment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleAdminMoment(id, !current);
      setMoments(moments.map((m) => (m.id === id ? { ...m, isActive: !current } : m)));
      toast.success(!current ? "Moment activated" : "Moment deactivated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom Moment?")) return;
    try {
      await deleteAdminMoment(id);
      setMoments(moments.filter((m) => m.id !== id));
      toast.success("Moment deleted");
    } catch {
      toast.error("Failed to delete moment");
    }
  };

  const testTrigger = (item: { title: string; message: string; cta: string; ctaHref?: string; category: MomentCategory; icon?: string }) => {
    showMoment({
      instanceId: `test_${Date.now()}`,
      templateId: "preview",
      title: item.title.replace(/\{item\}/g, "MacBook Air M1").replace(/\{amount\}/g, "₹2,500").replace(/\{campus\}/g, "LPU Campus"),
      message: item.message.replace(/\{item\}/g, "MacBook Air M1").replace(/\{amount\}/g, "₹2,500").replace(/\{campus\}/g, "LPU Campus").replace(/\{views\}/g, "14"),
      cta: item.cta,
      ctaHref: item.ctaHref || "/search",
      category: item.category,
      icon: item.icon || "Sparkles",
      priority: "normal",
      timestamp: Date.now(),
      isTransactional: true, // test trigger forces popup
    });
    toast.success("Triggered test popup on your screen!");
  };

  const filteredTemplates = MOMENT_TEMPLATES.filter((t) => {
    if (libraryCategory !== "ALL" && t.category !== libraryCategory) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#10141b] p-5 shadow-sm">
          <div className="flex items-center justify-between text-white/50 text-xs font-black uppercase tracking-wider">
            <span>Impressions</span>
            <Eye size={16} className="text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{analytics.totalImpressions.toLocaleString()}</p>
          <span className="text-[10px] text-white/40">In-app popups shown</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10141b] p-5 shadow-sm">
          <div className="flex items-center justify-between text-white/50 text-xs font-black uppercase tracking-wider">
            <span>Interactions</span>
            <MousePointerClick size={16} className="text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{analytics.totalClicks.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-bold">{analytics.ctr}% Click-Through Rate</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10141b] p-5 shadow-sm">
          <div className="flex items-center justify-between text-white/50 text-xs font-black uppercase tracking-wider">
            <span>Dismissals</span>
            <XCircle size={16} className="text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{analytics.totalDismisses.toLocaleString()}</p>
          <span className="text-[10px] text-white/40">{analytics.dismissRate}% closed manually</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10141b] p-5 shadow-sm">
          <div className="flex items-center justify-between text-white/50 text-xs font-black uppercase tracking-wider">
            <span>Templates</span>
            <Sparkles size={16} className="text-purple-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{MOMENT_TEMPLATES.length}+</p>
          <span className="text-[10px] text-purple-400 font-bold">Witty smart rotation</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("active")}
          className={`rounded-xl px-4 py-2 text-xs font-black transition ${
            activeTab === "active" ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:text-white"
          }`}
        >
          Active Moments ({moments.length})
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition ${
            activeTab === "create" ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:text-white"
          }`}
        >
          <Plus size={14} /> Create Custom Moment
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition ${
            activeTab === "library" ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:text-white"
          }`}
        >
          <Sparkles size={14} /> Quote Template Library ({MOMENT_TEMPLATES.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE MOMENTS */}
      {activeTab === "active" && (
        <div className="space-y-4">
          {moments.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-white/10 p-12 text-center text-white/40">
              <Sparkles size={32} className="mx-auto mb-3 text-primary opacity-50" />
              <p className="text-sm font-bold">No custom admin moments created yet.</p>
              <p className="text-xs mt-1">Automatic smart marketplace triggers are active in the background.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {moments.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#10141b] p-5 transition hover:border-white/20"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-primary/20 text-primary">
                        {m.category}
                      </span>
                      <span className="text-[10px] text-white/40">
                        Audience: <strong className="text-white/70">{m.targetAudience}</strong>
                      </span>
                      {m.targetCampus && (
                        <span className="text-[10px] text-white/40">
                          Campus: <strong className="text-white/70">{m.targetCampus}</strong>
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-white">{m.title}</h4>
                    <p className="text-xs text-white/60">{m.message}</p>
                    <div className="flex items-center gap-4 text-[11px] text-white/40 pt-1">
                      <span>CTA: <strong className="text-primary">{m.cta}</strong> ({m.ctaHref})</span>
                      <span>•</span>
                      <span>{m.impressions} Views</span>
                      <span>•</span>
                      <span>{m.clicks} Clicks</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => testTrigger(m)}
                      title="Trigger popup live on your screen"
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition"
                    >
                      <Play size={12} className="text-primary" /> Test Trigger
                    </button>

                    <button
                      onClick={() => handleToggle(m.id, m.isActive)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        m.isActive
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {m.isActive ? "Active" : "Inactive"}
                    </button>

                    <button
                      onClick={() => handleDelete(m.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 hover:bg-red-500/20 hover:text-red-400 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE CUSTOM MOMENT */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <form onSubmit={handleCreate} className="space-y-4 rounded-2xl border border-white/10 bg-[#10141b] p-6">
            <h3 className="text-lg font-black text-white">Create New ExOwn Moment</h3>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/50">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MomentCategory)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#10141b] text-white">
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/50">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Semester Special: Cycle Rental Drop 🚲"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/50">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Keep it witty, student-friendly, and concise..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/50">CTA Label</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="e.g. Check Deal"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/50">CTA Link</label>
                <input
                  type="text"
                  value={ctaHref}
                  onChange={(e) => setCtaHref(e.target.value)}
                  placeholder="e.g. /search?category=bikes"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/50">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-primary"
                >
                  <option value="ALL" className="bg-[#10141b]">All Students</option>
                  <option value="BUYERS" className="bg-[#10141b]">Buyers</option>
                  <option value="SELLERS" className="bg-[#10141b]">Sellers</option>
                  <option value="HOUSING" className="bg-[#10141b]">Housing Seekers</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/50">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as MomentPriority)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-primary"
                >
                  <option value="low" className="bg-[#10141b]">Low (Relaxed)</option>
                  <option value="normal" className="bg-[#10141b]">Normal</option>
                  <option value="high" className="bg-[#10141b]">High</option>
                  <option value="urgent" className="bg-[#10141b]">Urgent (Bypass Caps)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/50">Target Campus (Optional)</label>
              <input
                type="text"
                value={targetCampus}
                onChange={(e) => setTargetCampus(e.target.value)}
                placeholder="Leave blank for all campuses or e.g. Lovely Professional University"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary py-3 text-xs font-black text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Publishing..." : "Publish ExOwn Moment"}
            </button>
          </form>

          {/* Live Preview Card */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white">Live In-App Preview</h3>
            <p className="text-xs text-white/50">
              This is exactly how students will see the floating Moment on bottom-right of desktop / bottom-sheet on mobile.
            </p>

            <div className="relative rounded-2xl border border-white/10 bg-[#07090d] p-8 min-h-[300px] flex items-center justify-center">
              <div className="w-full max-w-[380px] overflow-hidden rounded-2xl border border-white/15 bg-[#10141b] p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/20 text-primary">
                      <Sparkles size={11} />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                      ExOwn Moment
                    </span>
                    <span className="text-[9px] font-bold text-white/30">•</span>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      {category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <button type="button" className="text-white/40 hover:text-white">
                    <XCircle size={14} />
                  </button>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-primary">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-white tracking-tight leading-tight">
                      {title || "Moment Title"}
                    </h4>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-white/70">
                      {message || "Moment message content will appear here..."}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-black text-white shadow-md shadow-primary/20"
                  >
                    {cta || "Learn More"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEMPLATE LIBRARY EXPLORER */}
      {activeTab === "library" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search witty quote templates..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-primary"
            />

            <select
              value={libraryCategory}
              onChange={(e) => setLibraryCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#10141b] px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-primary"
            >
              <option value="ALL">All Categories ({MOMENT_TEMPLATES.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((t) => (
              <div
                key={t.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#10141b] p-4 transition hover:border-primary/40 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-white/5 text-white/50">
                      {t.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] font-bold text-white/30">{t.id}</span>
                  </div>

                  <h5 className="text-xs font-black text-white">{t.title}</h5>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-white/70">
                    {t.message}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="text-[11px] font-bold text-primary">{t.cta}</span>
                  <button
                    onClick={() => testTrigger(t)}
                    className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-black text-white hover:bg-primary transition"
                  >
                    <Play size={10} /> Test Trigger
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
