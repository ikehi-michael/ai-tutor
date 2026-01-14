"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  BookOpen,
  Brain,
  Trophy,
  Flame,
  Calendar,
  ChevronRight,
  BarChart3,
  Activity,
  Award,
  Star,
  Zap,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { dashboardAPI, StudentDashboard, ProgressChart } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

// Achievement definitions
const ACHIEVEMENTS = [
  { name: "First Question", description: "Solved your first question", icon: Star, threshold: 1 },
  { name: "Week Warrior", description: "Studied 7 days in a row", icon: Flame, threshold: 7 },
  { name: "Century", description: "Solved 100 questions", icon: Trophy, threshold: 100 },
  { name: "Speed Demon", description: "Complete 50 questions in one day", icon: Zap, threshold: 50 },
  { name: "Master", description: "Reach 90% accuracy", icon: Award, threshold: 90 },
];

// Weak topic placeholder
const WEAK_TOPICS = [
  { subject: "Physics", topic: "Electromagnetic Induction", accuracy: 45 },
  { subject: "Chemistry", topic: "Organic Chemistry", accuracy: 52 },
  { subject: "Mathematics", topic: "Integration", accuracy: 58 },
];

type TimeRange = "week" | "month" | "all";

export default function ProgressPage() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<StudentDashboard | null>(null);
  const [progressChart, setProgressChart] = useState<ProgressChart | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchProgressData();
  }, [timeRange]);

  const fetchProgressData = async () => {
    setIsLoading(true);
    try {
      const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
      const [dashboard, chart] = await Promise.all([
        dashboardAPI.getStudentOverview(),
        dashboardAPI.getProgressChart(days)
      ]);
      setDashboardData(dashboard);
      setProgressChart(chart);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load progress data");
    } finally {
      setIsLoading(false);
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

  // Calculate overall accuracy from subjects
  const calculateOverallAccuracy = () => {
    if (!dashboardData?.subject_performance.length) return 0;
    const totalAccuracy = dashboardData.subject_performance.reduce((acc, s) => acc + (s.accuracy || 0), 0);
    return Math.round(totalAccuracy / dashboardData.subject_performance.length);
  };

  // Check if achievement is earned
  const isAchievementEarned = (achievement: typeof ACHIEVEMENTS[0]) => {
    if (!dashboardData) return false;
    if (achievement.name === "First Question") return dashboardData.stats.total_questions_solved >= 1;
    if (achievement.name === "Week Warrior") return dashboardData.stats.study_streak_days >= 7;
    if (achievement.name === "Century") return dashboardData.stats.total_questions_solved >= 100;
    if (achievement.name === "Master") return calculateOverallAccuracy() >= 90;
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue animate-spin mb-4" />
        <p className="text-muted">Loading your progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red mb-4">{error}</p>
        <Button variant="secondary" onClick={fetchProgressData}>Try Again</Button>
      </div>
    );
  }

  const overallAccuracy = calculateOverallAccuracy();

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
          <h1 className="text-2xl font-bold font-heading text-foreground">Progress</h1>
          <p className="text-muted text-sm">Track your learning journey</p>
        </div>
        <div className="flex gap-2">
          {(["week", "month", "all"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                timeRange === range
                  ? "bg-gradient-to-r from-blue to-red text-white"
                  : "bg-card text-muted hover:text-foreground"
              )}
            >
              {range === "all" ? "All Time" : `This ${range}`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card variant="gradient">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-blue-light" />
            </div>
            <p className="text-2xl font-bold text-foreground">{overallAccuracy}%</p>
            <p className="text-xs text-muted">Accuracy</p>
          </CardContent>
        </Card>

        <Card variant="gradient">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-red/20 flex items-center justify-center mx-auto mb-2">
              <Brain className="w-5 h-5 text-red" />
            </div>
            <p className="text-2xl font-bold text-foreground">{dashboardData?.stats.total_questions_solved || 0}</p>
            <p className="text-xs text-muted">Questions</p>
          </CardContent>
        </Card>

        <Card variant="gradient">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-gold" />
            </div>
            <p className="text-2xl font-bold text-foreground">{dashboardData?.stats.questions_this_week || 0}</p>
            <p className="text-xs text-muted">This Week</p>
          </CardContent>
        </Card>

        <Card variant="gradient">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">{dashboardData?.stats.study_streak_days || 0}</p>
            <p className="text-xs text-muted">Day Streak</p>
          </CardContent>
        </Card>

        <Card variant="gradient">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">{dashboardData?.stats.total_exams_taken || 0}</p>
            <p className="text-xs text-muted">Exams</p>
          </CardContent>
        </Card>

        <Card variant="gradient">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">{dashboardData?.stats.average_exam_score || 0}%</p>
            <p className="text-xs text-muted">Avg Score</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue" />
                  Subject Performance
                </h3>
              </div>

              {dashboardData?.subject_performance && dashboardData.subject_performance.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.subject_performance.map((subject, index) => (
                    <div key={subject.subject}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{subject.subject}</span>
                        </div>
                        <span className={cn(
                          "text-sm font-bold",
                          subject.accuracy >= 80 ? "text-blue" :
                          subject.accuracy >= 60 ? "text-gold" : "text-red"
                        )}>
                          {subject.accuracy || 0}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-card overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            subject.accuracy >= 80 ? "bg-gradient-to-r from-blue to-blue-light" :
                            subject.accuracy >= 60 ? "bg-gradient-to-r from-gold to-amber-400" :
                            "bg-gradient-to-r from-red to-red-light"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.accuracy || 0}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                      <p className="text-xs text-muted mt-1">{subject.questions_attempted} questions attempted</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
                  <p className="text-muted">Start solving questions to see your performance!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Chart */}
        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red" />
                  {timeRange === "week" ? "Weekly" : timeRange === "month" ? "Monthly" : "Yearly"} Activity
                </h3>
              </div>

              {progressChart?.data && progressChart.data.length > 0 ? (
                <div className="relative h-40 flex items-end justify-between gap-1">
                  {progressChart.data.slice(-7).map((day, index) => {
                    const maxQuestions = Math.max(...progressChart.data.map(d => d.questions_solved), 1);
                    const heightPercent = maxQuestions > 0 ? (day.questions_solved / maxQuestions) * 100 : 0;
                    const heightPx = (heightPercent / 100) * 160; // 160px is h-40
                    const date = new Date(day.date);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center h-full">
                        <div className="flex-1 flex items-end w-full">
                          <motion.div
                            className={cn(
                              "w-full rounded-t-lg min-h-[4px]",
                              day.questions_solved > 0 ? "bg-gradient-to-t from-blue to-blue-light" : "bg-muted/20"
                            )}
                            initial={{ height: 0 }}
                            animate={{ height: day.questions_solved > 0 ? `${heightPx}px` : "4px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          />
                        </div>
                        <span className="text-xs text-muted mt-2">{dayName}</span>
                        <span className="text-xs text-foreground font-medium">{day.questions_solved}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted mx-auto mb-4" />
                  <p className="text-muted">No activity data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weak Topics & Achievements */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weak Topics */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" glow="red">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5 text-red" />
                  Focus Areas
                </h3>
                <Button variant="ghost" size="sm">
                  Practice All
                </Button>
              </div>

              {dashboardData?.weakest_subject ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-red/10 border border-red/20">
                    <p className="text-xs text-muted mb-1">Weakest Subject</p>
                    <p className="font-medium text-foreground">{dashboardData.weakest_subject}</p>
                  </div>
                  <p className="text-xs text-muted text-center mt-4">
                    Practice more questions in this subject to improve
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-10 h-10 text-blue mx-auto mb-2" />
                  <p className="text-muted">Keep practicing to identify weak areas!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold" />
                  Achievements
                </h3>
                <span className="text-sm text-muted">
                  {ACHIEVEMENTS.filter(a => isAchievementEarned(a)).length}/{ACHIEVEMENTS.length} earned
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {ACHIEVEMENTS.map((achievement, index) => {
                  const earned = isAchievementEarned(achievement);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-xl transition-all",
                        earned
                          ? "bg-gradient-to-br from-gold/20 to-amber-500/10 border border-gold/20"
                          : "bg-card opacity-50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center mb-2",
                        earned ? "bg-gold/20" : "bg-muted/20"
                      )}>
                        <achievement.icon className={cn(
                          "w-5 h-5",
                          earned ? "text-gold" : "text-muted"
                        )} />
                      </div>
                      <p className={cn(
                        "font-medium text-sm",
                        earned ? "text-foreground" : "text-muted"
                      )}>
                        {achievement.name}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {earned ? "Earned!" : achievement.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Study Insights */}
      <motion.div variants={itemVariants}>
        <Card variant="gradient" glow="blue">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue/20 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">AI Insights</h3>
                <p className="text-muted text-sm leading-relaxed">
                  {dashboardData?.stats.total_questions_solved === 0 
                    ? "Start solving questions to get personalized insights about your learning progress!"
                    : `You've solved ${dashboardData?.stats.total_questions_solved} questions with an average accuracy of ${overallAccuracy}%. ${
                        dashboardData?.weakest_subject 
                          ? `Focus more on ${dashboardData.weakest_subject} to improve your overall score.`
                          : "Keep up the great work!"
                      }`
                  }
                </p>
                <Button variant="secondary" size="sm" className="mt-4">
                  View Detailed Analysis
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Missing import
function CheckCircle(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
