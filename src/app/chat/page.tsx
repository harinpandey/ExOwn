"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Search, MessageSquare } from "lucide-react";

interface Conversation {
  partner: { id: string; name: string | null; image: string | null };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  product?: {
    id: string;
    title: string;
    price: number;
    images: string[];
    status: string;
  };
  offerStatus?: string;
  offerPrice?: number;
}

export default function ChatInboxPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/chat");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchConversations = async () => {
        try {
          const { getConversations } = await import("@/actions/chat");
          const data = await getConversations(user.uid);
          setConversations(data as Conversation[]);
        } catch (err) {
          console.error("Failed to fetch conversations:", err);
        } finally {
          setConvLoading(false);
        }
      };
      fetchConversations();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = conversations.filter((c) =>
    c.partner.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-140px)] md:h-[calc(100vh-200px)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {filtered.map((conv, i) => (
                <li key={i}>
                  <Link
                    href={conv.product?.id ? `/chat/${conv.partner.id}?product=${conv.product.id}` : `/chat/${conv.partner.id}`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-base font-bold overflow-hidden shrink-0">
                        {conv.partner.image ? (
                          <img src={conv.partner.image} alt={conv.partner.name || ""} className="w-full h-full object-cover" />
                        ) : (
                          (conv.partner.name?.[0] || "?").toUpperCase()
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-sm font-bold truncate text-gray-900 dark:text-white">
                            {conv.partner.name || "Campus Member"}
                          </h3>
                          <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true })}
                          </span>
                        </div>

                        {/* Listing Snippet if linked */}
                        {conv.product && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium truncate mb-1">
                            <span className="text-primary font-bold">Listing:</span>
                            <span className="truncate">{conv.product.title}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-bold text-gray-900 dark:text-white shrink-0">
                              ₹{conv.product.price?.toLocaleString("en-IN")}
                            </span>
                            {conv.offerStatus && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                                conv.offerStatus === "ACCEPTED"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : conv.offerStatus === "REJECTED"
                                  ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                              }`}>
                                {conv.offerStatus}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-gray-900 dark:text-white font-bold" : "text-gray-500"}`}>
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Thumbnail if available */}
                      {conv.product?.images?.[0] && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 bg-gray-100 dark:bg-zinc-800">
                          <img
                            src={conv.product.images[0]}
                            alt={conv.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 gap-4">
              <MessageSquare size={48} className="text-gray-200 dark:text-gray-700" />
              <p className="font-medium">No messages yet</p>
              <p className="text-sm text-center">Start a conversation by clicking "Chat with Seller" on any listing.</p>
              <Link href="/search" className="px-6 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors">
                Browse Listings
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
