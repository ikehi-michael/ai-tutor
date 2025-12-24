// Re-export all types from API for convenience
export type {
  RegisterData,
  LoginData,
  AuthResponse,
  UserProfile,
  SolveQuestionData,
  SolutionStep,
  QuestionSolution,
  QuestionHistory,
  TopicTeachRequest,
  TopicTeachResponse,
  StudyPlanRequest,
  DailySchedule,
  StudyPlan,
  MockExamRequest,
  ExamQuestion,
  MockExam,
  ExamSubmission,
  ExamResult,
  StudentDashboard,
  ProgressChart,
} from "@/lib/api";

// Additional frontend types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  color: string;
}

export interface SubjectPerformance {
  subject: string;
  questions_attempted: number;
  accuracy: number;
}

export type Theme = "light" | "dark";

export type SubscriptionTier = "free" | "basic" | "premium";

export type StudentClass = "SS1" | "SS2" | "SS3" | "JAMB";

export type UserRole = "student" | "parent" | "admin";

