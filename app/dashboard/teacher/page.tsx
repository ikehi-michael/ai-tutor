"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Activity,
  TrendingUp,
  Plus,
  Search,
  X,
  Eye,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import {
  institutionAPI,
  InstitutionStudent,
  InstitutionOverview,
  StudentProgress,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type Tab = "overview" | "students";

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<InstitutionOverview | null>(null);
  const [students, setStudents] = useState<InstitutionStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProgress, setShowProgress] = useState<StudentProgress | null>(null);

  // Add student form
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({ email: "", full_name: "", password: "", student_class: "" });
  const [formLoading, setFormLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ov, studentList] = await Promise.all([
        institutionAPI.getOverview(),
        institutionAPI.getStudents(),
      ]);
      setOverview(ov);
      setStudents(studentList);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewProgress = async (studentId: number) => {
    try {
      const progress = await institutionAPI.getStudentProgress(studentId);
      setShowProgress(progress);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load progress");
    }
  };

  const handleAddStudent = async () => {
    setFormLoading(true);
    try {
      await institutionAPI.addStudent(studentForm);
      setStudentForm({ email: "", full_name: "", password: "", student_class: "" });
      setShowAddStudent(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add student");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-3 border-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "overview", label: "Overview", icon: Activity },
    { key: "students", label: "My Students", icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-white">
          Teacher Dashboard
        </h1>
        <p className="text-muted mt-1">Monitor and manage your assigned students</p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red/10 border border-red/20 text-red text-sm flex justify-between items-center"
          >
            {error}
            <button onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              activeTab === tab.key
                ? "bg-gradient-to-r from-red/20 to-red-light/10 text-red border border-red/20"
                : "text-muted hover:bg-blue-light/10 hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Overview ─────────────────────────────────── */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "My Students", value: overview?.total_students ?? 0, icon: Users, color: "text-blue-light" },
                { label: "Active Today", value: overview?.active_today ?? 0, icon: Activity, color: "text-gold" },
                { label: "Avg Score", value: `${overview?.avg_score ?? 0}%`, icon: TrendingUp, color: "text-green-400" },
                { label: "Total Questions", value: overview?.total_questions_answered ?? 0, icon: BookOpen, color: "text-red" },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-blue-light/10", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-muted">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent students quick view */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Your Students</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("students")}>
                    View All
                  </Button>
                </div>
                {students.length === 0 ? (
                  <p className="text-muted text-sm">No students assigned to you yet</p>
                ) : (
                  <div className="space-y-2">
                    {students.slice(0, 5).map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-blue-light/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-light/20 to-blue/20 flex items-center justify-center">
                            <span className="text-blue-light text-sm font-semibold">{s.full_name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">{s.full_name}</p>
                            <p className="text-xs text-muted">{s.student_class || "N/A"}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleViewProgress(s.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Students ─────────────────────────────────── */}
        {activeTab === "students" && (
          <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-blue-light/10 border border-[rgba(255,255,255,0.1)] text-white placeholder:text-muted text-sm focus:outline-none focus:border-blue-light/30"
                />
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowAddStudent(true)}>
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </div>

            {filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted mx-auto mb-3" />
                  <p className="text-muted">{students.length === 0 ? "No students assigned to you" : "No students match your search"}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-light/20 to-blue/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-light font-semibold">{s.full_name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{s.full_name}</p>
                          <p className="text-xs text-muted truncate">{s.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {s.student_class && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-light/10 text-blue-light">{s.student_class}</span>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleViewProgress(s.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modals ──────────────────────────────────────── */}

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddStudent && (
          <ModalOverlay onClose={() => setShowAddStudent(false)} title="Add Student">
            <div className="space-y-4">
              <Input label="Email" value={studentForm.email} onChange={(e) => setStudentForm((f) => ({ ...f, email: e.target.value }))} placeholder="student@example.com" />
              <Input label="Full Name" value={studentForm.full_name} onChange={(e) => setStudentForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Full name" />
              <Input label="Password" type="password" value={studentForm.password} onChange={(e) => setStudentForm((f) => ({ ...f, password: e.target.value }))} placeholder="Set a password" hint="Required for new accounts" />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">Class (Optional)</label>
                <div className="grid grid-cols-4 gap-2">
                  {["SS1", "SS2", "SS3", "JAMB"].map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setStudentForm((f) => ({ ...f, student_class: f.student_class === cls ? "" : cls }))}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                        studentForm.student_class === cls
                          ? "border-blue-light bg-blue-light/10 text-blue-light"
                          : "border-[rgba(255,255,255,0.1)] text-muted hover:border-[rgba(255,255,255,0.2)]"
                      )}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="primary" fullWidth isLoading={formLoading} onClick={handleAddStudent}>
                Add Student
              </Button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Student Progress Modal */}
      <AnimatePresence>
        {showProgress && (
          <ModalOverlay onClose={() => setShowProgress(null)} title={`${showProgress.student.name}'s Progress`}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-blue-light/5 border border-blue-light/10 text-center">
                  <p className="text-lg font-bold text-white">{showProgress.stats.total_questions}</p>
                  <p className="text-xs text-muted">Questions</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-light/5 border border-blue-light/10 text-center">
                  <p className="text-lg font-bold text-white">{showProgress.stats.weekly_questions}</p>
                  <p className="text-xs text-muted">This Week</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-light/5 border border-blue-light/10 text-center">
                  <p className="text-lg font-bold text-white">{showProgress.stats.total_exams}</p>
                  <p className="text-xs text-muted">Exams</p>
                </div>
              </div>

              {showProgress.subject_performance.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Subject Performance</h4>
                  <div className="space-y-2">
                    {showProgress.subject_performance.map((sp) => (
                      <div key={sp.subject} className="flex items-center justify-between text-sm">
                        <span className="text-muted">{sp.subject}</span>
                        <span className={cn("font-medium", sp.accuracy >= 70 ? "text-green-400" : sp.accuracy >= 50 ? "text-gold" : "text-red")}>
                          {sp.accuracy}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showProgress.exam_history.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Recent Exams</h4>
                  <div className="space-y-2">
                    {showProgress.exam_history.map((exam, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-blue-light/5">
                        <span className="text-muted">{exam.subject}</span>
                        <span className="text-white font-medium">{exam.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalOverlay({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button onClick={onClose} className="text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
