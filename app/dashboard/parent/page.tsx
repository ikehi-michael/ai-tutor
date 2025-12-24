"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  BookOpen,
  Brain,
  Target,
  Calendar,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Award,
  BarChart3,
  PieChart,
  Eye,
  MessageSquare,
  Settings,
  Plus,
  User,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { dashboardAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { ChildProgress } from "@/components/parent/ChildProgress";
import { ChildActivity } from "@/components/parent/ChildActivity";
import { ChildReports } from "@/components/parent/ChildReports";

// Sample children data (fallback for demo/when API not available)
const SAMPLE_CHILDREN = [
  {
    id: 1,
    name: "Adaeze Okonkwo",
    grade: "SS3",
    avatar: "A",
    lastActive: "2 hours ago",
    streak: 5,
    weeklyProgress: 78,
    subjects: [
      { name: "Mathematics", accuracy: 85, trend: "up" },
      { name: "Physics", accuracy: 72, trend: "up" },
      { name: "Chemistry", accuracy: 58, trend: "down" },
      { name: "Biology", accuracy: 90, trend: "up" },
      { name: "English", accuracy: 76, trend: "neutral" },
    ],
    weeklyActivity: [
      { day: "Mon", hours: 3 },
      { day: "Tue", hours: 2 },
      { day: "Wed", hours: 4 },
      { day: "Thu", hours: 3 },
      { day: "Fri", hours: 2 },
      { day: "Sat", hours: 5 },
      { day: "Sun", hours: 1 },
    ],
    weakTopics: [
      { subject: "Chemistry", topic: "Organic Chemistry" },
      { subject: "Physics", topic: "Electromagnetic Induction" },
    ],
    recentActivity: [
      { type: "question", subject: "Mathematics", topic: "Quadratic Equations", time: "2 hours ago" },
      { type: "exam", subject: "Physics", score: 72, time: "Yesterday" },
      { type: "lesson", subject: "Chemistry", topic: "Chemical Bonding", time: "2 days ago" },
    ],
    stats: {
      totalQuestions: 234,
      studyHours: 32,
      examsCompleted: 8,
      averageScore: 76
    }
  },
  {
    id: 2,
    name: "Chidi Okonkwo",
    grade: "SS1",
    avatar: "C",
    lastActive: "1 day ago",
    streak: 2,
    weeklyProgress: 45,
    subjects: [
      { name: "Mathematics", accuracy: 68, trend: "neutral" },
      { name: "Physics", accuracy: 55, trend: "down" },
      { name: "Chemistry", accuracy: 62, trend: "up" },
      { name: "Biology", accuracy: 75, trend: "up" },
      { name: "English", accuracy: 80, trend: "up" },
    ],
    weeklyActivity: [
      { day: "Mon", hours: 1 },
      { day: "Tue", hours: 2 },
      { day: "Wed", hours: 0 },
      { day: "Thu", hours: 1 },
      { day: "Fri", hours: 0 },
      { day: "Sat", hours: 2 },
      { day: "Sun", hours: 0 },
    ],
    weakTopics: [
      { subject: "Physics", topic: "Motion & Forces" },
      { subject: "Mathematics", topic: "Trigonometry" },
      { subject: "Chemistry", topic: "Atomic Structure" },
    ],
    recentActivity: [
      { type: "lesson", subject: "English", topic: "Essay Writing", time: "1 day ago" },
      { type: "question", subject: "Biology", topic: "Cell Division", time: "2 days ago" },
    ],
    stats: {
      totalQuestions: 89,
      studyHours: 12,
      examsCompleted: 3,
      averageScore: 65
    }
  }
];

type View = "loading" | "overview" | "child-detail";

// Type for children data (from API or sample)
type ChildData = typeof SAMPLE_CHILDREN[0];

export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const [view, setView] = useState<View>("loading");
  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [activeTab, setActiveTab] = useState<"progress" | "activity" | "reports">("progress");
  const [error, setError] = useState<string | null>(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [childEmail, setChildEmail] = useState("");
  const [isLinkingChild, setIsLinkingChild] = useState(false);

  // Redirect students away from parent dashboard
  useEffect(() => {
    if (isInitialized && user?.role === "student") {
      router.push("/dashboard");
    }
  }, [isInitialized, user, router]);

  // Fetch children data on mount (only for parents)
  useEffect(() => {
    if (isInitialized && user?.role === "parent") {
      fetchChildrenData();
    }
  }, [isInitialized, user]);

  const transformChildData = (apiChild: any): ChildData => {
    // Format last active time
    const formatLastActive = (date: string | null) => {
      if (!date) return "Never";
      const lastActiveDate = new Date(date);
      const now = new Date();
      const diffMs = now.getTime() - lastActiveDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    };

    // Get avatar initial
    const avatar = apiChild.name?.charAt(0).toUpperCase() || "?";

    // Calculate weekly progress (based on study minutes - assume 2 hours/day goal = 14 hours/week)
    const weeklyHours = (apiChild.stats?.weekly_study_minutes || 0) / 60;
    const weeklyProgress = Math.min(100, Math.round((weeklyHours / 14) * 100));

    // Get subjects from API response
    const subjects = (apiChild.subjects || []).map((subj: any) => ({
      name: subj.subject,
      accuracy: Math.round(subj.accuracy || 0),
      trend: "neutral" as const // Could be enhanced with trend calculation
    }));

    // If no subjects, add placeholder
    if (subjects.length === 0) {
      subjects.push(
        { name: "Mathematics", accuracy: 0, trend: "neutral" as const },
        { name: "Physics", accuracy: 0, trend: "neutral" as const },
        { name: "Chemistry", accuracy: 0, trend: "neutral" as const }
      );
    }

    // Calculate streak (we'll need to enhance API for this, for now use 0)
    const streak = 0;

    // Weekly activity (placeholder - would need API enhancement)
    const weeklyActivity = [
      { day: "Mon", hours: 0 },
      { day: "Tue", hours: 0 },
      { day: "Wed", hours: 0 },
      { day: "Thu", hours: 0 },
      { day: "Fri", hours: 0 },
      { day: "Sat", hours: 0 },
      { day: "Sun", hours: 0 },
    ];

    // Weak topics from weak_subjects
    const weakTopics = apiChild.weak_subjects?.map((ws: any) => ({
      subject: ws.subject,
      topic: `${ws.subject} Fundamentals` // Placeholder topic
    })) || [];

    // Recent activity (placeholder - would need API enhancement)
    const recentActivity: any[] = [];

    return {
      id: apiChild.child_id,
      name: apiChild.name,
      grade: apiChild.class || "SS1",
      avatar,
      lastActive: formatLastActive(apiChild.last_active),
      streak,
      weeklyProgress,
      subjects,
      weeklyActivity,
      weakTopics,
      recentActivity,
      stats: {
        totalQuestions: apiChild.stats?.total_questions || 0,
        studyHours: Math.round((apiChild.stats?.weekly_study_minutes || 0) / 60),
        examsCompleted: apiChild.stats?.recent_exam_scores?.length || 0,
        averageScore: Math.round(apiChild.stats?.average_score || 0)
      }
    };
  };

  const fetchChildrenData = async () => {
    setView("loading");
    try {
      const data = await dashboardAPI.getParentDashboard();
      // Transform API data to match our component structure
      if (data && data.children && Array.isArray(data.children)) {
        const transformedChildren = data.children.map(transformChildData);
        setChildren(transformedChildren);
      } else {
        // Use sample data if API doesn't return expected format
        setChildren(SAMPLE_CHILDREN);
      }
      setView("overview");
    } catch (err: any) {
      // Fallback to sample data for demo purposes
      console.log("Using sample data:", err.message);
      setChildren(SAMPLE_CHILDREN);
      setView("overview");
    }
  };

  const handleLinkChild = async () => {
    if (!childEmail.trim()) {
      setError("Please enter your child's email address");
      return;
    }

    setIsLinkingChild(true);
    setError(null);

    try {
      await dashboardAPI.linkChild(childEmail.trim());
      setShowAddChildModal(false);
      setChildEmail("");
      // Refresh children list
      await fetchChildrenData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to link child. Please try again.");
    } finally {
      setIsLinkingChild(false);
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

  // Calculate totals across all children
  const totalStudyHours = children.reduce((acc, child) => acc + child.stats.studyHours, 0);
  const totalQuestions = children.reduce((acc, child) => acc + child.stats.totalQuestions, 0);
  const averageProgress = children.length > 0 
    ? Math.round(children.reduce((acc, child) => acc + child.weeklyProgress, 0) / children.length)
    : 0;

  // Don't render if user is a student (will be redirected)
  if (isInitialized && user?.role === "student") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue animate-spin mb-4" />
        <p className="text-muted">Redirecting...</p>
      </div>
    );
  }

  // Loading view
  if (view === "loading" || !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue animate-spin mb-4" />
        <p className="text-muted">Loading children data...</p>
      </div>
    );
  }

  // View child details
  const viewChildDetails = (child: ChildData) => {
    setSelectedChild(child);
    setView("child-detail");
  };

  // Overview View
  if (view === "overview") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Parent Dashboard</h1>
            <p className="text-muted text-sm">Monitor your children's learning progress</p>
          </div>
          <Button variant="secondary" onClick={() => setShowAddChildModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Child
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="gradient">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-blue" />
              </div>
              <p className="text-2xl font-bold text-foreground">{children.length}</p>
              <p className="text-xs text-muted">Children</p>
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-red/20 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-red" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalStudyHours}h</p>
              <p className="text-xs text-muted">Study Hours</p>
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center mx-auto mb-2">
                <Brain className="w-5 h-5 text-gold" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalQuestions}</p>
              <p className="text-xs text-muted">Questions Solved</p>
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">{averageProgress}%</p>
              <p className="text-xs text-muted">Avg Progress</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Children Cards */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Children</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {children.map((child) => (
              <Card key={child.id} variant="glass" hover className="cursor-pointer" onClick={() => viewChildDetails(child)}>
                <CardContent className="p-6">
                  {/* Child Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue to-red flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{child.avatar}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{child.name}</h3>
                        <p className="text-sm text-muted">{child.grade} • Last active {child.lastActive}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Flame className="w-4 h-4 text-gold" />
                          <span className="text-xs text-gold font-medium">{child.streak} day streak</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted" />
                  </div>

                  {/* Weekly Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted">Weekly Goal Progress</span>
                      <span className={cn(
                        "font-medium",
                        child.weeklyProgress >= 70 ? "text-blue" : 
                        child.weeklyProgress >= 50 ? "text-gold" : "text-red"
                      )}>
                        {child.weeklyProgress}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-card overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          child.weeklyProgress >= 70 ? "bg-gradient-to-r from-blue to-blue-light" :
                          child.weeklyProgress >= 50 ? "bg-gradient-to-r from-gold to-amber-400" :
                          "bg-gradient-to-r from-red to-red-light"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${child.weeklyProgress}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>

                  {/* Subject Performance Summary */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(child.subjects || []).slice(0, 3).map((subject) => (
                      <div
                        key={subject.name}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                          subject.accuracy >= 70 ? "bg-blue/20 text-blue" :
                          subject.accuracy >= 50 ? "bg-gold/20 text-gold" :
                          "bg-red/20 text-red"
                        )}
                      >
                        {subject.name.slice(0, 4)}: {subject.accuracy}%
                        {subject.trend === "up" && <TrendingUp className="w-3 h-3" />}
                        {subject.trend === "down" && <TrendingDown className="w-3 h-3" />}
                      </div>
                    ))}
                  </div>

                  {/* Alerts */}
                  {child.weakTopics && child.weakTopics.length > 0 && (
                    <div className="p-3 rounded-xl bg-red/10 border border-red/20">
                      <div className="flex items-center gap-2 text-red text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Needs attention:</span>
                        <span>{child.weakTopics[0].subject} - {child.weakTopics[0].topic}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Add Child Modal */}
        {showAddChildModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowAddChildModal(false);
              setChildEmail("");
              setError(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full border border-[rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">Add Child</h3>
                <button
                  onClick={() => {
                    setShowAddChildModal(false);
                    setChildEmail("");
                    setError(null);
                  }}
                  className="text-muted hover:text-foreground transition-colors"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <p className="text-muted text-sm mb-6">
                Enter your child's email address to link their account. They must have already registered as a student.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red/10 border border-red/20">
                  <p className="text-sm text-red">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Child's Email Address
                  </label>
                  <input
                    type="email"
                    value={childEmail}
                    onChange={(e) => setChildEmail(e.target.value)}
                    placeholder="child@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-card border border-[rgba(255,255,255,0.1)] text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue"
                    disabled={isLinkingChild}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !isLinkingChild) {
                        handleLinkChild();
                      }
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowAddChildModal(false);
                      setChildEmail("");
                      setError(null);
                    }}
                    disabled={isLinkingChild}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleLinkChild}
                    disabled={isLinkingChild || !childEmail.trim()}
                  >
                    {isLinkingChild ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Link Child
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Child Detail View
  if (view === "child-detail" && selectedChild) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <button
            onClick={() => setView("overview")}
            className="p-2 rounded-lg bg-card hover:bg-blue-light/20 text-muted hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue to-red flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{selectedChild.avatar}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground">{selectedChild.name}</h1>
              <p className="text-muted text-sm">{selectedChild.grade} • Last active {selectedChild.lastActive}</p>
            </div>
          </div>
          {/* <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div> */}
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="gradient">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{selectedChild.stats.totalQuestions}</p>
              <p className="text-xs text-muted">Questions Solved</p>
            </CardContent>
          </Card>
          <Card variant="gradient">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{selectedChild.stats.studyHours}h</p>
              <p className="text-xs text-muted">Study Hours</p>
            </CardContent>
          </Card>
          <Card variant="gradient">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{selectedChild.stats.examsCompleted}</p>
              <p className="text-xs text-muted">Mock Exams</p>
            </CardContent>
          </Card>
          <Card variant="gradient">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{selectedChild.stats.averageScore}%</p>
              <p className="text-xs text-muted">Average Score</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants}>
          <div className="flex gap-2 border-b border-[rgba(255,255,255,0.05)] pb-2">
            {(["progress", "activity", "reports"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue to-red text-white"
                    : "text-muted hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === "progress" && (
          <ChildProgress child={selectedChild} itemVariants={itemVariants} />
        )}

        {activeTab === "activity" && (
          <ChildActivity activities={selectedChild.recentActivity} itemVariants={itemVariants} />
        )}

        {activeTab === "reports" && (
          <ChildReports itemVariants={itemVariants} />
        )}
      </motion.div>
    );
  }

  return null;
}

