"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

const ANNOUNCEMENTS = [
  {
    id: "launch-v2",
    emoji: "✨",
    label: "NEW",
    text: "ExOwn is live on your campus",
    cta: "Explore Marketplace",
    href: "/search",
  },
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const announcement = ANNOUNCEMENTS[0];

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(`exown_ann_${announcement.id}`);
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [announcement.id]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(`exown_ann_${announcement.id}`, "1");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      className="relative z-50 flex items-center justify-center gap-3 bg-[var(--accent)] px-4 py-2.5 text-[#071003]"
    >
      <Sparkles size={14} className="shrink-0" aria-hidden="true" />
      <p className="text-xs font-black">
        <span className="mr-2 rounded bg-[#071003]/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
          {announcement.label}
        </span>
        {announcement.text}
        {" — "}
        <Link
          href={announcement.href}
          className="underline underline-offset-2 hover:no-underline"
        >
          {announcement.cta}
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="ml-auto shrink-0 rounded p-0.5 opacity-70 transition hover:opacity-100"
      >
        <X size={15} />
      </button>
    </div>
  );
}
