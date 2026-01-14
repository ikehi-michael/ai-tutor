"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trophy,
  RotateCcw,
  BookOpen,
  Timer,
  Target,
  ArrowLeft,
  Pause,
  Flag,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { examsAPI, MockExam, ExamResult, pastQuestionsAPI, AvailablePastQuestions } from "@/lib/api";

// Subject icons mapping
const SUBJECT_ICONS: Record<string, string> = {
  "Mathematics": "📐",
  "Physics": "⚛️",
  "Chemistry": "🧪",
  "Biology": "🧬",
  "English Language": "📚",
  "Economics": "📊",
  "Government": "🏛️",
  "Literature in English": "📖",
  "Geography": "🌍",
  "Agricultural Science": "🌾",
  "Civic Education": "🧑🏽‍⚖️",
};

const EXAM_YEARS = ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "Random Mix"];

const EXAM_TYPES = [
  { name: "JAMB", icon: "🎯", description: "Unified Tertiary Matriculation Examination" },
  { name: "WAEC", icon: "📝", description: "West African Examinations Council" },
  { name: "NECO", icon: "📋", description: "National Examinations Council" },
];

type ExamState = "setup" | "loading" | "in-progress" | "submitting" | "results";

interface Answer {
  questionNumber: number;
  selectedOption: string | null;
  flagged: boolean;
}

