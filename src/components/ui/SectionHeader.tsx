import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  eyebrow?: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  href?: string;
  action?: string;
}

export default function SectionHeader({
  eyebrow,
  icon,
  title,
  description,
  href,
  action = "View all",
}: SectionHeaderProps) {
  const isMovingOut = title === "Moving Out Deals";

  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2">
            <span className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] " + (
              isMovingOut ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#E6F2EE] text-[#1E5646]"
            )}>
              {icon}
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="text-2xl font-extrabold tracking-tight text-[#13221D] sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#4A5D56]">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="marketplace-button-outline inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold"
        >
          <span>{action}</span>
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
