import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Briefcase,
  CreditCard,
  Bell,
  ChevronRight,
  Upload,
  Building2,
  Save,
  Plus,
  Globe,
  Link as LinkIcon,
  Landmark,
  Smartphone,
  Linkedin,
  Twitter,
  Github
} from "lucide-react";
import { TagInput, SettingsToggle } from "./Common";

const SettingsPage = ({ mentorProfile, onSave }) => {
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(true);
  const [settingsTab, setSettingsTab] = useState("general");
  // Helper to safely access nested properties
  const getNestedVal = (obj, path, fallback) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj) || fallback;
  };

  const [profileSettings, setProfileSettings] = useState({
    displayName: mentorProfile.name || "Alex Chen",
    headline: mentorProfile.headline || mentorProfile.title || "Senior Engineer @ Google",
    bio: mentorProfile.bio || "Passionate about helping engineers crack their dream jobs.",
    hourlyRate: mentorProfile.pricePerSession || 150,
    skills: mentorProfile.expertise || ["System Design", "DSA", "React", "Node.js"],

    // Social Links
    socialLinks: {
      linkedin: getNestedVal(mentorProfile, "socialLinks.linkedin", ""),
      twitter: getNestedVal(mentorProfile, "socialLinks.twitter", ""),
      github: getNestedVal(mentorProfile, "socialLinks.github", ""),
      portfolio: getNestedVal(mentorProfile, "socialLinks.portfolio", ""),
    },

    // Payout Settings
    stripeConnected: getNestedVal(mentorProfile, "payoutSettings.stripeConnected", false),
    payoutMethod: getNestedVal(mentorProfile, "payoutSettings.method", "upi"), // 'upi' or 'bank'
    upiId: getNestedVal(mentorProfile, "payoutSettings.upiId", ""),
    bankDetails: {
      accountName: getNestedVal(mentorProfile, "payoutSettings.bankAccountName", ""),
      accountNumber: getNestedVal(mentorProfile, "payoutSettings.bankAccountNumber", ""),
      ifsc: getNestedVal(mentorProfile, "payoutSettings.bankIfsc", ""),
    },

    notifications: {
      sms: getNestedVal(mentorProfile, "notifications.sms", true),
      email: getNestedVal(mentorProfile, "notifications.email", true),
      marketing: getNestedVal(mentorProfile, "notifications.marketing", false),
    },
  });

  // Sync state with props when mentorProfile loads/updates
  React.useEffect(() => {
    if (mentorProfile && Object.keys(mentorProfile).length > 0) {
      setProfileSettings(prev => ({
        ...prev,
        displayName: mentorProfile.name || prev.displayName,
        headline: mentorProfile.headline || mentorProfile.title || prev.headline,
        bio: mentorProfile.bio || prev.bio,
        hourlyRate: mentorProfile.pricePerSession || prev.hourlyRate,
        skills: mentorProfile.expertise || prev.skills,
        socialLinks: {
          linkedin: getNestedVal(mentorProfile, "socialLinks.linkedin", prev.socialLinks.linkedin),
          twitter: getNestedVal(mentorProfile, "socialLinks.twitter", prev.socialLinks.twitter),
          github: getNestedVal(mentorProfile, "socialLinks.github", prev.socialLinks.github),
          portfolio: getNestedVal(mentorProfile, "socialLinks.portfolio", prev.socialLinks.portfolio),
        },
        stripeConnected: getNestedVal(mentorProfile, "payoutSettings.stripeConnected", prev.stripeConnected),
        payoutMethod: getNestedVal(mentorProfile, "payoutSettings.method", prev.payoutMethod),
        upiId: getNestedVal(mentorProfile, "payoutSettings.upiId", prev.upiId),
        bankDetails: {
          accountName: getNestedVal(mentorProfile, "payoutSettings.bankAccountName", prev.bankDetails.accountName),
          accountNumber: getNestedVal(mentorProfile, "payoutSettings.bankAccountNumber", prev.bankDetails.accountNumber),
          ifsc: getNestedVal(mentorProfile, "payoutSettings.bankIfsc", prev.bankDetails.ifsc),
        },
        notifications: {
          sms: getNestedVal(mentorProfile, "notifications.sms", prev.notifications.sms),
          email: getNestedVal(mentorProfile, "notifications.email", prev.notifications.email),
          marketing: getNestedVal(mentorProfile, "notifications.marketing", prev.notifications.marketing),
        },
      }));
    }
  }, [mentorProfile]); // Depend on mentorProfile

  const handleSave = () => {
    onSave(profileSettings);
  };


  return (
    <div className="flex gap-6 h-full">
      {/* Settings Navigation */}
      <motion.div
        initial={false}
        animate={{ width: settingsSidebarOpen ? 240 : 60 }}
        className="flex-shrink-0"
      >
        <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-2 h-full flex flex-col justify-between">
          <div className="space-y-1">
            {[
              { id: "general", label: "General", icon: User },
              { id: "social", label: "Social Presence", icon: Globe },
              { id: "expertise", label: "Expertise", icon: Briefcase },
              { id: "payouts", label: "Payouts", icon: CreditCard },
              { id: "notifications", label: "Notifications", icon: Bell },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer overflow-hidden whitespace-nowrap ${!settingsSidebarOpen && "justify-center px-0"
                  } ${settingsTab === tab.id
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200"
                  }`}
                title={!settingsSidebarOpen ? tab.label : undefined}
              >
                <tab.icon size={16} className="flex-shrink-0" />
                {settingsSidebarOpen && <span>{tab.label}</span>}
              </button>
            ))}
          </div>

          {/* Footer Toggle */}
          <div className="pt-2 mt-2 border-t border-white/5">
            <button
              onClick={() => setSettingsSidebarOpen(!settingsSidebarOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-400 rounded-lg transition-colors cursor-pointer ${!settingsSidebarOpen && "justify-center"
                }`}
            >
              <div className={`transition-transform duration-300 ${!settingsSidebarOpen && "rotate-180"}`}>
                <ChevronRight size={14} className="rotate-180" />
              </div>
              {settingsSidebarOpen && <span>Collapse Menu</span>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {/* GENERAL PANEL */}
          {settingsTab === "general" && (
            <motion.div
              key="general-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold text-white">Identity</h3>

              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white text-2xl font-bold">
                  {profileSettings.displayName?.[0] || "M"}
                </div>
                <div className="flex-1">
                  <button className="px-4 py-2 border border-dashed border-white/20 rounded-lg text-zinc-400 text-sm hover:border-emerald-500/30 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-2">
                    <Upload size={16} />
                    Upload New Photo
                  </button>
                  <p className="text-xs text-zinc-600 mt-2">JPG, PNG under 2MB</p>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Display Name</label>
                <input
                  type="text"
                  value={profileSettings.displayName}
                  onChange={(e) => setProfileSettings({ ...profileSettings, displayName: e.target.value })}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Headline</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={profileSettings.headline}
                    onChange={(e) => setProfileSettings({ ...profileSettings, headline: e.target.value })}
                    placeholder="e.g., Senior Engineer @ Google"
                    className="w-full bg-[#111] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-colors placeholder-zinc-600"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Bio</label>
                <textarea
                  value={profileSettings.bio}
                  onChange={(e) => setProfileSettings({ ...profileSettings, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-colors resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <Save size={16} /> Save Changes
              </button>
            </motion.div>
          )}

          {/* Social Links Panel */}
          {settingsTab === "social" && (
            <motion.div
              key="social"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-2xl"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Social Links</h2>
                <p className="text-zinc-400 text-sm">
                  Manage your social presence and portfolio links.
                </p>
              </div>

              <div className="space-y-4">
                {/* LinkedIn */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Linkedin size={16} className="text-[#0077b5]" />
                    LinkedIn Profile
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
                      <LinkIcon size={16} />
                    </div>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={profileSettings.socialLinks.linkedin}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        socialLinks: { ...profileSettings.socialLinks, linkedin: e.target.value }
                      })}
                      className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-all placeholder-zinc-600"
                    />
                  </div>
                </div>

                {/* Twitter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Twitter size={16} className="text-[#1da1f2]" />
                    Twitter Handle / URL
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
                      <LinkIcon size={16} />
                    </div>
                    <input
                      type="url"
                      placeholder="https://twitter.com/username"
                      value={profileSettings.socialLinks.twitter}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        socialLinks: { ...profileSettings.socialLinks, twitter: e.target.value }
                      })}
                      className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-all placeholder-zinc-600"
                    />
                  </div>
                </div>

                {/* GitHub */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Github size={16} className="text-white" />
                    GitHub Profile
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
                      <LinkIcon size={16} />
                    </div>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={profileSettings.socialLinks.github}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        socialLinks: { ...profileSettings.socialLinks, github: e.target.value }
                      })}
                      className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-all placeholder-zinc-600"
                    />
                  </div>
                </div>

                {/* Portfolio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Globe size={16} className="text-emerald-400" />
                    Portfolio Website
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
                      <LinkIcon size={16} />
                    </div>
                    <input
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={profileSettings.socialLinks.portfolio}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        socialLinks: { ...profileSettings.socialLinks, portfolio: e.target.value }
                      })}
                      className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-all placeholder-zinc-600"
                    />
                  </div>
                </div>

              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/20 cursor-pointer"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}

          {/* EXPERTISE PANEL */}
          {settingsTab === "expertise" && (
            <motion.div
              key="expertise-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold text-white">Expertise & Economics</h3>

              {/* Hourly Rate */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Hourly Rate</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xl">$</span>
                  <input
                    type="number"
                    value={profileSettings.hourlyRate}
                    onChange={(e) => setProfileSettings({ ...profileSettings, hourlyRate: Number(e.target.value) })}
                    className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-16 py-4 text-white text-2xl font-bold font-mono outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">/hr</span>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Skills</label>
                <TagInput
                  tags={profileSettings.skills}
                  onTagsChange={(newTags) => setProfileSettings({ ...profileSettings, skills: newTags })}
                  placeholder="Type a skill and press Enter"
                />
                <p className="text-xs text-zinc-600">Add your core interview expertise areas</p>
              </div>

              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <Save size={16} /> Save Changes
              </button>
            </motion.div>
          )}

          {/* PAYOUTS PANEL */}
          {settingsTab === "payouts" && (
            <motion.div
              key="payouts-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold text-white">Payout Settings</h3>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setProfileSettings({ ...profileSettings, payoutMethod: "upi" })}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-colors text-sm font-medium cursor-pointer ${profileSettings.payoutMethod === "upi"
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                    : "bg-[#111] border-white/10 text-zinc-400 hover:bg-white/5"
                    }`}
                >
                  <Smartphone size={24} />
                  UPI ID
                </button>
                <button
                  onClick={() => setProfileSettings({ ...profileSettings, payoutMethod: "bank" })}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-colors text-sm font-medium cursor-pointer ${profileSettings.payoutMethod === "bank"
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                    : "bg-[#111] border-white/10 text-zinc-400 hover:bg-white/5"
                    }`}
                >
                  <Landmark size={24} />
                  Bank Transfer
                </button>
              </div>

              {/* UPI Inputs */}
              {profileSettings.payoutMethod === "upi" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 bg-[#111] p-5 rounded-xl border border-white/10"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">UPI ID / VPA</label>
                    <input
                      type="text"
                      placeholder="example@okaxis"
                      value={profileSettings.upiId}
                      onChange={(e) => setProfileSettings({ ...profileSettings, upiId: e.target.value })}
                      className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                    />
                    <p className="text-xs text-zinc-500">Payments will be sent to this ID directly.</p>
                  </div>
                </motion.div>
              )}

              {/* Bank Inputs */}
              {profileSettings.payoutMethod === "bank" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 bg-[#111] p-5 rounded-xl border border-white/10"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="As per bank records"
                      value={profileSettings.bankDetails.accountName}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        bankDetails: { ...profileSettings.bankDetails, accountName: e.target.value }
                      })}
                      className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Account Number</label>
                      <input
                        type="text"
                        value={profileSettings.bankDetails.accountNumber}
                        onChange={(e) => setProfileSettings({
                          ...profileSettings,
                          bankDetails: { ...profileSettings.bankDetails, accountNumber: e.target.value }
                        })}
                        className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="SBIN000...."
                        value={profileSettings.bankDetails.ifsc}
                        onChange={(e) => setProfileSettings({
                          ...profileSettings,
                          bankDetails: { ...profileSettings.bankDetails, ifsc: e.target.value.toUpperCase() }
                        })}
                        className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-emerald-500/50 font-mono uppercase"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <Save size={16} /> Save Payout Settings
              </button>
            </motion.div>
          )}

          {/* NOTIFICATIONS PANEL */}
          {settingsTab === "notifications" && (
            <motion.div
              key="notifications-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>

              <SettingsToggle
                label="SMS Reminders"
                description="Get text messages 30 min before sessions"
                enabled={profileSettings.notifications.sms}
                onChange={(val) => setProfileSettings({
                  ...profileSettings,
                  notifications: { ...profileSettings.notifications, sms: val }
                })}
              />
              <SettingsToggle
                label="Email Alerts"
                description="Session bookings and payment notifications"
                enabled={profileSettings.notifications.email}
                onChange={(val) => setProfileSettings({
                  ...profileSettings,
                  notifications: { ...profileSettings.notifications, email: val }
                })}
              />
              <SettingsToggle
                label="Marketing"
                description="Tips, platform updates, and promotions"
                enabled={profileSettings.notifications.marketing}
                onChange={(val) => setProfileSettings({
                  ...profileSettings,
                  notifications: { ...profileSettings.notifications, marketing: val }
                })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsPage;
