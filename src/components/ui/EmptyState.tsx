"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-gray-100 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900/40 backdrop-blur-sm shadow-sm max-w-lg mx-auto transition-premium">
      
      {/* Premium minimal animated SVG illustration */}
      <div className="mb-6 relative">
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-purple-500/5 rounded-full filter blur-xl animate-pulse scale-90" />
        
        <svg
          width="110"
          height="110"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-300 dark:text-gray-700 relative z-10 animate-[floatGlow_8s_ease-in-out_infinite]"
        >
          {/* Outer circle representing empty space */}
          <circle cx="60" cy="60" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          
          {/* Circular flow paths */}
          <path
            d="M38 78L52 64M52 64H42.5M52 64V73.5"
            stroke="url(#empty-gradient-1)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-75"
          />
          <path
            d="M82 42L68 56M68 56H77.5M68 56V46.5"
            stroke="url(#empty-gradient-2)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-75"
          />
          
          {/* Minimal card/listing icon in center */}
          <rect x="48" y="48" width="24" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="53" y1="56" x2="67" y2="56" stroke="currentColor" strokeWidth="2" />
          <line x1="53" y1="64" x2="61" y2="64" stroke="currentColor" strokeWidth="2" />
          
          <defs>
            <linearGradient id="empty-gradient-1" x1="38" y1="78" x2="52" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="empty-gradient-2" x1="82" y1="42" x2="68" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a855f7" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs font-medium leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs md:text-sm shadow-md transition-all active-press"
          >
            {actionLabel}
            <ArrowRight size={14} />
          </Link>
        ) : (
          <button
            onClick={onActionClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs md:text-sm shadow-md transition-all active-press"
          >
            {actionLabel}
            <ArrowRight size={14} />
          </button>
        )
      )}
    </div>
  );
}
