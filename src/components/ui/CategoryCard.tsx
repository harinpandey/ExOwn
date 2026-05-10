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
      className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:shadow-md ${color}`}>
        <Icon size={32} />
      </div>
      <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
        {name}
      </span>
    </Link>
  );
}
