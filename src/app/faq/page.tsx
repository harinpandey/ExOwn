import { ChevronDown } from "lucide-react";

export const metadata = { title: "FAQ | ExOwn", description: "Frequently asked questions about ExOwn." };

const faqs = [
  { q: "Who can use ExOwn?", a: "ExOwn is open to students and the general public. You need to sign in with your Google account to post listings or contact sellers." },
  { q: "Is it free to list items?", a: "Yes! Basic listing on ExOwn is free. We offer premium boosts and subscriptions to help you sell faster, with transparent, low platform fees." },
  { q: "How do I post an ad?", a: "Click 'Start Selling' or 'Post Ad' from the homepage. Fill in the details, upload photos, set your price, and publish. Your listing goes live instantly." },
  { q: "How do I contact a seller?", a: "Click 'Chat with Seller' on any product listing. You'll need to be logged in to start a conversation." },
  { q: "How do payments work?", a: "For items and services, buyers and sellers typically exchange cash or UPI in person. However, for platform features like boosts and subscriptions, we accept safe in-app payments via Razorpay." },
  { q: "Can I edit or delete my listing?", a: "Yes. Go to My Account → My Listings, and you can edit or remove any of your active ads." },
  { q: "What if a seller is not responding?", a: "If a seller doesn't respond within a reasonable time, try reaching out again. If you suspect fraudulent activity, use the 'Report' button on the listing." },
  { q: "Is my personal information safe?", a: "We only display your display name and Google profile photo. Your email is never shown to other users. See our Privacy Policy for full details." },
  { q: "Can I sell anything on ExOwn?", a: "You can sell most second-hand items: books, electronics, cycles, furniture, hostel essentials, etc. Items that are illegal, dangerous, or violate campus policy are not allowed." },
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 dark:text-gray-400">Everything you need to know about buying and selling on ExOwn.</p>
      </div>

      <div className="space-y-3">
        {faqs.map(({ q, a }) => (
          <details key={q} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-gray-900 dark:text-white list-none">
              {q}
              <ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
            </summary>
            <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
              {a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
