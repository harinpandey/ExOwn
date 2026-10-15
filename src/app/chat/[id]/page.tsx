"use client";

import { useState, useRef, useEffect, use, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { getConversationContext } from "@/actions/chat";
import { updateOfferStatus } from "@/actions/offer";
import ReportButton from "@/components/ui/ReportButton";
import { toast } from "react-hot-toast";
import SellerLiveLocationControl from "@/components/chat/SellerLiveLocationControl";
import BuyerLiveLocationCard from "@/components/chat/BuyerLiveLocationCard";

interface LiveLocationMessageData {
  type: "LIVE_LOCATION_STARTED";
  sessionId: string;
  startedAt: string;
  expiresAt: string;
  productId: string;
}

function parseLiveLocationMessage(content: string): LiveLocationMessageData | null {
  if (!content || !content.includes("LIVE_LOCATION_STARTED")) return null;
  try {
    const data = JSON.parse(content);
    if (data?.type === "LIVE_LOCATION_STARTED" && data?.sessionId && data?.expiresAt) {
      return data as LiveLocationMessageData;
    }
  } catch {
    // not valid JSON
  }
  return null;
}

interface ConversationData {
  partner: {
    id: string;
    name: string | null;
    image: string | null;
    isVerified: boolean;
    verificationLevel: string | null;
    profile: {
      collegeName: string | null;
      course: string | null;
    } | null;
  };
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    status: string;
    listingType: string;
    condition: string;
    pickupLocation: string | null;
    sellerId: string;
    rentalDetail?: any;
  } | null;
  offer: {
    id: string;
    price: number;
    message?: string | null;
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED";
    buyerId: string;
    createdAt: Date;
  } | null;
  rental?: any;
  exchange?: any;
}

