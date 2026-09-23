"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  Search,
  MapPin,
  Sparkles,
  MessageSquare,
  Flag,
  X,
  Lock,
} from "lucide-react";
import { getRoommateProfiles, sendRoommateInterest } from "@/actions/roommate";
import { useLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function RoommatesPage() {
  const { selectedCampus, campusObj } = useLocation();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [maxBudget, setMaxBudget] = useState(15000);
  const [genderPref, setGenderPref] = useState("ANY");
  const [roomTypePref, setRoomTypePref] = useState("ANY");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfiles() {
      setLoading(true);
      const data = await getRoommateProfiles({
        campus: selectedCampus,
        maxBudget: maxBudget,
        gender: genderPref,
        roomType: roomTypePref,
      });
      setProfiles(data);
      setLoading(false);
    }
    loadProfiles();
  }, [selectedCampus, maxBudget, genderPref, roomTypePref]);

  const handleConnect = async (profileId: string, receiverId: string) => {
    if (!user) {
      toast.error("Please login to connect with campus roommates");
      return;
    }
    setSendingId(profileId);
    const res = await sendRoommateInterest({
      receiverId: receiverId || "u-demo-1",
      senderId: user.uid,
    });
    setSendingId(null);
    if (res.success) {
      toast.success("Interest sent! We've notified your campus peer.");
    } else {
      toast.error(res.error || "Failed to send request");
    }
  };

  const handleReport = (name: string) => {
    if (confirm(`Report profile of ${name} for moderation review?`)) {
      toast.success("Report submitted to campus safety moderators.");
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBio = p.bio.toLowerCase().includes(q);
      const matchName = p.user?.name?.toLowerCase().includes(q);
      if (!matchBio && !matchName) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090d] py-6 px-4 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur">
              <Users size={14} /> Student Roommate Finder
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Find Compatible Roommates at {campusObj.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
              Connect with verified university peers sharing similar budgets, move-in dates, and lifestyle preferences. Safe, private & student-verified.
            </p>

            {/* Quick Search */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2 pt-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by course, interests, bio keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl bg-white dark:bg-gray-900 pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-2xl px-4 py-2 border border-white/20">
                <MapPin size={16} className="text-amber-300" />
                <span className="text-xs font-bold">{campusObj.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-[#10141b] p-5 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
          {/* Budget Range */}
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-white/80 mb-1.5">
              <span>Max Budget</span>
              <span className="text-purple-600 dark:text-purple-400">₹{maxBudget.toLocaleString("en-IN")}/mo</span>
            </div>
            <input
              type="range"
              min={4000}
              max={25000}
              step={1000}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Gender Preference */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 dark:text-white/80 mb-1.5">Roommate Gender</h4>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "ANY", label: "Any" },
                { id: "MALE", label: "Male" },
                { id: "FEMALE", label: "Female" },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenderPref(g.id)}
                  className={`py-1.5 text-[11px] font-bold rounded-xl border transition ${
                    genderPref === g.id
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Room Type */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 dark:text-white/80 mb-1.5">Room Type</h4>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "ANY", label: "Any" },
                { id: "PRIVATE", label: "Private" },
                { id: "SHARED", label: "Shared" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRoomTypePref(r.id)}
                  className={`py-1.5 text-[11px] font-bold rounded-xl border transition ${
                    roomTypePref === r.id
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setMaxBudget(15000);
                setGenderPref("ANY");
                setRoomTypePref("ANY");
                setSearchQuery("");
              }}
              className="w-full py-2.5 bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.08] text-gray-700 dark:text-white text-xs font-bold rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Profiles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 rounded-3xl bg-gray-200 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProfiles.map((p) => (
              <article
                key={p.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#10141b] p-5 shadow-sm transition hover:border-purple-500/40 hover:shadow-xl"
              >
                <div>
                  {/* Top Peer Info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-black text-lg overflow-hidden border border-purple-500/20">
                        {p.user?.name ? p.user.name.charAt(0) : "S"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{p.user?.name || "Campus Student"}</h3>
                          {p.user?.isVerified && (
                            <ShieldCheck size={15} className="text-purple-500 shrink-0" title="Verified Student ID" />
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-white/50">{p.campus?.name}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleReport(p.user?.name || "Student")}
                      className="text-gray-400 hover:text-red-500 transition p-1"
                      title="Report profile"
                    >
                      <Flag size={14} />
                    </button>
                  </div>

                  {/* Match Reason Badges */}
                  {p.matchReasons && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.matchReasons.map((m: string) => (
                        <span
                          key={m}
                          className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-black text-purple-600 dark:text-purple-400"
                        >
                          <Sparkles size={10} /> {m}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Budget & Room type row */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-2xl mb-3 text-xs">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Budget</p>
                      <p className="font-black text-purple-600 dark:text-purple-400">
                        ₹{p.budgetMin?.toLocaleString("en-IN")} - ₹{p.budgetMax?.toLocaleString("en-IN")}/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Preference</p>
                      <p className="font-bold text-gray-800 dark:text-white/90 capitalize">
                        {p.preferredGender?.toLowerCase()} • {p.roomType?.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-600 dark:text-white/70 leading-relaxed line-clamp-3 mb-3">
                    {p.bio}
                  </p>

                  {/* Interests */}
                  {p.interests && p.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.interests.map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-gray-100 dark:bg-white/[0.05] px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:text-white/70"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Connect Action Footer */}
                <div className="mt-4 border-t border-gray-100 dark:border-white/[0.06] pt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                    <Lock size={12} className="text-emerald-500" /> Contact Protected
                  </span>

                  <button
                    onClick={() => handleConnect(p.id, p.user?.id)}
                    disabled={sendingId === p.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/20"
                  >
                    <MessageSquare size={13} />
                    {sendingId === p.id ? "Sending..." : "Connect / Send Request"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#10141b] rounded-3xl border border-gray-200 dark:border-white/10 p-12 text-center shadow-sm">
            <Users size={40} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No roommate profiles matched</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting max budget or gender preferences to discover more university peers.
            </p>
            <button
              onClick={() => {
                setMaxBudget(15000);
                setGenderPref("ANY");
                setRoomTypePref("ANY");
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
