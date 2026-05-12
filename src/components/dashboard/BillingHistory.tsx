"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { CreditCard, Download, ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";

export default function BillingHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // In a real app, we'd use a server action here
      // For now, I'll assume we have a getPayments action or similar
      fetch(`/api/user/payments?userId=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          setPayments(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="h-40 bg-gray-50 dark:bg-gray-800/50 rounded-3xl animate-pulse" />;

  if (payments.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm bg-white dark:bg-gray-900">
      <table className="w-full text-left">
        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <tr>
            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500">Date</th>
            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500">Amount</th>
            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500">Status</th>
            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500">Receipt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-6 py-4 text-sm font-medium">{format(new Date(p.createdAt), "dd MMM, yyyy")}</td>
              <td className="px-6 py-4 text-sm font-black text-gray-900 dark:text-gray-100">₹{p.amount}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  p.paymentStatus === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 
                  p.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {p.paymentStatus}
                </span>
              </td>
              <td className="px-6 py-4">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-primary transition-colors">
                  <Download size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
