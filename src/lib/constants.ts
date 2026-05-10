import { 
  BookOpen, 
  Smartphone, 
  Sofa, 
  Bike, 
  Shirt, 
  Gamepad2, 
  Package, 
  Watch, 
  Calculator, 
  Coffee, 
  MoreHorizontal 
} from "lucide-react";

export const CATEGORIES = [
  { id: "books", name: "Books", icon: BookOpen, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: "electronics", name: "Electronics", icon: Smartphone, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { id: "furniture", name: "Furniture", icon: Sofa, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  { id: "cycles", name: "Cycles", icon: Bike, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  { id: "fashion", name: "Fashion", icon: Shirt, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
  { id: "gaming", name: "Gaming", icon: Gamepad2, color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  { id: "hostel", name: "Hostel Essentials", icon: Package, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
  { id: "accessories", name: "Accessories", icon: Watch, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" },
  { id: "calculators", name: "Calculators", icon: Calculator, color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  { id: "kitchen", name: "Kitchen Items", icon: Coffee, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  { id: "miscellaneous", name: "Miscellaneous", icon: MoreHorizontal, color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
];
