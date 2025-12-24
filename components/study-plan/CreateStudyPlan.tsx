"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  BookOpen,
  ChevronLeft,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { studyPlansAPI, StudyPlan } from "@/lib/api";

// Exam options
const EXAMS = [
  { value: "WAEC", label: "WAEC", description: "West African Examinations Council" },
  { value: "JAMB", label: "JAMB", description: "Joint Admissions and Matriculation Board" },
  { value: "NECO", label: "NECO", description: "National Examinations Council" },
  { value: "GCE", label: "GCE", description: "General Certificate of Education" }
];

// Subject options
const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "English Language", "Economics", "Government", "Geography"
];

interface CreateStudyPlanProps {
  onBack: () => void;
  onPlanCreated: (plan: StudyPlan) => void;
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

export function CreateStudyPlan({ onBack, onPlanCreated }: CreateStudyPlanProps) {
  const [targetExam, setTargetExam] = useState<string>("WAEC");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [weeksUntilExam, setWeeksUntilExam] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle subject selection
  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  // Generate study plan
  const generatePlan = async () => {
    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Calculate exam date based on weeks until exam
      const examDate = new Date();
      examDate.setDate(examDate.getDate() + (weeksUntilExam * 7));
      // Set time to noon UTC to avoid timezone issues
      examDate.setUTCHours(12, 0, 0, 0);
      
      const requestData = {
        target_exam: targetExam,
        exam_date: examDate.toISOString(), // Send full ISO datetime string
        hours_per_day: hoursPerDay,
        days_per_week: daysPerWeek,
        subjects: selectedSubjects,
        weak_areas: []
      };
      
      console.log("Generating study plan with data:", requestData);
      
      const plan = await studyPlansAPI.generate(requestData);
      
      onPlanCreated(plan);
    } catch (err: any) {
      console.error("Study plan generation error:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Failed to generate study plan. Please try again.";
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
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
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-card hover:bg-blue-light/20 text-muted hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Create Study Plan</h1>
          <p className="text-muted text-sm">AI will generate a personalized plan for you</p>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-xl bg-red/10 border border-red/20 text-red text-sm">
            {error}
          </div>
        </motion.div>
      )}

      {/* Exam Selection */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue" />
              Select Exam
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {EXAMS.map(exam => (
                <button
                  key={exam.value}
                  onClick={() => setTargetExam(exam.value)}
                  className={cn(
                    "p-4 rounded-xl text-sm font-medium transition-all text-center border-2",
                    targetExam === exam.value
                      ? "bg-gradient-to-r from-blue to-red text-white border-transparent"
                      : "bg-card text-muted hover:text-foreground hover:bg-blue-light/10 border-transparent hover:border-blue-light/20"
                  )}
                >
                  <div className="font-bold text-base mb-1">{exam.label}</div>
                  <div className="text-xs opacity-75">{exam.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subject Selection */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue" />
              Select Subjects
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SUBJECTS.map(subject => (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={cn(
                    "p-3 rounded-xl text-sm font-medium transition-all text-center",
                    selectedSubjects.includes(subject)
                      ? "bg-gradient-to-r from-blue to-red text-white"
                      : "bg-card text-muted hover:text-foreground hover:bg-blue-light/10"
                  )}
                >
                  {subject}
                </button>
              ))}
            </div>
            {selectedSubjects.length === 0 && (
              <p className="text-xs text-muted mt-4">Select at least one subject to continue</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Time Settings */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red" />
              Study Schedule
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-muted mb-2">Hours per day</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setHoursPerDay(Math.max(1, hoursPerDay - 1))}
                    className="w-10 h-10 rounded-lg bg-card text-muted hover:text-foreground flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-foreground w-12 text-center">{hoursPerDay}</span>
                  <button
                    onClick={() => setHoursPerDay(Math.min(8, hoursPerDay + 1))}
                    className="w-10 h-10 rounded-lg bg-card text-muted hover:text-foreground flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">Days per week</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDaysPerWeek(Math.max(1, daysPerWeek - 1))}
                    className="w-10 h-10 rounded-lg bg-card text-muted hover:text-foreground flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-foreground w-12 text-center">{daysPerWeek}</span>
                  <button
                    onClick={() => setDaysPerWeek(Math.min(7, daysPerWeek + 1))}
                    className="w-10 h-10 rounded-lg bg-card text-muted hover:text-foreground flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">Weeks until exam</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setWeeksUntilExam(Math.max(1, weeksUntilExam - 1))}
                    className="w-10 h-10 rounded-lg bg-card text-muted hover:text-foreground flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-foreground w-12 text-center">{weeksUntilExam}</span>
                  <button
                    onClick={() => setWeeksUntilExam(Math.min(24, weeksUntilExam + 1))}
                    className="w-10 h-10 rounded-lg bg-card text-muted hover:text-foreground flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary & Generate */}
      <motion.div variants={itemVariants}>
        <Card variant="gradient" glow="blue">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Ready to Generate</h3>
                <p className="text-sm text-muted">
                  {EXAMS.find(e => e.value === targetExam)?.label} • {selectedSubjects.length} {selectedSubjects.length === 1 ? 'subject' : 'subjects'} • {hoursPerDay}h/day • {daysPerWeek} {daysPerWeek === 1 ? 'day' : 'days'}/week • {weeksUntilExam} {weeksUntilExam === 1 ? 'week' : 'weeks'}
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={generatePlan}
                disabled={selectedSubjects.length === 0 || isGenerating}
                isLoading={isGenerating}
                className="w-full md:w-auto"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isGenerating ? "Generating..." : "Generate Plan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

