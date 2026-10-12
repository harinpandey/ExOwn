"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Tag, Laptop, BookOpen, RefreshCw, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";

interface CampaignStory {
  tag: string;
  badgeTone: string;
  title: string;
  highlight: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  bgGradient: string;
  objectIcon: any;
  objectColor: string;
}

const CAMPAIGNS: CampaignStory[] = [
  {
    tag: "CAMPUS TECH DROP",
    badgeTone: "bg-blue-600 text-white",
    title: "Pre-owned tech from",
    highlight: "verified seniors.",
    description: "MacBooks, monitors, graphing calculators and engineering tools inspected and priced for students.",
    ctaText: "Browse Tech",
    ctaHref: "/search?category=computers-laptops",
    bgGradient: "from-blue-900/90 via-indigo-950 to-[#07090d]",
    objectIcon: Laptop,
    objectColor: "text-blue-400",
  },
  {
    tag: "SEMESTER HOUSING & RENT",
    badgeTone: "bg-amber-500 text-black",
    title: "Rent it for this term.",
    highlight: "Don't buy it outright.",
    description: "Bicycles, mini-fridges, coolers and hostel furniture available on flexible semester rental terms.",
    ctaText: "Explore Rentals",
    ctaHref: "/search?listingType=RENT",
    bgGradient: "from-amber-950/80 via-orange-950/60 to-[#07090d]",
    objectIcon: RefreshCw,
    objectColor: "text-amber-400",
  },
  {
    tag: "MOVING OUT CLEARANCE",
    badgeTone: "bg-emerald-600 text-white",
    title: "Seniors clearing rooms.",
    highlight: "Instant hostel pickup.",
    description: "Final-year students handing down textbooks, lab gear and room essentials before graduation.",
    ctaText: "Explore Moving Out",
    ctaHref: "/search?movingOut=true",
    bgGradient: "from-emerald-950/80 via-teal-950/60 to-[#07090d]",
    objectIcon: BookOpen,
    objectColor: "text-emerald-400",
  },
];

export default function HeroCampaign() {
  const { user } = useAuth();
  const { campusObj } = useLocation();
  const campaign = CAMPAIGNS[0]; // Featured campaign
  const CampaignIcon = campaign.objectIcon;

  return (
    <section className="container mx-auto px-4 pt-2 pb-6">
      <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${campaign.bgGradient} p-6 sm:p-10 lg:p-12 shadow-2xl`}>
        {/* Subtle background glow effect */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">

          {/* Left: Editorial Story */}
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${campaign.badgeTone}`}>
                {campaign.tag}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/90 backdrop-blur-sm">
                <ShieldCheck size={12} className="text-emerald-400" />
                {campusObj.shortName} Marketplace
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.1]">
              {campaign.title}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                {campaign.highlight}
              </span>
            </h1>

            <p className="text-sm font-semibold leading-relaxed text-gray-300 sm:text-base max-w-xl">
              {campaign.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={campaign.ctaHref}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-black text-gray-950 shadow-xl transition hover:bg-gray-100 hover:scale-[1.02] active:scale-95"
              >
                <span>{campaign.ctaText}</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                href={!user ? "/login?redirect=/sell" : "/sell"}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
              >
                <Plus size={14} />
                <span>Sell Your Stuff</span>
              </Link>
            </div>
          </div>

          {/* Right: 2.5D Visual Focal Composition */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="relative h-64 w-64 flex items-center justify-center">
              {/* Layer 1: Ambient Ring */}
              <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm animate-pulse duration-1000" />

              {/* Layer 2: 2.5D Elevation Floating Object */}
              <div className="relative flex h-36 w-36 items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md shadow-25d object-25d transform rotate-3">
                <CampaignIcon size={64} className={`${campaign.objectColor} drop-shadow-xl`} />
              </div>

              {/* Layer 3: Floating Verified Badge Pill */}
              <div className="absolute bottom-2 -left-4 flex items-center gap-1.5 rounded-xl border border-white/20 bg-gray-900/90 px-3 py-1.5 text-[11px] font-black text-white shadow-xl backdrop-blur-md">
                <Sparkles size={13} className="text-yellow-400" />
                <span>Zero Brokerage</span>
              </div>

              {/* Layer 4: Floating Deal Pill */}
              <div className="absolute top-2 -right-4 flex items-center gap-1.5 rounded-xl border border-white/20 bg-blue-600/90 px-3 py-1.5 text-[11px] font-black text-white shadow-xl backdrop-blur-md">
                <Tag size={12} />
                <span>Student Pricing</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
