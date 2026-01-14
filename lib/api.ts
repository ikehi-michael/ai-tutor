import axios, { AxiosError, AxiosInstance } from "axios";
import Cookies from "js-cookie";

// API Base URL - will be set from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on login/register page or if it's a login/register request
      const isLoginOrRegisterRequest = 
        error.config?.url?.includes("/login") || 
        error.config?.url?.includes("/register");
      
      const isOnAuthPage = 
        typeof window !== "undefined" && 
        (window.location.pathname === "/login" || window.location.pathname === "/register");
      
      // Only redirect if it's not a login/register request and we're not on auth pages
      if (!isLoginOrRegisterRequest && !isOnAuthPage) {
        // Token expired or invalid - redirect to login
        Cookies.remove("access_token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AUTH API
// ==========================================
export interface RegisterData {
  email: string;
  phone?: string;
  password: string;
  full_name: string;
  role: "student" | "parent";
  student_class?: "SS1" | "SS2" | "SS3" | "JAMB";
  subjects?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  role: string;
}

export interface UserProfile {
  id: number;
  email: string;
  phone: string | null;
  full_name: string;
  role: string;
  student_class: string | null;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  subjects: Array<{
    id: number;
    subject_name: string;
    total_questions_attempted: number;
    correct_answers: number;
    accuracy: number | null;
  }>;
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    // Use the JSON login endpoint for frontend
    const response = await api.post("/api/auth/login/json", data);
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put("/api/auth/me", data);
    return response.data;
  },
};

// ==========================================
// QUESTIONS API
// ==========================================
export interface SolveQuestionData {
  question_text?: string;
  question_image?: string;
  subject?: string;
}

export interface SolutionStep {
  step_number: number;
  description: string;
  formula: string | null;
  explanation: string;
}

export interface QuestionSolution {
  question_id: number;
  question_text: string;
  subject: string;
  topic: string;
  solution: string;
  steps: SolutionStep[];
  related_topics: string[];
  similar_questions: string[];
}

export interface QuestionHistory {
  id: number;
  question_text: string;
  subject: string | null;
  topic: string | null;
  ai_solution: string;
  solved_at: string;
}

export const questionsAPI = {
  solve: async (data: SolveQuestionData): Promise<QuestionSolution> => {
    const response = await api.post("/api/questions/solve", data);
    return response.data;
  },

  solveWithImage: async (image: File, subject?: string, additionalContext?: string): Promise<QuestionSolution> => {
    const formData = new FormData();
    formData.append("image", image);
    if (subject) formData.append("subject", subject);
    if (additionalContext) formData.append("additional_context", additionalContext);

    const response = await api.post("/api/questions/solve-with-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getHistory: async (limit = 50, offset = 0, subject?: string): Promise<QuestionHistory[]> => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (subject) params.append("subject", subject);
    const response = await api.get(`/api/questions/history?${params}`);
    return response.data;
  },

  getDetail: async (questionId: number): Promise<QuestionSolution> => {
    const response = await api.get(`/api/questions/history/${questionId}`);
    return response.data;
  },
};

// ==========================================
// TOPICS API
// ==========================================
export interface TopicTeachRequest {
  subject: string;
  topic: string;
  difficulty_level?: "simple" | "medium" | "advanced";
}

export interface TopicTeachResponse {
  subject: string;
  topic: string;
  summary: string;
  detailed_explanation: string;
  examples: string[];
  practice_questions: string[];
  video_link: string | null;
  youtube_video_id?: string | null;
  lesson_id?: number | null;
}

export interface SavedLesson {
  id: number;
  subject: string;
  topic: string;
  difficulty_level: string | null;
  lesson_data: {
    summary: string;
    detailed_explanation: string;
    examples: string[];
    practice_questions: string[];
    key_concepts?: string[];
    common_mistakes?: string[];
    exam_tips?: string[];
  };
  youtube_video_id: string | null;
  youtube_video_url: string | null;
  created_at: string;
  updated_at: string | null;
  last_accessed_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  message: string;
  created_at: string;
}

export const topicsAPI = {
  getSubjects: async (): Promise<{ subjects: string[]; total: number }> => {
    const response = await api.get("/api/topics/subjects");
    return response.data;
  },

  teach: async (data: TopicTeachRequest): Promise<TopicTeachResponse> => {
    const response = await api.post("/api/topics/teach", data);
    return response.data;
  },

  simplify: async (topic: string, originalExplanation: string): Promise<{ simplified_explanation: string }> => {
    const response = await api.post("/api/topics/simplify", {
      topic,
      original_explanation: originalExplanation,
    });
    return response.data;
  },

  getSyllabus: async (subject: string): Promise<{ subject: string; topics: string[] }> => {
    const response = await api.get(`/api/topics/syllabus/${encodeURIComponent(subject)}`);
    return response.data;
  },

  getSavedLessons: async (subject?: string): Promise<SavedLesson[]> => {
    const params = subject ? { subject } : {};
    const response = await api.get("/api/topics/saved-lessons", { params });
    return response.data;
  },

  getSavedLesson: async (lessonId: number): Promise<SavedLesson> => {
    const response = await api.get(`/api/topics/saved-lessons/${lessonId}`);
    return response.data;
  },

  chatAboutTopic: async (data: { lesson_id: number; message: string }): Promise<{ message: string }> => {
    const response = await api.post("/api/topics/chat", data);
    return response.data;
  },

  getChatHistory: async (lessonId: number): Promise<ChatMessage[]> => {
    const response = await api.get(`/api/topics/chat/${lessonId}/history`);
    return response.data;
  },
};

// ==========================================
// STUDY PLANS API
// ==========================================
export interface StudyPlanRequest {
  target_exam: string;
  exam_date?: string;
  hours_per_day: number;
  days_per_week: number;
  subjects: string[];
  weak_areas?: string[];
}

export interface DailySchedule {
  day: string;
  time_slot: string;
  subject: string;
  topic: string;
  duration_minutes: number;
  activity_type: string;
}

export interface StudyPlan {
  id: number;
  plan_name: string;
  target_exam: string;
  exam_date: string | null;
  hours_per_day: number;
  days_per_week: number;
  weekly_schedule: DailySchedule[];
  completion_percentage: number;
  is_active: boolean;
  created_at: string;
}

export const studyPlansAPI = {
  generate: async (data: StudyPlanRequest): Promise<StudyPlan> => {
    const response = await api.post("/api/study-plans/generate", data);
    return response.data;
  },

  getMyPlans: async (): Promise<StudyPlan[]> => {
    const response = await api.get("/api/study-plans/my-plans");
    return response.data;
  },

  getActive: async (): Promise<StudyPlan> => {
    const response = await api.get("/api/study-plans/active");
    return response.data;
  },

  updateProgress: async (planId: number, completionPercentage: number): Promise<void> => {
    await api.put(`/api/study-plans/${planId}/progress`, null, {
      params: { completion_percentage: completionPercentage },
    });
  },
};

// ==========================================
// EXAMS API
// ==========================================
export interface MockExamRequest {
  exam_type: string;
  subject: string;
  year?: string;
  number_of_questions?: number;
  time_limit_minutes?: number;
}

export interface ExamQuestion {
  question_number: number;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string | null;
}

export interface MockExam {
  exam_id: number;
  exam_type: string;
  subject: string;
  total_questions: number;
  time_limit_minutes: number;
  questions: ExamQuestion[];
  started_at: string;
}

export interface ExamSubmission {
  exam_id: number;
  answers: Record<number, string>;
  time_taken_seconds: number;
}

export interface ExamResult {
  exam_id: number;
  total_questions: number;
  correct_count: number;
  score_percentage: number;
  time_taken_seconds: number;
  weak_topics: string[];
  detailed_results: Array<{
    question_number: number;
    is_correct: boolean;
    user_answer: string;
    correct_answer: string;
    topic: string;
  }>;
  recommendations: string[];
}

export const examsAPI = {
  create: async (data: MockExamRequest): Promise<MockExam> => {
    const response = await api.post("/api/exams/create", data);
    return response.data;
  },

  submit: async (data: ExamSubmission): Promise<ExamResult> => {
    const response = await api.post("/api/exams/submit", data);
    return response.data;
  },

  getHistory: async (subject?: string): Promise<ExamResult[]> => {
    const params = subject ? `?subject=${encodeURIComponent(subject)}` : "";
    const response = await api.get(`/api/exams/history${params}`);
    return response.data;
  },
};

// ==========================================
// DASHBOARD API
// ==========================================
export interface StudentDashboard {
  user: {
    name: string;
    class: string | null;
    subscription: string;
  };
  stats: {
    total_questions_solved: number;
    questions_today: number;
    questions_this_week: number;
    total_exams_taken: number;
    average_exam_score: number;
    study_streak_days: number;
  };
  subject_performance: Array<{
    subject: string;
    questions_attempted: number;
    accuracy: number;
  }>;
  weakest_subject: string | null;
  active_study_plan: {
    id: number;
    name: string;
    completion: number;
    exam_date: string | null;
  } | null;
}

export interface ProgressChart {
  period_days: number;
  data: Array<{
    date: string;
    questions_solved: number;
  }>;
}

export const dashboardAPI = {
  getStudentOverview: async (): Promise<StudentDashboard> => {
    const response = await api.get("/api/dashboard/student/overview");
    return response.data;
  },

  getProgressChart: async (days = 30): Promise<ProgressChart> => {
    const response = await api.get(`/api/dashboard/student/progress-chart?days=${days}`);
    return response.data;
  },

  getParentDashboard: async () => {
    const response = await api.get("/api/dashboard/parent/children");
    return response.data;
  },

  getChildDetail: async (childId: number) => {
    const response = await api.get(`/api/dashboard/parent/child/${childId}/detailed`);
    return response.data;
  },

  linkChild: async (childEmail: string): Promise<{ message: string; child_id: number; child_name: string }> => {
    const response = await api.post("/api/dashboard/parent/link-child", {
      child_email: childEmail
    });
    return response.data;
  },
};

// ==========================================
// PAST QUESTIONS API
// ==========================================
export interface PastQuestion {
  id: number;
  exam_type: string;
  subject: string;
  year: string;
  question_number: number;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  topic: string | null;
  source_pdf: string | null;
  page_number: number | null;
  created_at: string;
}

export interface AvailablePastQuestions {
  exam_type: string;
  subject: string;
  year: string;
  question_count: number;
}

export const pastQuestionsAPI = {
  upload: async (
    file: File,
    examType: string,
    subject: string,
    year: string
  ): Promise<PastQuestion[]> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("exam_type", examType);
    formData.append("subject", subject);
    formData.append("year", year);

    // Create a new axios instance for this request to avoid Content-Type override
    const formApi = axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${Cookies.get("access_token")}`,
        // Don't set Content-Type - let browser set it with boundary
      },
    });

    const response = await formApi.post("/api/past-questions/upload", formData);
    return response.data;
  },

  getAvailable: async (
    examType?: string,
    subject?: string,
    year?: string
  ): Promise<AvailablePastQuestions[]> => {
    const params: Record<string, string> = {};
    if (examType) params.exam_type = examType;
    if (subject) params.subject = subject;
    if (year) params.year = year;

    const response = await api.get("/api/past-questions/available", { params });
    return response.data;
  },
};

export default api;

