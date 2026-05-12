import { 
  BookOpen, 
  Smartphone, 
  Sofa, 
  Bike, 
  Shirt, 
  Gamepad2, 
  Package, 
  MoreHorizontal 
} from "lucide-react";

export const CATEGORIES = [
  { id: "mobiles-gadgets", name: "Mobiles", icon: Smartphone, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: "electronics-appliances", name: "Electronics", icon: Package, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { id: "computers-laptops", name: "Laptops", icon: Smartphone, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
  { id: "furniture-hostel", name: "Furniture", icon: Sofa, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  { id: "fashion", name: "Fashion", icon: Shirt, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
  { id: "books-sports-hobbies", name: "Books", icon: BookOpen, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  { id: "bikes-transport", name: "Cycles", icon: Bike, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  { id: "cars", name: "Cars", icon: Package, color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  { id: "properties", name: "Hostel/Room", icon: BookOpen, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
  { id: "gaming-entertainment", name: "Gaming", icon: Gamepad2, color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  { id: "services", name: "Services", icon: MoreHorizontal, color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  { id: "jobs", name: "Jobs", icon: MoreHorizontal, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
];
