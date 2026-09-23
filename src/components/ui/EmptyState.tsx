"use client";

import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  secondaryActionLabel,
  secondaryActionHref,
}: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#10141b] px-6 py-14 text-center shadow-lg">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles size={17} />
        </div>
        <Search size={34} className="text-white/45" />
      </div>

      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-white/52">{description}</p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {actionLabel &&
            (actionHref ? (
              <Link
                href={actionHref}
                className="marketplace-button inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-black transition"
              >
                {actionLabel}
                <ArrowRight size={15} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onActionClick}
                className="marketplace-button inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-black transition"
              >
                {actionLabel}
                <ArrowRight size={15} />
              </button>
            ))}

          {secondaryActionLabel && secondaryActionHref && (
            <Link
              href={secondaryActionHref}
              className="inline-flex h-11 items-center rounded-lg border border-white/10 px-5 text-sm font-black text-white transition hover:border-primary/40 hover:text-primary"
            >
              {secondaryActionLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
