"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  X,
  Sparkles,
  TrendingDown,
  Tag,
  Eye,
  Bookmark,
  Handshake,
  CheckCircle2,
  Repeat,
  TrendingUp,
  Wrench,
  PlusCircle,
  Home,
  Users,
  BookOpen,
  Bell,
  ShieldCheck,
  ShieldAlert,
  Lightbulb,
  ShoppingBag,
  Clock,
  Flame,
  Zap,
  ArrowRight,
} from "lucide-react";
import { ActiveMoment } from "@/lib/moments/types";

interface Props {
  moment: ActiveMoment;
  onClose: () => void;
  onCtaClick: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  TrendingDown,
  Tag,
  Eye,
  Bookmark,
  Handshake,
  CheckCircle2,
  Repeat,
  TrendingUp,
  Wrench,
  PlusCircle,
  Home,
  Users,
  BookOpen,
  Bell,
  ShieldCheck,
  ShieldAlert,
  Lightbulb,
  ShoppingBag,
  Clock,
  Flame,
  Zap,
};

export default function ExOwnMomentCard({ moment, onClose, onCtaClick }: Props) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const duration = moment.duration || 7500;
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);

  const IconComponent = ICON_MAP[moment.icon] || Sparkles;

  // Keyboard navigation: Escape key closes moment
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Progress timer with hover-to-pause
  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      const pct = (currentRemaining / duration) * 100;
      setProgress(pct);

      if (currentRemaining <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => {
      clearInterval(interval);
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - (Date.now() - startTimeRef.current));
    };
  }, [isPaused, duration, onClose]);

  const handleCta = () => {
    onCtaClick();
    if (moment.ctaHref) {
      router.push(moment.ctaHref);
    }
    onClose();
  };

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-[390px] w-auto sm:w-[390px] overflow-hidden rounded-2xl border border-white/10 bg-[#10141b]/95 p-4 shadow-2xl backdrop-blur-xl transition hover:border-primary/40"
      style={{
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px -5px rgba(37, 99, 235, 0.15)",
      }}
    >
      {/* Top Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/20 text-primary">
            <Sparkles size={11} />
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-primary">
            ExOwn Moment
          </span>
          <span className="text-[9px] font-bold text-white/30">•</span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
            {moment.category.replace(/_/g, " ")}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close moment"
          className="flex h-6 w-6 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <X size={14} />
        </button>
      </div>

      {/* Main Body */}
      <div className="mt-3 flex items-start gap-3">
        {/* Thumbnail or Category Icon */}
        {moment.image ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0c1017]">
            <img
              src={moment.image}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-primary">
            <IconComponent size={20} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h4 className="text-[13px] font-black text-white tracking-tight leading-tight">
            {moment.title}
          </h4>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-white/70">
            {moment.message}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-3.5 flex items-center justify-end gap-2 pt-2">
        {moment.secondaryAction && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-white/50 hover:text-white transition"
          >
            {moment.secondaryAction.label}
          </button>
        )}

        <button
          type="button"
          onClick={handleCta}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-black text-white shadow-md shadow-primary/20 transition hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <span>{moment.cta}</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Subtle Progress Bar */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/[0.06]">
        <div
          className="h-full bg-primary/70 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}
