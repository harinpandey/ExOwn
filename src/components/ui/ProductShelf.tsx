import { ReactNode } from "react";
import SectionHeader from "./SectionHeader";

interface ProductShelfProps {
  eyebrow?: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  href?: string;
  action?: string;
  children: ReactNode;
  className?: string;
}

export default function ProductShelf({
  eyebrow,
  icon,
  title,
  description,
  href,
  action,
  children,
  className = "",
}: ProductShelfProps) {
  return (
    <section className={`container mx-auto px-4 py-8 sm:py-10 ${className}`}>
      <SectionHeader
        eyebrow={eyebrow}
        icon={icon}
        title={title}
        description={description}
        href={href}
        action={action}
      />
      <div className="relative">
        {children}
      </div>
    </section>
  );
}
