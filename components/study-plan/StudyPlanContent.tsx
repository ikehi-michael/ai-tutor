"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Target,
  ChevronRight,
  Flame,
  Play,
  Brain,
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { StudyPlan, DailySchedule } from "@/lib/api";
import { useRouter } from "next/navigation";

interface StudyPlanContentProps {
  activePlan: StudyPlan;
  onCreateNew: () => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

export function StudyPlanContent({ activePlan, onCreateNew }: StudyPlanContentProps) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(() => {
    // Default to today's day
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(today) ? today : DAYS[0];
  });

  // Group tasks by day
  const getTasksForDay = (day: string): DailySchedule[] => {
    return activePlan.weekly_schedule.filter(task => task.day === day);
  };

  // Calculate progress
  const calculateProgress = () => {
    const total = activePlan.weekly_schedule.length;
    const completed = Math.round((activePlan.completion_percentage / 100) * total);
    return { completed, total, percentage: activePlan.completion_percentage };
  };

  const progress = calculateProgress();

  const handleAskAI = () => {
    const dayTasks = getTasksForDay(selectedDay);
    if (dayTasks.length > 0) {
      const firstTask = dayTasks[0];
      router.push(`/dashboard/ask?subject=${encodeURIComponent(firstTask.subject)}&topic=${encodeURIComponent(firstTask.topic)}`);
    } else {
      router.push('/dashboard/ask');
    }
  };

  const handlePracticeQuiz = () => {
    const dayTasks = getTasksForDay(selectedDay);
    if (dayTasks.length > 0) {
      const firstTask = dayTasks[0];
      router.push(`/dashboard/exams?subject=${encodeURIComponent(firstTask.subject)}`);
    } else {
      router.push('/dashboard/exams');
    }
  };

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
          <h1 className="text-2xl font-bold font-heading text-foreground">Study Plan</h1>
          <p className="text-muted text-sm">Your personalized exam preparation schedule</p>
        </div>
        <Button variant="secondary" onClick={onCreateNew}>
          <Plus className="w-5 h-5 mr-2" />
          New Plan
        </Button>
      </motion.div>

      {/* Progress Overview */}
      <motion.div variants={itemVariants}>
        <Card variant="gradient" glow="blue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{activePlan.plan_name}</h3>
                <p className="text-sm text-muted">
                  Target: {activePlan.target_exam} {activePlan.exam_date && `• Exam: ${new Date(activePlan.exam_date).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-gold" />
                <span className="font-bold text-gold">Active</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted">Overall Progress</span>
                <span className="text-blue font-medium">{progress.percentage}%</span>
              </div>
              <div className="h-3 rounded-full bg-card overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue to-red rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-card">
                <p className="text-2xl font-bold text-foreground">{progress.completed}</p>
                <p className="text-xs text-muted">Completed</p>
              </div>
              <div className="p-3 rounded-xl bg-card">
                <p className="text-2xl font-bold text-foreground">{progress.total - progress.completed}</p>
                <p className="text-xs text-muted">Remaining</p>
              </div>
              <div className="p-3 rounded-xl bg-card">
                <p className="text-2xl font-bold text-foreground">{activePlan.hours_per_day}h</p>
                <p className="text-xs text-muted">Daily Goal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Day Selector */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {DAYS.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex-shrink-0 px-4 py-3 rounded-xl transition-all text-center min-w-[100px]",
                  selectedDay === day
                    ? "bg-gradient-to-r from-blue to-red text-white"
                    : "bg-card text-muted hover:text-foreground hover:bg-blue-light/10",
                  isToday && selectedDay !== day && "ring-2 ring-gold"
                )}
              >
                <p className="font-medium text-sm">{day.slice(0, 3)}</p>
                <p className="text-xs mt-1 opacity-70">
                  {dayTasks.length} tasks
                </p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Daily Tasks */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{selectedDay}'s Tasks</h3>
              <span className="text-sm text-muted">
                {getTasksForDay(selectedDay).reduce((acc, t) => acc + t.duration_minutes, 0)} mins total
              </span>
            </div>

            <div className="space-y-3">
              {getTasksForDay(selectedDay).length > 0 ? (
                getTasksForDay(selectedDay).map((task, taskIndex) => (
                  <motion.div
                    key={taskIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: taskIndex * 0.1 }}
                    className="p-4 rounded-xl bg-card hover:bg-blue-light/10 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full border-2 border-muted group-hover:border-blue flex items-center justify-center transition-colors">
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            task.subject === "Mathematics" && "bg-blue/20 text-blue",
                            task.subject === "Physics" && "bg-red/20 text-red",
                            task.subject === "Chemistry" && "bg-green-500/20 text-green-400",
                            task.subject === "Biology" && "bg-emerald-500/20 text-emerald-400",
                            task.subject === "English Language" && "bg-purple-500/20 text-purple-400",
                            !["Mathematics", "Physics", "Chemistry", "Biology", "English Language"].includes(task.subject) && "bg-gold/20 text-gold"
                          )}>
                            {task.subject}
                          </span>
                          <span className="text-xs text-muted">{task.time_slot}</span>
                        </div>
                        <p className="font-medium mt-1 text-foreground">
                          {task.topic}
                        </p>
                        <p className="text-xs text-muted mt-1 capitalize">{task.activity_type}</p>
                      </div>

                      <div className="flex items-center gap-2 text-muted">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{task.duration_minutes}m</span>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => router.push(`/dashboard/ask?subject=${encodeURIComponent(task.subject)}&topic=${encodeURIComponent(task.topic)}`)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted">No tasks scheduled for {selectedDay}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
        <Card variant="glass" hover className="cursor-pointer" onClick={handleAskAI}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">Ask AI Tutor</h4>
                <p className="text-sm text-muted">Get help with today's topics</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted" />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" hover className="cursor-pointer" onClick={handlePracticeQuiz}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-red" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">Practice Quiz</h4>
                <p className="text-sm text-muted">Test your knowledge</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

