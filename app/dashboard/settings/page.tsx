"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Crown,
  Trash2,
  Save,
  Camera,
  Edit2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { authAPI } from "@/lib/api";

type SettingsSection = "profile" | "notifications" | "appearance" | "security" | "subscription" | "help";

export default function SettingsPage() {
  const { user, logout, setUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Profile form state
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  
  // Appearance settings
  const [darkMode, setDarkMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      const updatedUser = await authAPI.updateProfile({
        full_name: fullName,
        // Note: email changes may require verification in production
      });
      setUser(updatedUser);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Lock },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ] as const;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold font-heading text-foreground">Settings</h1>
        <p className="text-muted text-sm">Manage your account and preferences</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Settings Menu */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card variant="glass">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                      activeSection === item.id
                        ? "bg-gradient-to-r from-blue/20 to-red/20 text-foreground"
                        : "text-muted hover:text-foreground hover:bg-blue-light/10"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {activeSection === item.id && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
                
                <div className="pt-4 mt-4 border-t border-[rgba(255,255,255,0.05)]">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red hover:bg-red/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Content */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <Card variant="glass">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Profile Settings</h2>
                
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue to-red flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {user?.full_name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border-2 border-background flex items-center justify-center text-muted hover:text-foreground transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{user?.full_name || "Student"}</h3>
                    <p className="text-sm text-muted">{user?.email}</p>
                    <p className="text-xs text-blue mt-1">
                      {user?.subscription_tier === "free" ? "Free Plan" : "Premium Plan"}
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    leftIcon={<User className="w-5 h-5" />}
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-5 h-5" />}
                  />
                  
                  <Input
                    label="Phone Number (Optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="w-5 h-5" />}
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>

                <div className="flex justify-end mt-6">
                  <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <Card variant="glass">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <ToggleItem
                    label="Email Notifications"
                    description="Receive updates and reminders via email"
                    enabled={emailNotifications}
                    onToggle={() => setEmailNotifications(!emailNotifications)}
                  />
                  
                  <ToggleItem
                    label="Push Notifications"
                    description="Get notifications on your device"
                    enabled={pushNotifications}
                    onToggle={() => setPushNotifications(!pushNotifications)}
                  />
                  
                  <ToggleItem
                    label="Study Reminders"
                    description="Daily reminders to keep your streak going"
                    enabled={studyReminders}
                    onToggle={() => setStudyReminders(!studyReminders)}
                  />
                  
                  <ToggleItem
                    label="Weekly Progress Report"
                    description="Summary of your weekly learning progress"
                    enabled={weeklyReport}
                    onToggle={() => setWeeklyReport(!weeklyReport)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <Card variant="glass">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Appearance</h2>
                
                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <h3 className="font-medium text-foreground mb-3">Theme</h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setDarkMode(true)}
                        className={cn(
                          "flex-1 p-4 rounded-xl border-2 transition-all",
                          darkMode
                            ? "border-blue bg-blue/10"
                            : "border-transparent bg-card hover:border-muted/50"
                        )}
                      >
                        <Moon className="w-6 h-6 text-blue mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">Dark</p>
                      </button>
                      
                      <button
                        onClick={() => setDarkMode(false)}
                        className={cn(
                          "flex-1 p-4 rounded-xl border-2 transition-all",
                          !darkMode
                            ? "border-blue bg-blue/10"
                            : "border-transparent bg-card hover:border-muted/50"
                        )}
                      >
                        <Sun className="w-6 h-6 text-gold mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">Light</p>
                      </button>
                    </div>
                  </div>

                  {/* Sound Effects */}
                  <ToggleItem
                    label="Sound Effects"
                    description="Play sounds for actions and achievements"
                    enabled={soundEffects}
                    onToggle={() => setSoundEffects(!soundEffects)}
                    icon={soundEffects ? Volume2 : VolumeX}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <Card variant="glass">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Security</h2>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-card hover:bg-blue-light/10 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-blue" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Change Password</p>
                          <p className="text-sm text-muted">Update your account password</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted group-hover:text-foreground" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-card hover:bg-blue-light/10 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Two-Factor Authentication</p>
                          <p className="text-sm text-muted">Add an extra layer of security</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted/20 text-muted">Coming Soon</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-red/10 border border-red/20 hover:bg-red/20 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red/20 flex items-center justify-center">
                          <Trash2 className="w-5 h-5 text-red" />
                        </div>
                        <div>
                          <p className="font-medium text-red">Delete Account</p>
                          <p className="text-sm text-red/70">Permanently delete your account and data</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-red" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Section */}
          {activeSection === "subscription" && (
            <div className="space-y-6">
              {/* Current Plan */}
              <Card variant="glass">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Current Plan</h2>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue/20 to-red/20 border border-blue/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-foreground">
                            {user?.subscription_tier === "free" ? "Free Plan" : "Premium Plan"}
                          </span>
                          {user?.subscription_tier !== "free" && (
                            <Crown className="w-5 h-5 text-gold" />
                          )}
                        </div>
                        <p className="text-sm text-muted">
                          {user?.subscription_tier === "free"
                            ? "10 questions per week"
                            : "Unlimited questions & features"}
                        </p>
                      </div>
                      {user?.subscription_tier === "free" && (
                        <Button variant="primary">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Premium Features */}
              {user?.subscription_tier === "free" && (
                <Card variant="gradient" glow="blue">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-gold" />
                      Premium Features
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Unlimited AI questions per day",
                        "Full access to all mock exams",
                        "Personalized study plans",
                        "Detailed progress analytics",
                        "Priority support",
                        "No ads"
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 text-muted">
                          <div className="w-5 h-5 rounded-full bg-blue/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue text-xs">✓</span>
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="primary" className="w-full mt-6">
                      Upgrade to Premium - ₦2,500/month
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Help Section */}
          {activeSection === "help" && (
            <Card variant="glass">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Help & Support</h2>
                
                <div className="space-y-4">
                  {[
                    { title: "FAQ", description: "Frequently asked questions", icon: HelpCircle },
                    { title: "Contact Support", description: "Get help from our team", icon: Mail },
                    { title: "Report a Bug", description: "Let us know if something's wrong", icon: Shield },
                    { title: "Terms of Service", description: "Read our terms and conditions", icon: Globe },
                    { title: "Privacy Policy", description: "How we handle your data", icon: Lock },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-card hover:bg-blue-light/10 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-blue" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted">{item.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted group-hover:text-foreground" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-card text-center">
                  <p className="text-sm text-muted">The Stem Studio v1.0.0</p>
                  <p className="text-xs text-muted mt-1">Made with ❤️ for Nigerian Students</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Toggle Item Component
function ToggleItem({
  label,
  description,
  enabled,
  onToggle,
  icon: Icon
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="p-4 rounded-xl bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue" />
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{label}</p>
            <p className="text-sm text-muted">{description}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "w-12 h-6 rounded-full transition-colors relative",
            enabled ? "bg-blue" : "bg-muted/30"
          )}
        >
          <motion.div
            className="w-5 h-5 rounded-full bg-white absolute top-0.5"
            animate={{ left: enabled ? 26 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    </div>
  );
}

