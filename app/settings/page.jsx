"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
  Bell, Lock, User, Globe, Moon, Sun, Shield, 
  CheckCircle, Loader2, Save, Eye, EyeOff,
  Mail, Phone, MapPin, CreditCard
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    city: ""
  });
  
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    marketingEmails: false,
    testDriveReminders: true
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setProfile({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        city: userData.city || ""
      });
    }
  }, []);

  const handleProfileSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaved(true);
    setPasswords({ current: "", new: "", confirm: "" });
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen" style={{
      background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #e0f7fa 100%)"
    }}>
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00bcd4] to-[#0097a7] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Settings size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-500">Manage your account preferences</p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="fixed top-20 right-5 glass-card px-4 py-3 flex items-center gap-2 z-50 animate-in slide-in-from-top-2">
            <CheckCircle size={18} className="text-green-500" />
            <span className="text-sm text-gray-700">Settings saved successfully!</span>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="glass-card p-4 h-fit">
            <div className="space-y-1">
              {[
                { icon: User, label: "Profile", active: true },
                { icon: Lock, label: "Password", active: false },
                { icon: Bell, label: "Notifications", active: false },
                { icon: Globe, label: "Preferences", active: false },
              ].map((item, idx) => (
                <button key={idx} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active ? "bg-gradient-to-r from-[#00bcd4]/10 to-[#0097a7]/10 text-[#0097a7] border-l-2 border-[#00bcd4]" : "text-gray-600 hover:bg-white/50"}`}>
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Section */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-[#0097a7]" /> Profile Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#00bcd4] focus:outline-none bg-white/70" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#00bcd4] focus:outline-none bg-white/70" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#00bcd4] focus:outline-none bg-white/70" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#00bcd4] focus:outline-none bg-white/70" />
                </div>
              </div>
              <button onClick={handleProfileSave} disabled={loading} className="mt-5 px-6 py-2 rounded-xl bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg transition">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Password Section */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Lock size={20} className="text-[#0097a7]" /> Change Password
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#00bcd4] focus:outline-none bg-white/70 pr-10" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#00bcd4] focus:outline-none bg-white/70" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#00bcd4] focus:outline-none bg-white/70" />
                </div>
              </div>
              <button onClick={handlePasswordChange} disabled={loading} className="mt-5 px-6 py-2 rounded-xl bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg transition">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Update Password
              </button>
            </div>

            {/* Notifications Section */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-[#0097a7]" /> Notification Preferences
              </h2>
              <div className="space-y-3">
                {[
                  { key: "emailAlerts", label: "Email Alerts", desc: "Receive email notifications about your activity" },
                  { key: "smsAlerts", label: "SMS Alerts", desc: "Get text messages for important updates" },
                  { key: "marketingEmails", label: "Marketing Emails", desc: "Receive offers and promotions" },
                  { key: "testDriveReminders", label: "Test Drive Reminders", desc: "Reminders for scheduled test drives" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-700 text-sm">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <button onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key]})} className={`w-10 h-5 rounded-full transition-all ${notifications[item.key] ? "bg-[#00bcd4]" : "bg-gray-300"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-all mt-0.5 ${notifications[item.key] ? "ml-5" : "ml-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}