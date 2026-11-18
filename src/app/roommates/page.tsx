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
import { getReceivedRoommateInterests, getRoommateProfiles, reportRoommateProfile, sendRoommateInterest, updateRoommateInterestStatus } from "@/actions/roommate";
import { useLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";
import { useMoments } from "@/context/MomentsContext";
import toast from "react-hot-toast";

export default function RoommatesPage() {
  const { selectedCampus, campusObj } = useLocation();
  const { user } = useAuth();
  const userId = user?.uid;
  const { triggerEvent } = useMoments();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);

  // Filters
  const [maxBudget, setMaxBudget] = useState(15000);
  const [genderPref, setGenderPref] = useState("ANY");
  const [roomTypePref, setRoomTypePref] = useState("ANY");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [reportingProfile, setReportingProfile] = useState<{ id: string; name: string } | null>(null);
  const [reportReason, setReportReason] = useState<"SPAM" | "ABUSIVE_CONTENT" | "WRONG_INFORMATION" | "SCAM">("SPAM");
  const [reportDescription, setReportDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getRoommateProfiles({
      campus: selectedCampus,
      maxBudget,
      gender: genderPref,
      roomType: roomTypePref,
    })
      .then((data) => { if (active) setProfiles(data); })
      .catch((error) => console.error("[RoommatesPage] Failed to load selected campus profiles:", error))
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [selectedCampus, maxBudget, genderPref, roomTypePref]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setReceivedRequests([]);
      setRequestsLoading(false);
      return;
    }

    setRequestsLoading(true);
    getReceivedRoommateInterests()
      .then((items) => { if (active) setReceivedRequests(items); })
      .catch((error) => console.error("[RoommatesPage] Failed to load incoming requests:", error))
      .finally(() => { if (active) setRequestsLoading(false); });

    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerEvent("ROOMMATE_MATCH", { campusName: campusObj?.name, customCtaHref: "/roommates" });
    }, 4500);
    return () => clearTimeout(timer);
  }, [campusObj, triggerEvent]);

  const handleConnect = async (profileId: string) => {
    if (!user) {
      toast.error("Please login to connect with campus roommates");
      return;
    }

    setSendingId(profileId);
    try {
      const res = await sendRoommateInterest(profileId);
      if (res.success) {
        toast.success(res.notificationSent ? "Your roommate request was sent." : "Request saved. The notification could not be delivered.");
      } else {
        toast.error(res.error || "Failed to send request");
      }
    } catch {
      toast.error("Unable to send roommate request. Please try again.");
    } finally {
      setSendingId(null);
    }
  };

  const handleRequestStatus = async (interestId: string, status: "ACCEPTED" | "DECLINED") => {
    setUpdatingRequestId(interestId);
    try {
      const result = await updateRoommateInterestStatus(interestId, status);
      if (!result.success) {
        toast.error(result.error || "Unable to update request.");
        return;
      }
      setReceivedRequests((current) =>
        current.map((item) => item.id === interestId ? { ...item, status } : item)
      );
      toast.success(status === "ACCEPTED" ? "Roommate request accepted." : "Roommate request declined.");
    } catch {
      toast.error("Unable to update request. Please try again.");
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const submitRoommateReport = async () => {
    if (!reportingProfile) return;
    if (!user) {
      toast.error("Please login to report a profile");
      return;
    }

    setIsReporting(true);
    try {
      const result = await reportRoommateProfile({
        profileId: reportingProfile.id,
        reason: reportReason,
        description: reportDescription,
      });
      if (result.success) {
        toast.success("Report sent to the ExOwn moderation team.");
        setReportingProfile(null);
        setReportDescription("");
      } else {
        toast.error(result.error || "Unable to submit report.");
      }
    } catch {
      toast.error("Unable to submit report. Please try again.");
    } finally {
      setIsReporting(false);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBio = (p.bio || "").toLowerCase().includes(q);
      const matchName = p.user?.name?.toLowerCase().includes(q);
      if (!matchBio && !matchName) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 py-8 transition-colors dark:bg-[#090c12] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 text-gray-950 shadow-sm dark:border-white/10 dark:bg-[#10141b] dark:text-white sm:p-10">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
              <Users size={14} /> Student Roommate Finder
            </span>
            <h1 className="text-2xl font-black leading-tight tracking-tight text-gray-950 dark:text-white sm:text-4xl">
              Find compatible roommates at {campusObj?.name || "your campus"}
            </h1>
            <p className="text-sm font-medium leading-7 text-gray-600 dark:text-gray-400">
              Discover campus peers with similar budgets, move-in dates, and lifestyle preferences. Verification status is shown where available.
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
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200">
                <MapPin size={16} className="text-amber-300" />
                <span className="text-xs font-bold">{campusObj?.name || selectedCampus || "Selected campus"}</span>
              </div>
            </div>
          </div>
        </div>

        {user && (requestsLoading || receivedRequests.length > 0) && (
          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10141b]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-white">Requests to you</h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-white/50">Roommate interests sent to your campus profile.</p>
              </div>
              {receivedRequests.filter((item) => item.status === "PENDING").length > 0 && (
                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-bold text-purple-600 dark:text-purple-300">
                  {receivedRequests.filter((item) => item.status === "PENDING").length} pending
                </span>
              )}
            </div>

            {requestsLoading ? (
              <div className="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/[0.04]" />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {receivedRequests.map((request) => (
                  <article key={request.id} className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/10 text-sm font-black text-purple-600 dark:text-purple-300">
                        {request.sender?.image ? (
                          <img src={request.sender.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (request.sender?.name || "S").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-gray-900 dark:text-white">{request.sender?.name || "Campus member"}</p>
                        <p className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-white/50">
                          {[request.sender?.profile?.collegeName, request.sender?.profile?.course, request.sender?.profile?.year].filter(Boolean).join(" • ") || "ExOwn member"}
                        </p>
                        {request.message && <p className="mt-2 text-xs text-gray-600 dark:text-white/70">{request.message}</p>}
                        <p className="mt-2 text-[10px] text-gray-400">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${request.status === "PENDING" ? "bg-amber-500/10 text-amber-600" : request.status === "ACCEPTED" ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500"}`}>
                        {request.status.toLowerCase()}
                      </span>
                    </div>
                    {request.status === "PENDING" && (
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={updatingRequestId === request.id}
                          onClick={() => handleRequestStatus(request.id, "DECLINED")}
                          className="rounded-xl border border-gray-200 px-3 py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={updatingRequestId === request.id}
                          onClick={() => handleRequestStatus(request.id, "ACCEPTED")}
                          className="rounded-xl bg-purple-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                          {updatingRequestId === request.id ? "Saving..." : "Accept"}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10141b] md:grid-cols-4">
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
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-lg dark:border-white/10 dark:bg-[#10141b]"
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
                            <span title="Verified Student ID" className="inline-flex items-center">
                              <ShieldCheck size={15} className="text-purple-500 shrink-0" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-white/50">{p.campus?.name}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!user) { toast.error("Please login to report a profile"); return; }
                        setReportReason("SPAM");
                        setReportDescription("");
                        setReportingProfile({ id: p.id, name: p.user?.name || "Student" });
                      }}
                      aria-label={`Report ${p.user?.name || "student"} profile`}
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
                    onClick={() => handleConnect(p.id)}
                    disabled={sendingId === p.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/20"
                  >
                    <MessageSquare size={13} />
                    {sendingId === p.id ? "Sending..." : "Send request"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-[#10141b] sm:p-12">
            <Users size={40} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-black text-gray-950 dark:text-white">No roommate profiles found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              Try increasing your budget or changing the room and gender preferences. New campus-visible profiles will appear here when students publish them.
            </p>
            <button
              onClick={() => {
                setMaxBudget(15000);
                setGenderPref("ANY");
                setRoomTypePref("ANY");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {reportingProfile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isReporting) setReportingProfile(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="roommate-report-title"
            className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#10141b]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="roommate-report-title" className="text-lg font-black text-gray-900 dark:text-white">Report profile</h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-white/55">Your report about {reportingProfile.name} will be sent to ExOwn moderators.</p>
              </div>
              <button type="button" disabled={isReporting} onClick={() => setReportingProfile(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-white/10" aria-label="Close report form">
                <X size={18} />
              </button>
            </div>

            <label className="mt-5 block text-xs font-bold text-gray-700 dark:text-white/80">
              Reason
              <select
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value as typeof reportReason)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-primary dark:border-white/10 dark:bg-[#07090d] dark:text-white"
              >
                <option value="SPAM">Spam or misleading activity</option>
                <option value="ABUSIVE_CONTENT">Abusive or inappropriate content</option>
                <option value="WRONG_INFORMATION">False or misleading information</option>
                <option value="SCAM">Suspected scam or fraud</option>
              </select>
            </label>

            <label className="mt-4 block text-xs font-bold text-gray-700 dark:text-white/80">
              Additional details (optional)
              <textarea
                value={reportDescription}
                onChange={(event) => setReportDescription(event.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Share details that may help our moderators review this report."
                className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-primary dark:border-white/10 dark:bg-[#07090d] dark:text-white"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={isReporting} onClick={() => setReportingProfile(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5">Cancel</button>
              <button type="button" disabled={isReporting} onClick={submitRoommateReport} className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60">{isReporting ? "Submitting..." : "Submit report"}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
