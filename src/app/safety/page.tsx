import { ShieldCheck, AlertTriangle, UserCheck, MapPin, Phone } from "lucide-react";

export const metadata = { title: "Trust & Safety | ExOwn", description: "Stay safe while buying and selling on ExOwn." };

const tips = [
  { icon: MapPin, title: "Meet in public campus areas", desc: "Always meet in well-lit, busy spots like the main canteen, library, or central square — never in isolated areas." },
  { icon: UserCheck, title: "Verify before you buy", desc: "Check the item carefully in person before handing over any money. Test electronics, check books for damage, etc." },
  { icon: AlertTriangle, title: "Never pay in advance", desc: "Do not transfer money via UPI or any other method before seeing and confirming the item is as described." },
  { icon: ShieldCheck, title: "Check verification tiers", desc: "Look for verification badges (Verified/Business) on seller profiles to deal with high-trust members of the community." },
  { icon: Phone, title: "Report suspicious activity", desc: "If something feels off, use the 'Report' button on any listing. Our team reviews all reports within 24 hours." },
];

export default function SafetyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <ShieldCheck size={16} /> Safety First
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Trust & Safety</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          ExOwn is designed to be the safest community marketplace. Here's how we keep you protected — and how you can protect yourself.
        </p>
      </div>

      <div className="space-y-4 mb-12">
        {tips.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex gap-5">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={22} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-6">
        <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
          <AlertTriangle size={20} /> Red Flags to Watch Out For
        </h3>
        <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 list-disc pl-5">
          <li>Seller asks for full payment before meeting</li>
          <li>Price is unrealistically low</li>
          <li>Seller refuses to meet on campus</li>
          <li>Item photos look like stock images</li>
          <li>Seller claims to be "out of town" and will ship</li>
        </ul>
      </div>
    </div>
  );
}
