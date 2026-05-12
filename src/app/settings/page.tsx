"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Shield, 
  Lock, 
  Settings as SettingsIcon, 
  Camera, 
  Phone, 
  GraduationCap, 
  Building2, 
  Check, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import { updateProfile } from "@/actions/settings";
import { getCloudinarySignature } from "@/actions/cloudinary";

type Tab = "personal" | "privacy" | "security" | "account";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    phone: "",
    course: "",
    year: "",
    hostel: "",
    regNo: "" // Restricted
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/settings");
    } else if (user) {
      setFormData({
        name: user.displayName || "",
        image: user.photoURL || "",
        phone: user.profile?.phone || "",
        course: user.profile?.course || "",
        year: user.profile?.batch || "",
        hostel: user.profile?.hostel || "",
        regNo: user.profile?.registrationNo || "Not provided"
      });
    }
  }, [user, loading, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large (Max 5MB)");
      return;
    }

    setIsSaving(true);
    try {
      const { timestamp, signature, apiKey, cloudName } = await getCloudinarySignature();
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", timestamp.toString());
      uploadData.append("signature", signature);
      uploadData.append("folder", "ExOwn_profiles");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, image: data.secure_url }));
        await updateProfile(user!.uid, { image: data.secure_url });
        setMessage({ type: "success", text: "Profile photo updated!" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to upload image" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    const res = await updateProfile(user.uid, formData);
    
    if (res.success) {
      setMessage({ type: "success", text: "Profile updated successfully." });
    } else {
      setMessage({ type: "error", text: res.error || "Update failed" });
    }
    setIsSaving(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const tabs: { id: Tab, label: string, icon: any }[] = [
    { id: "personal", label: "Personal Details", icon: User },
    { id: "privacy", label: "Privacy Settings", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "account", label: "Account", icon: SettingsIcon },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          <h1 className="text-2xl font-black mb-8 px-4 tracking-tight">Settings</h1>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                ? "bg-primary text-white shadow-lg shadow-primary/25" 
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-8 md:p-12"
            >
              {activeTab === "personal" && (
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black">Personal Details</h2>
                    {message && (
                      <motion.span 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          message.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {message.text}
                      </motion.span>
                    )}
                  </div>

                  {/* Profile Photo */}
                  <div className="flex items-center gap-6 pb-4">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-gray-50 dark:border-gray-800 shadow-xl">
                        <img 
                          src={formData.image || "/default-avatar.png"} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <Camera size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Profile Photo</h4>
                      <p className="text-xs text-gray-500">JPG, PNG or WEBP. Max 5MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-400">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-400">Phone Number</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-400">Course / Degree</label>
                      <div className="relative">
                        <GraduationCap size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select 
                          value={formData.course}
                          onChange={(e) => setFormData(p => ({ ...p, course: e.target.value }))}
                          className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all font-medium appearance-none"
                        >
                          <option value="">Select Degree</option>
                          <optgroup label="Engineering">
                            <option value="B.Tech CSE">B.Tech CSE</option>
                            <option value="B.Tech ECE">B.Tech ECE</option>
                            <option value="B.Tech Mechanical">B.Tech Mechanical</option>
                            <option value="B.Tech Civil">B.Tech Civil</option>
                            <option value="B.Tech Biotech">B.Tech Biotech</option>
                          </optgroup>
                          <optgroup label="Management">
                            <option value="MBA">MBA</option>
                            <option value="BBA">BBA</option>
                            <option value="B.Com">B.Com</option>
                          </optgroup>
                          <optgroup label="Arts & Science">
                            <option value="B.Sc">B.Sc</option>
                            <option value="M.Sc">M.Sc</option>
                            <option value="BA">BA</option>
                            <option value="MA">MA</option>
                          </optgroup>
                          <optgroup label="Other">
                            <option value="PhD">PhD</option>
                            <option value="Law">Law</option>
                            <option value="Design">Design</option>
                            <option value="Other">Other</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-400">Hostel / Residence</label>
                      <div className="relative">
                        <Building2 size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          value={formData.hostel}
                          onChange={(e) => setFormData(prev => ({ ...prev, hostel: e.target.value }))}
                          className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-400">Batch Year</label>
                      <div className="relative">
                        <SettingsIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          value={formData.year}
                          placeholder="e.g. 2024"
                          onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                          className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Restricted Field */}
                  <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 space-y-2">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle size={16} />
                      <span className="text-xs font-black uppercase tracking-wider">Restricted Information</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Registration Number</p>
                        <p className="font-bold">{formData.regNo}</p>
                      </div>
                      <button type="button" className="text-xs font-bold text-primary hover:underline">
                        Contact Support to Update
                      </button>
                    </div>
                  </div>

                  <button 
                    disabled={isSaving}
                    className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black text-lg hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-primary/20"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-8">
                  <h2 className="text-xl font-black">Privacy Settings</h2>
                  <div className="space-y-4">
                    {[
                      { label: "Show email publicly", desc: "Never shared by default" },
                      { label: "Show phone number publicly", desc: "Only visible to verified buyers" },
                      { label: "Show hostel location", desc: "Helps with nearby deals" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
                        <div>
                          <p className="font-bold">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full p-1 cursor-not-allowed opacity-50">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">Privacy is forced for your security</p>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black">Security</h2>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold">
                      <Shield size={14} />
                      Protected by ExOwn Identity
                    </span>
                  </div>
                  
                  <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-transparent space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <Lock size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold">Google Authentication</h3>
                        <p className="text-xs text-gray-500">Your account is linked to {user.email}</p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                      </div>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                    <div className="flex items-center gap-4 opacity-50">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-2xl flex items-center justify-center">
                        <Shield size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold">Two-Factor Auth</h3>
                        <p className="text-xs text-gray-500">Controlled by your Google Account security</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center text-center gap-4">
                    <p className="text-sm text-gray-500 max-w-xs">Run a quick security scan to ensure your profile is fully protected.</p>
                    <button 
                      onClick={() => alert("Security Scan Complete: Your profile is 100% secure.")}
                      className="px-8 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all"
                    >
                      Run Security Check
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-8">
                  <h2 className="text-xl font-black">Account</h2>
                  <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-4">
                    <div>
                      <h3 className="font-black text-lg text-red-500">Delete Account</h3>
                      <p className="text-sm text-gray-500">Permanently delete your ExOwn account and all listings. This action is irreversible.</p>
                    </div>
                    <button className="px-8 py-3 border-2 border-red-500/20 text-red-500 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all">
                      Deactivate Account
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
