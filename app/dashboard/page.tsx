"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  BookOpen,
  FileQuestion,
  TrendingUp,
  Clock,
  Target,
  Flame,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { dashboardAPI, StudentDashboard } from "@/lib/api";
import { cn } from "@/lib/utils";

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

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<StudentDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardAPI.getStudentOverview();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-red border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-foreground mb-2">
            {getGreeting()}, {user?.full_name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted">
            Ready to continue your learning journey? Let's crush some goals today!
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-red/10 border border-red/20">
          <Flame className="w-5 h-5 text-red" />
          <span className="font-semibold text-red">
            {dashboardData?.stats.study_streak_days || 0} Day Streak
          </span>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card variant="glass" hover className="h-full group">
                <CardContent className="p-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                    action.color
                  )}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                  <p className="text-sm text-muted">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="gradient">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-red/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-red" />
                </div>
                <span className="text-xs text-blue-light font-medium">+12 today</span>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {dashboardData?.stats.total_questions_solved || 0}
              </p>
              <p className="text-sm text-muted">Questions Solved</p>
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-light/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-light" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {dashboardData?.stats.average_exam_score || 0}%
              </p>
              <p className="text-sm text-muted">Average Score</p>
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue/20 flex items-center justify-center">
                  <FileQuestion className="w-5 h-5 text-blue-light" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {dashboardData?.stats.total_exams_taken || 0}
              </p>
              <p className="text-sm text-muted">Exams Taken</p>
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-light/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-red-light" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {dashboardData?.stats.questions_this_week || 0}
              </p>
              <p className="text-sm text-muted">This Week</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subject Performance */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card variant="glass">
            <CardHeader
              title="Subject Performance"
              description="Your accuracy across subjects"
              action={
                <Link href="/dashboard/progress">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {(dashboardData?.subject_performance || []).slice(0, 5).map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{subject.subject}</span>
                      <span className="text-muted">
                        {subject.accuracy}% • {subject.questions_attempted} questions
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-light-gray overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          subject.accuracy >= 70
                            ? "bg-gradient-to-r from-blue-light to-blue"
                            : subject.accuracy >= 50
                            ? "bg-gradient-to-r from-red-light to-red"
                            : "bg-gradient-to-r from-red to-red-dark"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.accuracy}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                ))}

                {(!dashboardData?.subject_performance || dashboardData.subject_performance.length === 0) && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-muted mx-auto mb-4" />
                    <p className="text-muted">Start solving questions to see your progress!</p>
                    <Link href="/dashboard/ask">
                      <Button variant="primary" size="sm" className="mt-4">
                        Ask Your First Question
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Weakest Subject Alert */}
          {dashboardData?.weakest_subject && (
            <motion.div variants={itemVariants}>
              <Card variant="glass" glow="red">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">Focus Area</h4>
                      <p className="text-sm text-muted mb-3">
                        <span className="text-red font-medium">{dashboardData.weakest_subject}</span> needs attention.
                        Let's improve together!
                      </p>
                      <Link href={`/dashboard/topics?subject=${encodeURIComponent(dashboardData.weakest_subject)}`}>
                        <Button variant="secondary" size="sm">
                          Practice Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Study Plan Card */}
          <motion.div variants={itemVariants}>
            <Card variant="glass">
              <CardHeader title="Study Plan" />
              <CardContent>
                {dashboardData?.active_study_plan ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted mb-2">
                        {dashboardData.active_study_plan.name}
                      </p>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-foreground">Progress</span>
                        <span className="text-red font-medium">
                          {dashboardData.active_study_plan.completion}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-light-gray overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-red to-red-light"
                          initial={{ width: 0 }}
                          animate={{ width: `${dashboardData.active_study_plan.completion}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                    <Link href="/dashboard/study-plan">
                      <Button variant="secondary" size="sm" fullWidth>
                        View Schedule
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="w-10 h-10 text-muted mx-auto mb-3" />
                    <p className="text-sm text-muted mb-4">No active study plan</p>
                    <Link href="/dashboard/study-plan">
                      <Button variant="primary" size="sm">
                        Create Plan
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Tips */}
          <motion.div variants={itemVariants}>
            <Card variant="gradient">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-light" />
                  <h4 className="font-semibold text-foreground">Study Tip</h4>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  The best time to review is right before bed! Your brain consolidates 
                  memories during sleep, making late evening study sessions more effective.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Quick Actions Data
const quickActions = [
  {
    icon: Brain,
    title: "Ask AI",
    description: "Solve any question instantly",
    href: "/dashboard/ask",
    color: "bg-gradient-to-br from-red to-red-light"
  },
  {
    icon: BookOpen,
    title: "Learn Topic",
    description: "Study any subject topic",
    href: "/dashboard/topics",
    color: "bg-gradient-to-br from-blue-light to-blue"
  },
  {
    icon: FileQuestion,
    title: "Mock Exam",
    description: "Practice with past papers",
    href: "/dashboard/exams",
    color: "bg-gradient-to-br from-blue to-blue-dark"
  },
  {
    icon: TrendingUp,
    title: "Progress",
    description: "Track your improvement",
    href: "/dashboard/progress",
    color: "bg-gradient-to-br from-red-light to-red"
  }
];
