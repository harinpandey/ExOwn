import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

export default function CategoryCard({ id, name, icon: Icon, color }: CategoryCardProps) {
  return (
    <Link 
      href={`/search?category=${id}`}
      className="group flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#10141b] p-4 text-center transition hover:-translate-y-0.5 hover:border-primary/40"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition group-hover:scale-105 ${color}`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-black leading-tight text-white/72 transition group-hover:text-primary">
        {name}
      </span>
    </Link>
  );
}
