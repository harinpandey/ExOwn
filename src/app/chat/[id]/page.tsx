"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Image as ImageIcon, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: partnerId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/chat/" + partnerId);
    }
  }, [user, authLoading, router, partnerId]);

  const fetchChatData = async () => {
    if (!user) return;
    try {
      const { chatService } = await import("@/lib/chat-utils");
      const { getUserProfile } = await import("@/actions/user");
      
      const [history, partnerData] = await Promise.all([
        chatService.fetchMessages(user.uid, partnerId),
        getUserProfile(partnerId)
      ]);
      
      setMessages(history);
      setPartner(partnerData);
    } catch (err) {
      console.error("Chat fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatData();
    
    // Simple polling for real-time-ish chat (every 3 seconds)
    const interval = setInterval(fetchChatData, 3000);
    return () => clearInterval(interval);
  }, [user, partnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    const content = newMessage;
    setNewMessage("");

    try {
      const { chatService } = await import("@/lib/chat-utils");
      await chatService.send(user.uid, partnerId, content);
      fetchChatData(); // Refresh immediately after sending
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const partnerName = partner?.name || "Unknown Seller";
  const avatarLetter = partnerName[0].toUpperCase();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-140px)] md:h-[calc(100vh-200px)] flex flex-col">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <Link href="/chat" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
              {partner?.image ? (
                <img src={partner.image} alt={partnerName} className="w-full h-full object-cover" />
              ) : (
                avatarLetter
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{partnerName}</h2>
              <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Online
              </p>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc] dark:bg-[#09090b]">
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe 
                    ? "bg-primary text-white rounded-br-sm shadow-sm" 
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm"
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[10px] text-right mt-1 ${isMe ? "text-primary-100" : "text-gray-400"}`}>
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <button type="button" className="p-3 text-gray-400 hover:text-primary transition-colors">
              <ImageIcon size={20} />
            </button>
            <div className="flex-1 relative">
              <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Type a message..."
                className="w-full pl-4 pr-4 py-3 max-h-32 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none transition-all resize-none custom-scrollbar"
                rows={1}
              />
            </div>
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send size={20} className="translate-x-0.5 -translate-y-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