export default function ExamsPage() {
  const [examState, setExamState] = useState<ExamState>("setup");
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // API data
  const [examData, setExamData] = useState<MockExam | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [availableSubjects, setAvailableSubjects] = useState<AvailablePastQuestions[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(100);
  const [maxQuestions, setMaxQuestions] = useState(100);
  const [subjectQuestionCounts, setSubjectQuestionCounts] = useState<Record<string, number>>({});

  // Calculate time based on number of questions (1 minute per question, default 120 for 100)
  const calculateTime = (questions: number) => {
    if (questions === 100) return 120;
    return questions; // 1 minute per question
  };

  // Fetch available subjects when exam type is selected
  useEffect(() => {
    const fetchAvailableSubjects = async () => {
      if (!selectedExamType) {
        setAvailableSubjects([]);
        setSelectedSubject(null);
        setSelectedYear(null);
        return;
      }

      setIsLoadingSubjects(true);
      try {
        const available = await pastQuestionsAPI.getAvailable(selectedExamType);
        // Group by subject and sum question counts
        const subjectMap = new Map<string, number>();
        available.forEach(item => {
          const current = subjectMap.get(item.subject) || 0;
          subjectMap.set(item.subject, current + item.question_count);
        });

        const subjects: AvailablePastQuestions[] = Array.from(subjectMap.entries()).map(([subject, count]) => ({
          exam_type: selectedExamType,
          subject,
          year: "",
          question_count: count
        }));

        setAvailableSubjects(subjects);
        // Reset subject and year when exam type changes
        setSelectedSubject(null);
        setSelectedYear(null);
      } catch (error) {
        console.error("Failed to fetch available subjects:", error);
        setAvailableSubjects([]);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchAvailableSubjects();
  }, [selectedExamType]);

  // Fetch available years when subject is selected
  useEffect(() => {
    const fetchAvailableYears = async () => {
      if (!selectedExamType || !selectedSubject) {
        setAvailableYears([]);
        setSelectedYear(null);
        return;
      }

      setIsLoadingYears(true);
      try {
        const available = await pastQuestionsAPI.getAvailable(selectedExamType, selectedSubject);
        // Extract unique years and sort them (newest first)
        const years = [...new Set(available.map(item => item.year))].sort((a, b) => b.localeCompare(a));
        setAvailableYears(years);
        setSelectedYear(null);
      } catch (error) {
        console.error("Failed to fetch available years:", error);
        setAvailableYears([]);
      } finally {
        setIsLoadingYears(false);
      }
    };

    fetchAvailableYears();
  }, [selectedExamType, selectedSubject]);

  // Update question counts when year is selected
  useEffect(() => {
    const updateQuestionCounts = async () => {
      if (!selectedExamType || !selectedYear) {
        setSubjectQuestionCounts({});
        setMaxQuestions(100);
        return;
      }

      try {
        const available = await pastQuestionsAPI.getAvailable(
          selectedExamType,
          undefined, // Get all subjects
          selectedYear !== "Random Mix" ? selectedYear : undefined
        );
        
        // Calculate question counts per subject
        const counts: Record<string, number> = {};
        available.forEach(item => {
          counts[item.subject] = (counts[item.subject] || 0) + item.question_count;
        });
        setSubjectQuestionCounts(counts);

        // Update max questions for selected subject
        if (selectedSubject) {
          const subjectCount = counts[selectedSubject] || 0;
          setMaxQuestions(subjectCount);
          setNumberOfQuestions(prev => Math.min(prev, subjectCount || 100));
        }
      } catch (error) {
        console.error("Failed to update question counts:", error);
      }
    };

    updateQuestionCounts();
  }, [selectedExamType, selectedSubject, selectedYear]);

  // Start exam - fetch from API
  const startExam = async () => {
    if (!selectedExamType || !selectedSubject || !selectedYear) return;
    
    setExamState("loading");
    setError(null);

    try {
      const timeLimit = calculateTime(numberOfQuestions);
      // Use the minimum of requested questions and available questions
      const questionsToRequest = maxQuestions > 0 ? Math.min(numberOfQuestions, maxQuestions) : numberOfQuestions;
      
      const exam = await examsAPI.create({
        exam_type: selectedExamType,
        subject: selectedSubject,
        year: selectedYear === "Random Mix" ? undefined : selectedYear,
        number_of_questions: questionsToRequest,
        time_limit_minutes: timeLimit
      });

      setExamData(exam);
      
      // Initialize answers
      const initialAnswers: Answer[] = exam.questions.map(q => ({
        questionNumber: q.question_number,
        selectedOption: null,
        flagged: false
      }));
      
      setAnswers(initialAnswers);
      setTimeRemaining(exam.time_limit_minutes * 60);
      setStartTime(Date.now());
      setExamState("in-progress");
      setCurrentQuestionIndex(0);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create exam. Please try again.");
      setExamState("setup");
    }
  };

  // Timer effect
  useEffect(() => {
    if (examState !== "in-progress" || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, isPaused]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Select answer
  const selectAnswer = (option: string) => {
    setAnswers(prev => prev.map((a, i) => 
      i === currentQuestionIndex 
        ? { ...a, selectedOption: option }
        : a
    ));
  };

  // Toggle flag
  const toggleFlag = () => {
    setAnswers(prev => prev.map((a, i) =>
      i === currentQuestionIndex
        ? { ...a, flagged: !a.flagged }
        : a
    ));
  };

  // Submit exam
  const submitExam = useCallback(async () => {
    if (!examData) return;
    
    setExamState("submitting");
    
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    
    // Convert answers to the format expected by API
    const answersMap: Record<number, string> = {};
    answers.forEach(a => {
      if (a.selectedOption) {
        answersMap[a.questionNumber] = a.selectedOption;
      }
    });

    try {
      const result = await examsAPI.submit({
        exam_id: examData.exam_id,
        answers: answersMap,
        time_taken_seconds: timeTaken
      });
      
      setExamResult(result);
      setExamState("results");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit exam.");
      setExamState("in-progress");
    }
  }, [examData, answers, startTime]);

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

  // Reset exam
  const resetExam = () => {
    setExamState("setup");
    setSelectedExamType(null);
    setSelectedSubject(null);
    setSelectedYear(null);
    setExamData(null);
    setExamResult(null);
    setAnswers([]);
    setError(null);
    setNumberOfQuestions(100);
    setMaxQuestions(100);
  };

  // Loading View
  if (examState === "loading" || examState === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue animate-spin mb-4" />
        <p className="text-muted">
          {examState === "loading" ? "Preparing your exam..." : "Submitting your answers..."}
        </p>
      </div>
    );
  }

  // Setup View
  if (examState === "setup") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold font-heading text-foreground">Mock Exams</h1>
          <p className="text-muted">Practice with past WAEC & JAMB questions</p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div variants={itemVariants}>
            <div className="p-4 rounded-xl bg-red/10 border border-red/20 text-red text-sm">
              {error}
            </div>
          </motion.div>
        )}

        {/* Exam Type Selection */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Select Exam Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXAM_TYPES.map((examType) => (
              <Card
                key={examType.name}
                variant="glass"
                hover
                className={cn(
                  "cursor-pointer transition-all",
                  selectedExamType === examType.name && "border-blue glow-blue"
                )}
                onClick={() => setSelectedExamType(examType.name)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{examType.icon}</div>
                  <h4 className="font-medium text-foreground">{examType.name}</h4>
                  <p className="text-xs text-muted mt-1">{examType.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Subject Selection */}
        {selectedExamType && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Select Subject</h3>
            {isLoadingSubjects ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue animate-spin mr-2" />
                <p className="text-muted">Loading available subjects...</p>
              </div>
            ) : availableSubjects.length === 0 ? (
              <div className="p-6 rounded-xl bg-card border border-blue-light/20 text-center">
                <p className="text-muted">No subjects available for {selectedExamType}. Please upload past questions first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableSubjects.map((subject) => {
                  const questionCount = selectedYear ? (subjectQuestionCounts[subject.subject] || 0) : null;
                  return (
                    <Card
                      key={subject.subject}
                      variant="glass"
                      hover
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedSubject === subject.subject && "border-blue glow-blue"
                      )}
                      onClick={() => setSelectedSubject(subject.subject)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{SUBJECT_ICONS[subject.subject] || "📚"}</div>
                        <h4 className="font-medium text-foreground">{subject.subject}</h4>
                        {questionCount !== null && (
                          <p className="text-xs text-muted mt-1">
                            {questionCount} questions available
                          </p>
                        )}
                        {questionCount === null && selectedYear === null && (
                          <p className="text-xs text-muted mt-1">
                            Select year to see count
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Year Selection */}
        {selectedExamType && selectedSubject && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Select Year</h3>
            {isLoadingYears ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-blue animate-spin mr-2" />
                <p className="text-muted text-sm">Loading available years...</p>
              </div>
            ) : availableYears.length === 0 ? (
              <div className="p-4 rounded-xl bg-card border border-blue-light/20 text-center">
                <p className="text-muted">No years available for {selectedSubject}. Please upload past questions first.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {/* Random Mix option */}
                <button
                  onClick={() => setSelectedYear("Random Mix")}
                  className={cn(
                    "px-6 py-3 rounded-xl font-medium transition-all",
                    selectedYear === "Random Mix"
                      ? "bg-gradient-to-r from-blue to-red text-white"
                      : "bg-card text-muted hover:text-foreground hover:bg-blue-light/10"
                  )}
                >
                  Random Mix
                </button>
                {/* Available years */}
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      "px-6 py-3 rounded-xl font-medium transition-all",
                      selectedYear === year
                        ? "bg-gradient-to-r from-blue to-red text-white"
                        : "bg-card text-muted hover:text-foreground hover:bg-blue-light/10"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Number of Questions Selection */}
        {selectedExamType && selectedSubject && selectedYear && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="glass" glow="blue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Number of Questions</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue to-red bg-clip-text text-transparent">
                      {numberOfQuestions}
                    </span>
                    <span className="text-sm text-muted">
                      {maxQuestions > 0 && `(${maxQuestions} available)`}
                    </span>
                  </div>
                </div>

                {/* Quick Selection Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[10, 25, 50, 100, 150, 200].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNumberOfQuestions(num)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                        numberOfQuestions === num
                          ? "bg-gradient-to-r from-blue to-red text-white shadow-lg"
                          : "bg-card text-muted hover:bg-blue-light/10 hover:text-foreground border border-blue-light/20"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <div className="mb-6">
                  <input
                    type="range"
                    min="10"
                    max={200}
                    step="1"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                    className="w-full h-3 bg-card rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${((numberOfQuestions - 10) / 190) * 100}%, rgb(30, 41, 59) ${((numberOfQuestions - 10) / 190) * 100}%, rgb(30, 41, 59) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted mt-2">
                    <span>10</span>
                    <span>100</span>
                    <span>200</span>
                  </div>
                  {maxQuestions > 0 && numberOfQuestions > maxQuestions && (
                    <p className="text-xs text-amber-500 mt-2 text-center">
                      ⚠️ Only {maxQuestions} questions available. Exam will use all available questions.
                    </p>
                  )}
                </div>

                {/* Time Display */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue/20 to-red/20 border-2 border-blue/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue" />
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Time Limit</p>
                        <p className="text-2xl font-bold text-foreground">
                          {calculateTime(numberOfQuestions)} <span className="text-sm font-normal text-muted">minutes</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted">
                        {numberOfQuestions === 100 ? 'Standard exam time' : '1 min per question'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Exam Settings Summary */}
        {selectedExamType && selectedSubject && selectedYear && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="gradient" glow="blue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Ready to Start</h3>
                    <p className="text-muted text-sm">
                      {selectedExamType} • {selectedSubject} • {selectedYear} • {numberOfQuestions} Questions • {calculateTime(numberOfQuestions)} mins
                    </p>
                  </div>
                  <Button variant="primary" size="lg" onClick={startExam}>
                    <Play className="w-5 h-5 mr-2" />
                    Start Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Exam Instructions</h4>
                  <ul className="text-sm text-muted space-y-1">
                    <li>• Answer all questions within the time limit</li>
                    <li>• You can flag questions to review later</li>
                    <li>• You can navigate between questions freely</li>
                    <li>• Submit when you're done or when time runs out</li>
                    <li>• View explanations after submitting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // In Progress View
  if (examState === "in-progress" && examData) {
    const currentQuestion = examData.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
                  resetExam();
                }
              }}
              className="p-2 rounded-lg bg-card hover:bg-red/20 text-muted hover:text-red transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-semibold text-foreground">{examData.exam_type} {selectedSubject}</h2>
              <p className="text-sm text-muted">Question {currentQuestionIndex + 1} of {examData.questions.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl",
              timeRemaining <= 600 ? "bg-red/20" : "bg-blue/20"
            )}>
              <Timer className={cn(
                "w-5 h-5",
                timeRemaining <= 600 ? "text-red" : "text-white"
              )} />
              <span className={cn(
                "font-mono font-bold",
                timeRemaining <= 600 ? "text-red" : "text-white"
              )}>{formatTime(timeRemaining)}</span>
            </div>

            {/* Pause */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-lg bg-card hover:bg-blue-light/20 text-muted hover:text-white transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 rounded-full bg-card overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue to-red"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / examData.questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <p className="text-lg text-foreground leading-relaxed flex-1">
                    {currentQuestion.question_text}
                  </p>
                  <button
                    onClick={toggleFlag}
                    className={cn(
                      "p-2 rounded-lg transition-colors ml-4",
                      currentAnswer?.flagged
                        ? "bg-gold/20 text-gold"
                        : "bg-card text-muted hover:text-gold"
                    )}
                  >
                    <Flag className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => selectAnswer(key)}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-all",
                        currentAnswer?.selectedOption === key
                          ? "bg-gradient-to-r from-blue/20 to-red/20 border-2 border-blue text-foreground"
                          : "bg-card text-muted hover:bg-blue-light/10 hover:text-foreground border-2 border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm",
                          currentAnswer?.selectedOption === key
                            ? "bg-blue text-white"
                            : "bg-blue-light/20 text-muted"
                        )}>
                          {key}
                        </div>
                        <span>{value}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Question Navigation Pills */}
        <div className="flex flex-wrap gap-2">
          {examData.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={cn(
                "w-10 h-10 rounded-lg font-medium text-sm transition-all",
                index === currentQuestionIndex
                  ? "bg-gradient-to-r from-blue to-red text-white"
                  : answers[index]?.selectedOption !== null
                    ? "bg-blue/20 text-blue"
                    : "bg-card text-muted hover:bg-blue-light/10",
                answers[index]?.flagged && "ring-2 ring-gold"
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          {currentQuestionIndex === examData.questions.length - 1 ? (
            <Button variant="primary" onClick={submitExam}>
              Submit Exam
              <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setCurrentQuestionIndex(prev => Math.min(examData.questions.length - 1, prev + 1))}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // Results View
  if (examState === "results" && examResult) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Score Card */}
        <motion.div variants={itemVariants}>
          <Card variant="gradient" glow={examResult.score_percentage >= 70 ? "blue" : "red"}>
            <CardContent className="p-8 text-center">
              <div className={cn(
                "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center",
                examResult.score_percentage >= 70 ? "bg-blue/20" : "bg-red/20"
              )}>
                <Trophy className={cn("w-12 h-12", examResult.score_percentage >= 70 ? "text-blue" : "text-red")} />
              </div>
              <h2 className="text-3xl font-bold font-heading text-foreground mb-2">
                {examResult.score_percentage >= 70 ? "Great Job!" : "Keep Practicing!"}
              </h2>
              <p className="text-6xl font-bold bg-gradient-to-r from-blue to-red bg-clip-text text-transparent mb-4">
                {examResult.score_percentage}%
              </p>
              <p className="text-muted">
                You got {examResult.correct_count} out of {examResult.total_questions} questions correct
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-blue mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{examResult.correct_count}</p>
              <p className="text-sm text-muted">Correct</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 text-red mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{examResult.total_questions - examResult.correct_count}</p>
              <p className="text-sm text-muted">Wrong</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-gold mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{formatTime(examResult.time_taken_seconds)}</p>
              <p className="text-sm text-muted">Time Taken</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weak Topics */}
        {examResult.weak_topics.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card variant="glass" glow="red">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red" />
                  Topics to Review
                </h3>
                <div className="flex flex-wrap gap-2">
                  {examResult.weak_topics.map((topic, index) => (
                    <span key={index} className="px-3 py-1.5 rounded-full bg-red/20 text-red text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Review Questions */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Review Answers</h3>
          <div className="space-y-4">
            {examResult.detailed_results.map((result, index) => (
              <Card key={index} variant="glass">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      result.is_correct ? "bg-blue/20 text-blue" : "bg-red/20 text-red"
                    )}>
                      {result.is_correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground mb-2">Question {result.question_number}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={cn(
                          "text-sm px-3 py-1 rounded-full",
                          result.is_correct ? "bg-blue/20 text-blue" : "bg-red/20 text-red"
                        )}>
                          Your answer: {result.user_answer || "Not answered"}
                        </span>
                        {!result.is_correct && (
                          <span className="text-sm px-3 py-1 rounded-full bg-blue/20 text-blue">
                            Correct: {result.correct_answer}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted">Topic: {result.topic}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        {examResult.recommendations.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card variant="gradient" glow="blue">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue" />
                  AI Recommendations
                </h3>
                <ul className="space-y-2">
                  {examResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted flex items-start gap-2">
                      <span className="text-blue">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex gap-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={resetExam}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Take Another Exam
          </Button>
          <Button variant="primary" className="flex-1" onClick={startExam}>
            <Play className="w-5 h-5 mr-2" />
            Retry This Subject
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return null;
}