function ChatRoomContent({ partnerId }: { partnerId: string }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get("product") || undefined;

  const [messages, setMessages] = useState<any[]>([]);
  const [contextData, setContextData] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isActioningOffer, setIsActioningOffer] = useState(false);
  const [showMeetupTips, setShowMeetupTips] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close options menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/chat/${partnerId}${initialProductId ? `?product=${initialProductId}` : ""}`);
    }
  }, [user, authLoading, router, partnerId, initialProductId]);

  const fetchChatData = useCallback(async () => {
    if (!user) return;
    try {
      const { chatService } = await import("@/lib/chat-utils");

      const [history, context] = await Promise.all([
        chatService.fetchMessages(user.uid, partnerId),
        getConversationContext(user.uid, partnerId, initialProductId)
      ]);

      setMessages(history);
      if (context) {
        setContextData(context as ConversationData);
      }
    } catch (err) {
      console.error("Chat fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, partnerId, initialProductId]);

  useEffect(() => {
    fetchChatData();
    const interval = setInterval(fetchChatData, 3000);
    return () => clearInterval(interval);
  }, [fetchChatData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      const { chatService } = await import("@/lib/chat-utils");
      await chatService.send(user.uid, partnerId, content);
      await fetchChatData();
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleOfferStatusChange = async (offerId: string, status: "ACCEPTED" | "REJECTED") => {
    if (!user || isActioningOffer) return;
    setIsActioningOffer(true);
    try {
      const res = await updateOfferStatus(offerId, user.uid, status);
      if (res.success) {
        toast.success(status === "ACCEPTED" ? "Offer accepted! Meetup guidance updated." : "Offer declined.");
        await fetchChatData();
      } else {
        toast.error(res.error || "Could not update offer status.");
      }
    } catch (err: any) {
      console.error("Error updating offer:", err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsActioningOffer(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const partner = contextData?.partner;
  const partnerName = partner?.name || "Marketplace User";
  const avatarLetter = partnerName[0].toUpperCase();
  const product = contextData?.product;
  const offer = contextData?.offer;
  const isSeller = product && user ? product.sellerId === user.uid : false;

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-4xl h-[calc(100vh-120px)] md:h-[calc(100vh-160px)] flex flex-col">
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm flex-1 flex flex-col overflow-hidden">

        {/* Header 1: User & Verification */}
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-20">
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              aria-label="Back to messages"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center text-white font-black overflow-hidden shadow-sm">
                {partner?.image ? (
                  <img src={partner.image} alt={partnerName} className="w-full h-full object-cover" />
                ) : (
                  <span>{avatarLetter}</span>
                )}
              </div>
              {partner?.isVerified && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white dark:border-gray-900 shadow-sm"
                  title={partner.verificationLevel === "INSTITUTIONAL" ? "Student ID Verified" : "Email Verified"}
                >
                  <ShieldCheck size={12} className="stroke-[3]" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-gray-900 dark:text-white text-base tracking-tight leading-tight">
                  {partnerName}
                </h2>
                {partner?.isVerified && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40">
                    {partner.verificationLevel === "INSTITUTIONAL" ? "Student ID" : "Verified"}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                {partner?.profile?.collegeName || "Verified Campus Member"}
              </p>
            </div>
          </div>

          {/* Action Menu (Report listing/seller, Safety) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              aria-label="Conversation options"
            >
              <MoreVertical size={20} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setShowMeetupTips(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <ShieldCheck size={15} className="text-primary" />
                  Campus Meetup Guide
                </button>
                <div className="px-4 py-1">
                  <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                  <ReportButton
                    productId={product?.id}
                    reportedId={partner?.id}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Header 2: Linked Listing Context Card */}
        {product && (
          <div className="bg-orange-50/50 dark:bg-gray-800/40 border-b border-orange-100/60 dark:border-gray-800 px-4 py-2.5 md:px-6 md:py-3 transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden relative flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag size={18} />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                      {product.listingType}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      product.status === "LIVE"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {product.status}
                    </span>
                  </div>

                  <Link
                    href={`/product/${product.id}`}
                    target="_blank"
                    className="group flex items-center gap-1 font-bold text-gray-900 dark:text-white text-sm hover:text-primary transition-colors truncate mt-0.5"
                  >
                    <span className="truncate">{product.title}</span>
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Link>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-extrabold text-gray-900 dark:text-white">₹{product.price.toLocaleString("en-IN")}</span>
                    {product.pickupLocation && (
                      <span className="hidden sm:inline-flex items-center gap-1 truncate text-[11px]">
                        • <MapPin size={11} /> {product.pickupLocation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {isSeller && user && (
                  <SellerLiveLocationControl
                    productId={product.id}
                    partnerId={partnerId}
                    currentUserId={user.uid}
                    onSessionStarted={fetchChatData}
                  />
                )}
                <Link
                  href={`/product/${product.id}`}
                  className="px-3 py-1.5 text-xs font-bold text-primary bg-white dark:bg-gray-900 hover:bg-orange-50 rounded-xl border border-orange-200 dark:border-gray-700 transition-colors shadow-2xl shadow-primary/5"
                >
                  View Listing
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Header 3: Transaction / Offer / Agreement Banner */}
        {offer && (
          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-blue-100 dark:border-blue-900/30 px-4 py-2.5 md:px-6 md:py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className={`p-1.5 rounded-xl ${
                  offer.status === "ACCEPTED"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : offer.status === "REJECTED"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                }`}>
                  {offer.status === "ACCEPTED" ? <CheckCircle2 size={16} /> : offer.status === "REJECTED" ? <XCircle size={16} /> : <Clock size={16} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Offer: <span className="font-extrabold text-gray-900 dark:text-white">₹{offer.price.toLocaleString("en-IN")}</span>
                    </p>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      offer.status === "ACCEPTED"
                        ? "bg-emerald-500 text-white"
                        : offer.status === "REJECTED"
                        ? "bg-rose-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                  {product && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Listed: ₹{product.price.toLocaleString("en-IN")} • {offer.price < product.price ? `₹${(product.price - offer.price).toLocaleString("en-IN")} below asking` : "At asking price"}
                    </p>
                  )}
                </div>
              </div>

              {/* Offer Actions for the Seller */}
              {isSeller && offer.status === "PENDING" && product?.status === "LIVE" && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOfferStatusChange(offer.id, "REJECTED")}
                    disabled={isActioningOffer}
                    className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-white dark:bg-gray-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl transition-all disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleOfferStatusChange(offer.id, "ACCEPTED")}
                    disabled={isActioningOffer}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    Accept Offer
                  </button>
                </div>
              )}

              {/* Meetup Guidance Prompt once Accepted */}
              {offer.status === "ACCEPTED" && (
                <button
                  onClick={() => setShowMeetupTips(true)}
                  className="self-end sm:self-auto text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles size={13} /> Safe Meetup Next Steps
                </button>
              )}
            </div>
          </div>
        )}

        {/* Collapsible Safe Meetup Advice Banner */}
        {showMeetupTips && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/80 dark:border-amber-900/40 px-4 py-3 md:px-6 text-xs text-amber-950 dark:text-amber-200 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Campus Transaction Safety Checklist:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900 dark:text-amber-300">
                  <li><strong>Public Location:</strong> Always meet at a well-lit campus spot (e.g. Library foyer, Student Center, Campus Cafeteria).</li>
                  <li><strong>Inspect in Person:</strong> Test electronics and inspect physical item thoroughly before any payment.</li>
                  <li><strong>Zero Advance Transfer:</strong> Never send UPI or deposit money in advance before verifying the product physically.</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowMeetupTips(false)}
              className="text-amber-700 hover:text-amber-950 p-1 rounded-lg"
              aria-label="Dismiss safety checklist"
            >
              ✕
            </button>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#f8fafc] dark:bg-[#09090b]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                <Clock size={20} />
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No messages yet</p>
              <p className="text-xs text-gray-400 max-w-sm">
                Start the conversation with {partnerName}. Discuss meetup times, location on campus, or clarify item condition.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.uid;
              const liveLocData = parseLiveLocationMessage(msg.content);

              if (liveLocData) {
                const isLiveLocFeatureEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_LOCATION === "true";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} my-1.5`}>
                    <div className="max-w-[92%] sm:max-w-[80%]">
                      {isLiveLocFeatureEnabled ? (
                        <BuyerLiveLocationCard
                          sessionId={liveLocData.sessionId}
                          expiresAt={liveLocData.expiresAt}
                          startedAt={liveLocData.startedAt}
                          isCurrentUserSender={isMe}
                        />
                      ) : (
                        <div className={`rounded-2xl px-4 py-2.5 ${
                          isMe
                            ? "bg-primary text-white rounded-br-sm shadow-sm"
                            : "bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm"
                        }`}>
                          <div className="flex items-center gap-2">
                            <MapPin size={15} className="flex-shrink-0" />
                            <p className="text-sm font-semibold">Live location shared</p>
                          </div>
                        </div>
                      )}
                      <p className={`text-[10px] ${isMe ? "text-right" : "text-left"} mt-1 font-medium text-gray-400 px-2`}>
                        {format(new Date(msg.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? "bg-primary text-white rounded-br-sm shadow-sm"
                      : "bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] text-right mt-1 font-medium ${isMe ? "text-orange-200" : "text-gray-400"}`}>
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <div className="p-3 md:p-4 border-t border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900">
          <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Type a message... (Press Enter to send)"
                className="w-full px-4 py-3 max-h-32 rounded-2xl border border-gray-300/80 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-sm placeholder:text-gray-400"
                rows={1}
                disabled={isSending}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="p-3 bg-primary text-white rounded-2xl hover:bg-orange-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20 flex-shrink-0"
              aria-label="Send message"
            >
              <Send size={18} className={isSending ? "animate-pulse" : "translate-x-0.5 -translate-y-0.5"} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: partnerId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ChatRoomContent partnerId={partnerId} />
    </Suspense>
  );
}
