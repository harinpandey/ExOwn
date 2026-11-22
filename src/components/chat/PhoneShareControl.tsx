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
      <div className="flex flex-col gap-2 rounded-xl border border-[#DDE6E0] bg-[#F7F9F8] p-3 dark:border-white/10 dark:bg-zinc-800/50">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <ShieldCheck size={15} className="text-primary" />
          <span>{shared ? "Phone number access is enabled for this buyer." : "Your phone number stays private unless you share it."}</span>
        </div>
        <button type="button" onClick={toggle} disabled={saving} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {shared ? <PhoneOff size={15} /> : <Phone size={15} />}
          {saving ? "Updating…" : shared ? "Revoke phone access" : "Share phone number with buyer"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#DDE6E0] bg-[#F7F9F8] p-3 dark:border-white/10 dark:bg-zinc-800/50">
      {shared && phone ? (
        <a href={"tel:" + phone} className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
          <Phone size={15} /> Call seller: {phone}
        </a>
      ) : (
        <p className="flex items-center gap-2 text-xs leading-5 text-gray-600 dark:text-gray-300">
          <ShieldCheck size={15} className="shrink-0 text-primary" />
          The seller has not shared their phone number yet. You can continue messaging here.
        </p>
      )}
    </div>
  );
}
