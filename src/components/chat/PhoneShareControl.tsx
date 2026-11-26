"use client";

import { useCallback, useEffect, useState } from "react";
import { Phone, PhoneOff, ShieldCheck } from "lucide-react";
import { getPhoneShareState, setPhoneShare } from "@/actions/phone-sharing";
import { toast } from "react-hot-toast";

export default function PhoneShareControl({ productId, partnerId, isSeller }: {
  productId: string;
  partnerId: string;
  isSeller: boolean;
}) {
  const [shared, setShared] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const state = await getPhoneShareState(productId, partnerId);
    if (state.success) {
      setShared(state.shared);
      setPhone(state.phone);
    }
    setLoading(false);
  }, [productId, partnerId]);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const toggle = async () => {
    if (saving) return;
    setSaving(true);
    const result = await setPhoneShare(productId, partnerId, !shared);
    if (result.success) {
      toast.success(result.shared ? "Phone number access shared with this buyer." : "Phone number access revoked.");
      await refresh();
    } else {
      toast.error(result.error || "Could not update phone access.");
    }
    setSaving(false);
  };

  if (loading) return null;

  if (isSeller) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        title={shared ? "Revoke this buyer's phone access" : "Share your phone number with this buyer"}
        aria-label={shared ? "Revoke phone access" : "Share phone number"}
        className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
          shared
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
            : "border-[#DDE6E0] bg-[#F7F9F8] text-[#1E5646] hover:bg-[#EAF2EF] dark:border-white/10 dark:bg-zinc-800/50 dark:text-emerald-300"
        }`}
      >
        {shared ? <PhoneOff size={14} /> : <Phone size={14} />}
        {saving ? "Updating…" : shared ? "Shared · Revoke" : "Share phone"}
      </button>
    );
  }

  return shared && phone ? (
    <a href={"tel:" + phone} className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800">
      <Phone size={14} /> Call seller
    </a>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400" title="Your phone number remains private until the seller shares it">
      <ShieldCheck size={14} className="text-primary" />
      Waiting for seller to share phone
    </span>
  );
}
