"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Camera, 
  BookOpen, 
  GraduationCap, 
  Hash, 
  Phone, 
  Home, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  Lock
} from "lucide-react";
import { completeProfile } from "@/actions/user";

const COURSES = ["B.Tech", "BBA", "MBA", "BCA", "MCA", "Law", "Design", "Alumni", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni"];
const HOSTELS = ["BH1", "BH2", "BH3", "BH4", "BH5", "GH", "Apartment", "Day Scholar"];

export default function CompleteProfilePage() {
  const { user, loading, isProfileComplete, refreshProfile } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    course: "",
    year: "",
    phone: "",
    hostel: "",
    photoUrl: "",
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/complete-profile");
    }
    if (!loading && user && isProfileComplete) {
      router.push("/");
    }
    
    // Pre-fill from Firebase & DB
    if (user && !loading) {
      const fetchData = async () => {
        try {
          const { getUserProfile } = await import("@/actions/user");
          const dbProfile = await getUserProfile(user.uid, user.uid);
          
          setFormData(prev => ({
            ...prev,
            name: dbProfile?.name || user.displayName || "",
            photoUrl: dbProfile?.image || user.photoURL || "",
            registrationNumber: dbProfile?.registrationNumber || "",
            phone: dbProfile?.phone || "",
            course: dbProfile?.profile?.course || "",
            year: dbProfile?.profile?.batch || "", // Using batch for year mapping
            hostel: dbProfile?.profile?.hostel || "",
          }));
        } catch (err) {
          console.error("Error fetching pre-fill data:", err);
        }
      };
      fetchData();
    }
  }, [user, loading, isProfileComplete, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      alert("Please upload a JPG, PNG, or WEBP image up to 5MB.");
      return;
    }

    setUploading(true);
    try {
      const { getCloudinarySignature } = await import("@/actions/cloudinary");
      const { timestamp, signature, apiKey, cloudName, allowed_formats } = await getCloudinarySignature("ExOwn_profiles");

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey!);
      uploadData.append("timestamp", timestamp.toString());
      uploadData.append("signature", signature);
      uploadData.append("folder", "ExOwn_profiles");
      if (allowed_formats) {
        uploadData.append("allowed_formats", allowed_formats);
      }

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, photoUrl: data.secure_url }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name)) {
      setError("Please provide your name.");
      return;
    }
    if (step === 2 && (!formData.registrationNumber || !formData.course || !formData.year)) {
      setError("Registration number, course, and year are required.");
      return;
    }
    setError("");
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const result = await completeProfile(user!.uid, {
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        course: formData.course,
        batch: formData.year, // Using 'batch' field in DB for Year
        phone: formData.phone,
        hostel: formData.hostel,
        studentPhoto: formData.photoUrl,
        collegeName: "LPU", // Default college
      });

      if (result.success) {
        await refreshProfile();
        setStep(4); // Success step
        setTimeout(() => router.push("/"), 2000);
      } else {
        setError(result.error || "Failed to complete profile.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Progress bar */}
        {step < 4 && (
          <div className="flex justify-between mb-8 px-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`flex items-center gap-2 ${step >= s ? "text-primary" : "text-gray-400"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === s ? "bg-primary text-white" : 
                  step > s ? "bg-primary/20 text-primary" : "bg-gray-200 dark:bg-gray-800"
                }`}>
                  {step > s ? <CheckCircle2 size={18} /> : s}
                </div>
                <span className="hidden sm:inline text-xs font-semibold">
                  {s === 1 ? "Basics" : s === 2 ? "Accountability" : "Private"}
                </span>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                  <User size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Personal Details</h1>
                  <p className="text-gray-500 text-sm">Let's start with the basics.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-800 shadow-lg">
                      {formData.photoUrl ? (
                        <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                          <User size={48} />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                      <Camera size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 font-medium">Click to change profile photo</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <button
                  onClick={nextStep}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Accountability</h1>
                  <p className="text-gray-500 text-sm">Required for platform safety.</p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl mb-8 flex gap-3">
                <Lock className="text-amber-600 shrink-0" size={20} />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  <strong>Private Data:</strong> Your registration number is used only to prevent multiple accounts. It will <strong>never</strong> be shown to other users.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Registration Number</label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 122045XX"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Course</label>
                    <div className="relative">
                      <BookOpen size={18} className="absolute left-4 top-3.5 text-gray-400 pointer-events-none" />
                      <select
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                      >
                        <option value="" className="bg-white dark:bg-gray-900">Select Course</option>
                        {COURSES.map(c => <option key={c} value={c} className="bg-white dark:bg-gray-900">{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Year</label>
                    <div className="relative">
                      <GraduationCap size={18} className="absolute left-4 top-3.5 text-gray-400 pointer-events-none" />
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                      >
                        <option value="" className="bg-white dark:bg-gray-900">Select Year</option>
                        {YEARS.map(y => <option key={y} value={y} className="bg-white dark:bg-gray-900">{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex-[2] py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    Continue <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                  <Lock size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Private Details</h1>
                  <p className="text-gray-500 text-sm">Optional but helpful for smooth deals.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 12345 67890"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Hostel / Block (Optional)</label>
                  <div className="relative">
                    <Home size={18} className="absolute left-4 top-3.5 text-gray-400 pointer-events-none" />
                    <select
                      name="hostel"
                      value={formData.hostel}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                    >
                      <option value="" className="bg-white dark:bg-gray-900">Select Hostel</option>
                      {HOSTELS.map(h => <option key={h} value={h} className="bg-white dark:bg-gray-900">{h}</option>)}
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                    By completing your profile, you agree that your accountability data is true. Fake registration numbers will lead to account suspension.
                  </p>
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Submit Profile"}
                    {!isSubmitting && <CheckCircle2 size={20} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-12 shadow-xl border border-gray-100 dark:border-gray-800 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="text-3xl font-bold mb-2">Profile Completed</h1>
              <p className="text-gray-500 mb-8">Identity submitted. You now have full access to the marketplace.</p>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "100%" }} 
                  transition={{ duration: 2 }}
                  className="h-full bg-emerald-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-4 italic">Redirecting to marketplace...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
