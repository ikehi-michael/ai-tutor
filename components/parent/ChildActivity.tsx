"use client";

import { motion } from "framer-motion";
import { Brain, Target, BookOpen, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface Activity {
  type: "question" | "exam" | "lesson" | string;
  subject: string;
  topic?: string;
  score?: number;
  time: string;
}

interface ChildActivityProps {
  activities?: any[];
  itemVariants: any;
}

export function ChildActivity({ activities = [], itemVariants }: ChildActivityProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card variant="glass">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-card">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    activity.type === "question" && "bg-blue/20",
                    activity.type === "exam" && "bg-red/20",
                    activity.type === "lesson" && "bg-gold/20"
                  )}>
                    {activity.type === "question" && <Brain className="w-5 h-5 text-blue" />}
                    {activity.type === "exam" && <Target className="w-5 h-5 text-red" />}
                    {activity.type === "lesson" && <BookOpen className="w-5 h-5 text-gold" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {activity.type === "question" && `Solved a ${activity.subject} question`}
                      {activity.type === "exam" && `Completed ${activity.subject} mock exam`}
                      {activity.type === "lesson" && `Studied ${activity.topic}`}
                    </p>
                    <p className="text-sm text-muted">
                      {activity.type === "exam" ? `Score: ${activity.score}%` : activity.topic || activity.subject} • {activity.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted">No recent activity to display</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

