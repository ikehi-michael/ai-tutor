"use client";

import { motion } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface EmptyStudyPlanProps {
  onCreatePlan: () => void;
}

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

export function EmptyStudyPlan({ onCreatePlan }: EmptyStudyPlanProps) {
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
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-blue/10 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-blue" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Study Plan Yet</h3>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Let AI create a personalized study plan based on your subjects, available time, and exam date.
            </p>
            <Button variant="primary" size="lg" onClick={onCreatePlan}>
              <Sparkles className="w-5 h-5 mr-2" />
              Create My Study Plan
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

