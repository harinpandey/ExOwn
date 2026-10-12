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
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0">
        {eyebrow && (
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-primary">
            {icon}
            <span>{eyebrow}</span>
          </div>
        )}
        <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-black text-primary transition hover:text-primary-dark hover:underline"
        >
          <span>{action}</span>
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
