"use client";

import { useState } from "react";
import { Calendar, MapPin, ShieldCheck, X } from "lucide-react";
import { requestRental } from "@/actions/rental";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { format, addDays } from "date-fns";

export default function RentNowModal({ product, isOpen, onClose }: { product: any, isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));

  if (!isOpen) return null;

  const handleRequest = async () => {
    if (!user) return toast.error("Please login to rent");
    
    setLoading(true);
    try {
      const res = await requestRental({
        productId: product.id,
        renterId: user.uid,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        securityDeposit: product.rentalDetail?.securityDeposit || 0,
        pickupLocation: product.pickupLocation,
      });

      if (res.success) {
        toast.success("Rental request sent to owner!");
        onClose();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
  const totalAmount = product.price * days;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-black mb-2 italic">Rent Now</h2>
        <p className="text-gray-500 mb-8 font-medium">Verify dates and security deposit before booking.</p>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-primary" size={18} />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-primary" size={18} />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary font-bold"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-bold text-gray-500">Security Deposit</p>
              <p className="text-xl font-black text-gray-900 dark:text-gray-100">₹{product.rentalDetail?.securityDeposit || 0}</p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-bold text-gray-500">Rental Fee ({days} days)</p>
              <p className="text-xl font-black text-primary">₹{totalAmount}</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 text-xs font-medium">
              <ShieldCheck size={16} className="shrink-0" />
              Security deposit is fully refundable upon safe return of the item.
            </div>
          </div>

          <button
            onClick={handleRequest}
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {loading ? "Sending Request..." : "Send Rental Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
