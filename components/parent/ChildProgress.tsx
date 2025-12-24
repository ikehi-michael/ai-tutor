"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  Target,
  Brain,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface Subject {
  name: string;
  accuracy: number;
  trend: "up" | "down" | "neutral" | string;
}

interface WeeklyActivity {
  day: string;
  hours: number;
}

interface WeakTopic {
  subject: string;
  topic: string;
}

interface ChildStats {
  totalQuestions: number;
  studyHours: number;
  examsCompleted: number;
  averageScore: number;
}

interface ChildData {
  subjects?: Subject[];
  weeklyActivity?: WeeklyActivity[];
  weakTopics?: WeakTopic[];
  stats: ChildStats;
}

interface ChildProgressProps {
  child: ChildData;
  itemVariants: any;
}

export function ChildProgress({ child, itemVariants }: ChildProgressProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Subject Performance */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue" />
              Subject Performance
            </h3>
            <div className="space-y-4">
              {(child.subjects || []).map((subject, index) => (
                <div key={subject.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{subject.name}</span>
                      {subject.trend === "up" && <TrendingUp className="w-4 h-4 text-blue" />}
                      {subject.trend === "down" && <TrendingDown className="w-4 h-4 text-red" />}
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      subject.accuracy >= 70 ? "text-blue" :
                      subject.accuracy >= 50 ? "text-gold" : "text-red"
                    )}>
                      {subject.accuracy}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-card overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        subject.accuracy >= 70 ? "bg-gradient-to-r from-blue to-blue-light" :
                        subject.accuracy >= 50 ? "bg-gradient-to-r from-gold to-amber-400" :
                        "bg-gradient-to-r from-red to-red-light"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.accuracy}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Study Hours */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red" />
              Weekly Study Hours
            </h3>
            <div className="flex items-end justify-between h-40 gap-2">
              {(child.weeklyActivity || []).map((day, index) => {
                const weeklyActivity = child.weeklyActivity || [];
                const maxHours = Math.max(...weeklyActivity.map((d: any) => d.hours), 1);
                const height = (day.hours / maxHours) * 100;
                
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center">
                    <motion.div
                      className={cn(
                        "w-full rounded-t-lg",
                        day.hours > 0 ? "bg-gradient-to-t from-blue to-blue-light" : "bg-muted/20"
                      )}
                      initial={{ height: 0 }}
                      animate={{ height: day.hours > 0 ? `${height}%` : "4px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                    <span className="text-xs text-muted mt-2">{day.day}</span>
                    <span className="text-xs text-foreground font-medium">{day.hours}h</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weak Topics */}
      <motion.div variants={itemVariants}>
        <Card variant="glass" glow="red">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-red" />
              Weak Topics (Needs Attention)
            </h3>
            {child.weakTopics && child.weakTopics.length > 0 ? (
              <div className="space-y-3">
                {child.weakTopics.map((topic, index) => (
                  <div key={index} className="p-3 rounded-xl bg-red/10 border border-red/20">
                    <p className="text-xs text-muted mb-1">{topic.subject}</p>
                    <p className="font-medium text-foreground">{topic.topic}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-blue mx-auto mb-2" />
                <p className="text-muted">No weak topics identified!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendations */}
      <motion.div variants={itemVariants}>
        <Card variant="gradient" glow="blue">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue" />
              AI Recommendations
            </h3>
            <ul className="space-y-3">
              {child.weakTopics && child.weakTopics.length > 0 && (
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-red">1</span>
                  </div>
                  <p className="text-sm text-muted">
                    Focus on <span className="text-red font-medium">{child.weakTopics[0].topic}</span> in {child.weakTopics[0].subject}. 
                    Consider scheduling extra practice time.
                  </p>
                </li>
              )}
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue">2</span>
                </div>
                <p className="text-sm text-muted">
                  Encourage consistent daily study of at least <span className="text-blue font-medium">2-3 hours</span> to 
                  maintain momentum and improve retention.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-gold">3</span>
                </div>
                <p className="text-sm text-muted">
                  {child.stats.averageScore >= 70 
                    ? "Great progress! Keep encouraging them to maintain this performance."
                    : "Consider a mock exam every week to build exam confidence."}
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

