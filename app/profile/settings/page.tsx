"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import Link from "next/link";
import DeleteAccountButton from '@/components/DeleteAccountButton';

export default function SettingsPage() {
  // Added 'update' to refresh the session when changes are saved
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile State
  const [name, setName] = useState(session?.user?.name || "");
  const [imageUrl, setImageUrl] = useState(session?.user?.image || "");
  const [phone, setPhone] = useState(""); // <-- NEW: Phone state
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // --- NEW: Fetch current data from the database on load ---
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setName(data.name);
          if (data.phone) setPhone(data.phone);
        })
        .catch((err) => console.error("Failed to load settings:", err));
    }
  }, [status]);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // --- UPGRADED: Real Database Connection ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }), // Send new data to API
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        await update(); // Force NextAuth to refresh the user session
        router.refresh(); 
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    
    setIsSavingPassword(true);
    setMessage({ type: "", text: "" });

    // TODO: Connect this to your password reset API when you build it
    setTimeout(() => {
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsSavingPassword(false);
    }, 1000);
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/profile" className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-emerald-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Account Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your profile, preferences, and security.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-800/50 p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
            <nav className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap ${
                  activeTab === "profile" 
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span>👤</span> General Profile
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap ${
                  activeTab === "security" 
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span>🔒</span> Security & Password
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8">
            
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl text-sm border ${message.type === "error" ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-800" : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800"}`}>
                {message.text}
              </div>
            )}

            {/* TAB 1: PROFILE */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">Profile Information</h2>
                
                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Profile Picture</label>
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-sm overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-300">
                      {imageUrl ? <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" /> : (name?.charAt(0) || "U")}
                    </div>
                    
                    <CldUploadWidget 
                      uploadPreset="agrimarket_products"
                      onSuccess={(result: any) => setImageUrl(result.info.secure_url)}
                    >
                      {({ open }) => (
                        <button type="button" onClick={() => open()} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          Change Avatar
                        </button>
                      )}
                    </CldUploadWidget>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* --- NEW: MOBILE NUMBER FIELD --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 dark:text-gray-400 font-medium">
                      +91
                    </span>
                    <input 
                      type="tel" 
                      placeholder="9876543210"
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Buyers will use this number to contact you about your listings.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address (Cannot be changed)</label>
                  <input
                    type="email"
                    disabled
                    value={session?.user?.email || ""}
                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isSavingProfile} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-70">
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: SECURITY & PASSWORD */}
            {activeTab === "security" && (
              <div className="space-y-12">
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">Change Password</h2>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 mb-6">
                    <p className="text-sm text-amber-800 dark:text-amber-400">
                      If you signed up using Google, you cannot change your password here.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isSavingPassword} className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold rounded-xl transition-all shadow-sm disabled:opacity-70">
                      {isSavingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>

                <DeleteAccountButton />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}