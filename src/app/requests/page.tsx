"use client";

import { useState, useEffect } from "react";
import { Plus, MessageSquare, Search, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getBuyingRequests, createBuyingRequest } from "@/actions/requests";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RequestBoardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    budget: "",
    category: "",
    listingType: "SELL" as "SELL" | "RENT" | "SERVICE",
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const data = await getBuyingRequests();
    setRequests(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to post a request");
      return;
    }

    const res = await createBuyingRequest(user.uid, {
      ...newRequest,
      budget: newRequest.budget ? parseFloat(newRequest.budget) : undefined,
    });

    if (res.success) {
      toast.success("Request posted successfully!");
      setIsModalOpen(false);
      setNewRequest({ title: "", description: "", budget: "", category: "", listingType: "SELL" });
      loadRequests();
    } else {
      toast.error(res.error || "Failed to post request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
              Need Something? <span className="text-primary">Request Board</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold">
              Post what you're looking for and let the sellers come to you.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
          >
            <Plus size={24} /> Post a Request
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search requests..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
            />
          </div>
          <select className="px-6 py-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none font-bold">
            <option>All Types</option>
            <option>Buying</option>
            <option>Rental</option>
            <option>Service</option>
          </select>
        </div>

        {/* Request Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white dark:bg-gray-900 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-800" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-black mb-2">No requests yet</h2>
            <p className="text-gray-500 font-bold mb-8">Be the first one to post a request!</p>
            <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-primary text-white rounded-xl font-black">
              Post Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div key={req.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    req.listingType === 'RENT' ? 'bg-yellow-100 text-yellow-700' : 
                    req.listingType === 'SERVICE' ? 'bg-purple-100 text-purple-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {req.listingType === 'RENT' ? 'Rental Request' : req.listingType === 'SERVICE' ? 'Service Request' : 'Buying Request'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <h3 className="text-xl font-black mb-2 group-hover:text-primary transition-colors">{req.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold line-clamp-3 mb-6">
                  {req.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <img src={req.user.image || "/avatar-placeholder.png"} alt="" className="w-8 h-8 rounded-full border-2 border-primary/20" />
                    <div>
                      <p className="text-[10px] font-black">{req.user.name}</p>
                      <p className="text-[8px] font-bold text-emerald-500 uppercase">Trust: {req.user.trustScore}%</p>
                    </div>
                  </div>
                  <Link 
                    href={`/chat/${req.user.id}?subject=Request: ${req.title}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-black text-xs hover:bg-primary hover:text-white transition-all"
                  >
                    <MessageSquare size={14} /> Respond
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-3xl font-black mb-6">What do you <span className="text-primary">Need?</span></h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Title</label>
                  <input 
                    required
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                    placeholder="e.g. Need a MacBook Air for 1 week" 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none font-bold border-2 border-transparent focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    placeholder="Explain what you need, condition, duration etc." 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none font-bold border-2 border-transparent focus:border-primary transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Type</label>
                    <select 
                      value={newRequest.listingType}
                      onChange={(e) => setNewRequest({...newRequest, listingType: e.target.value as any})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none font-bold"
                    >
                      <option value="SELL">Buying</option>
                      <option value="RENT">Rental</option>
                      <option value="SERVICE">Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Budget (₹)</label>
                    <input 
                      type="number"
                      value={newRequest.budget}
                      onChange={(e) => setNewRequest({...newRequest, budget: e.target.value})}
                      placeholder="Optional" 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none font-bold"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-dark transition-all">
                    Post Request
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-2xl font-black text-lg hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
