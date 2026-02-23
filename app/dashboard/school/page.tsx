"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  GraduationCap,
  Activity,
  TrendingUp,
  Plus,
  Trash2,
  Copy,
  RefreshCw,
  Search,
  X,
  UserPlus,
  Eye,
  Building2,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import {
  institutionAPI,
  InstitutionProfile,
  TeacherProfile,
  InstitutionStudent,
  InstitutionOverview,
  StudentProgress,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type Tab = "overview" | "teachers" | "students" | "settings";

export default function SchoolDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [institution, setInstitution] = useState<InstitutionProfile | null>(null);
  const [overview, setOverview] = useState<InstitutionOverview | null>(null);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [students, setStudents] = useState<InstitutionStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showProgress, setShowProgress] = useState<StudentProgress | null>(null);

  // Forms
  const [teacherForm, setTeacherForm] = useState({ email: "", full_name: "", password: "" });
  const [studentForm, setStudentForm] = useState({ email: "", full_name: "", password: "", student_class: "" });
  const [assignTeacherId, setAssignTeacherId] = useState<number | null>(null);
  const [assignStudentIds, setAssignStudentIds] = useState<number[]>([]);

  // Settings form
  const [settingsForm, setSettingsForm] = useState({ name: "", address: "", phone: "" });
  const [codeCopied, setCodeCopied] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [inst, ov, teacherList, studentList] = await Promise.all([
        institutionAPI.getInstitution(),
        institutionAPI.getOverview(),
        institutionAPI.getTeachers(),
        institutionAPI.getStudents(),
      ]);
      setInstitution(inst);
      setOverview(ov);
      setTeachers(teacherList);
      setStudents(studentList);
      setSettingsForm({ name: inst.name, address: inst.address || "", phone: inst.phone || "" });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddTeacher = async () => {
    setFormLoading(true);
    try {
      await institutionAPI.addTeacher(teacherForm);
      setTeacherForm({ email: "", full_name: "", password: "" });
      setShowAddTeacher(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add teacher");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveTeacher = async (id: number) => {
    if (!confirm("Remove this teacher?")) return;
    try {
      await institutionAPI.removeTeacher(id);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to remove teacher");
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

  const handleRemoveStudent = async (id: number) => {
    if (!confirm("Remove this student from the institution?")) return;
    try {
      await institutionAPI.removeStudent(id);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to remove student");
    }
  };

  const handleAssignStudents = async () => {
    if (!assignTeacherId || assignStudentIds.length === 0) return;
    setFormLoading(true);
    try {
      await institutionAPI.assignStudents(assignTeacherId, assignStudentIds);
      setShowAssign(false);
      setAssignTeacherId(null);
      setAssignStudentIds([]);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to assign students");
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewProgress = async (studentId: number) => {
    try {
      const progress = await institutionAPI.getStudentProgress(studentId);
      setShowProgress(progress);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load progress");
    }
  };

  const handleCopyCode = () => {
    if (institution?.invite_code) {
      navigator.clipboard.writeText(institution.invite_code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleRegenerateCode = async () => {
    try {
      const { invite_code } = await institutionAPI.regenerateInviteCode();
      setInstitution((prev) => (prev ? { ...prev, invite_code } : prev));
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to regenerate code");
    }
  };

  const handleUpdateSettings = async () => {
    setFormLoading(true);
    try {
      await institutionAPI.updateInstitution(settingsForm);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update");
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
    { key: "teachers", label: "Teachers", icon: GraduationCap },
    { key: "students", label: "Students", icon: Users },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-white">
          {institution?.name || "School Dashboard"}
        </h1>
        <p className="text-muted mt-1">Manage your institution, teachers, and students</p>
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
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ─── Overview ─────────────────────────────────── */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Students", value: overview?.total_students ?? 0, icon: Users, color: "text-blue-light" },
                { label: "Teachers", value: overview?.total_teachers ?? 0, icon: GraduationCap, color: "text-green-400" },
                { label: "Active Today", value: overview?.active_today ?? 0, icon: Activity, color: "text-gold" },
                { label: "Avg Score", value: `${overview?.avg_score ?? 0}%`, icon: TrendingUp, color: "text-red" },
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

            {/* Invite Code Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Invite Code</h3>
                <p className="text-sm text-muted mb-4">Share this code with students so they can join your institution</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 px-4 py-3 rounded-lg bg-blue-light/10 text-blue-light font-mono text-lg tracking-widest">
                    {institution?.invite_code}
                  </code>
                  <Button variant="secondary" size="sm" onClick={handleCopyCode}>
                    <Copy className="w-4 h-4" />
                    {codeCopied ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRegenerateCode}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-light/5 border border-blue-light/10">
                    <p className="text-2xl font-bold text-white">{overview?.total_questions_answered ?? 0}</p>
                    <p className="text-sm text-muted">Total Questions Answered</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-light/5 border border-blue-light/10">
                    <p className="text-2xl font-bold text-white">
                      {institution?.max_students ? `${overview?.total_students ?? 0}/${institution.max_students}` : "N/A"}
                    </p>
                    <p className="text-sm text-muted">Student Capacity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Teachers ─────────────────────────────────── */}
        {activeTab === "teachers" && (
          <motion.div key="teachers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Teachers ({teachers.length}/{institution?.max_teachers ?? 10})
              </h2>
              <Button variant="primary" size="sm" onClick={() => setShowAddTeacher(true)}>
                <Plus className="w-4 h-4" />
                Add Teacher
              </Button>
            </div>

            {teachers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <GraduationCap className="w-12 h-12 text-muted mx-auto mb-3" />
                  <p className="text-muted">No teachers added yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {teachers.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400/20 to-green-600/20 flex items-center justify-center">
                          <span className="text-green-400 font-semibold">{t.full_name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{t.full_name}</p>
                          <p className="text-sm text-muted">{t.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted">{t.student_count} students</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAssignTeacherId(t.id);
                            setAssignStudentIds([]);
                            setShowAssign(true);
                          }}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveTeacher(t.id)} className="text-red hover:text-red">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
                  <p className="text-muted">{students.length === 0 ? "No students yet" : "No students match your search"}</p>
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
                        {s.assigned_teacher && (
                          <span className="text-xs text-muted hidden sm:block">{s.assigned_teacher}</span>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleViewProgress(s.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveStudent(s.id)} className="text-red hover:text-red">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Settings ─────────────────────────────────── */}
        {activeTab === "settings" && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-5">
                <h3 className="text-lg font-semibold text-white">School Information</h3>
                <Input
                  label="School Name"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, name: e.target.value }))}
                  leftIcon={<Building2 className="w-5 h-5" />}
                />
                <Input
                  label="Address"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, address: e.target.value }))}
                />
                <Input
                  label="Phone"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, phone: e.target.value }))}
                />
                <Button variant="primary" size="lg" isLoading={formLoading} onClick={handleUpdateSettings}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Invite Code</h3>
                <p className="text-sm text-muted mb-4">Students can use this code during registration to join your institution</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 px-4 py-3 rounded-lg bg-blue-light/10 text-blue-light font-mono text-lg tracking-widest">
                    {institution?.invite_code}
                  </code>
                  <Button variant="secondary" size="sm" onClick={handleCopyCode}>
                    <Copy className="w-4 h-4" />
                    {codeCopied ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRegenerateCode}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Limits</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted">Max Students</p>
                    <p className="text-white font-semibold">{institution?.max_students}</p>
                  </div>
                  <div>
                    <p className="text-muted">Max Teachers</p>
                    <p className="text-white font-semibold">{institution?.max_teachers}</p>
                  </div>
                  <div>
                    <p className="text-muted">Subscription</p>
                    <p className="text-white font-semibold capitalize">{institution?.subscription_tier}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modals ──────────────────────────────────────── */}

      {/* Add Teacher Modal */}
      <AnimatePresence>
        {showAddTeacher && (
          <Modal onClose={() => setShowAddTeacher(false)} title="Add Teacher">
            <div className="space-y-4">
              <Input label="Email" value={teacherForm.email} onChange={(e) => setTeacherForm((f) => ({ ...f, email: e.target.value }))} placeholder="teacher@example.com" />
              <Input label="Full Name" value={teacherForm.full_name} onChange={(e) => setTeacherForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Full name" />
              <Input label="Password" type="password" value={teacherForm.password} onChange={(e) => setTeacherForm((f) => ({ ...f, password: e.target.value }))} placeholder="Set a password" hint="Required for new accounts" />
              <Button variant="primary" fullWidth isLoading={formLoading} onClick={handleAddTeacher}>
                Add Teacher
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddStudent && (
          <Modal onClose={() => setShowAddStudent(false)} title="Add Student">
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
          </Modal>
        )}
      </AnimatePresence>

      {/* Assign Students Modal */}
      <AnimatePresence>
        {showAssign && (
          <Modal onClose={() => setShowAssign(false)} title="Assign Students to Teacher">
            <div className="space-y-4">
              <p className="text-sm text-muted">Select students to assign:</p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {students.map((s) => (
                  <label
                    key={s.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      assignStudentIds.includes(s.id)
                        ? "bg-blue-light/10 border border-blue-light/20"
                        : "border border-transparent hover:bg-blue-light/5"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={assignStudentIds.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) setAssignStudentIds((ids) => [...ids, s.id]);
                        else setAssignStudentIds((ids) => ids.filter((id) => id !== s.id));
                      }}
                      className="accent-blue-400"
                    />
                    <div>
                      <p className="text-sm text-white">{s.full_name}</p>
                      <p className="text-xs text-muted">{s.email}</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button
                variant="primary"
                fullWidth
                isLoading={formLoading}
                onClick={handleAssignStudents}
                disabled={assignStudentIds.length === 0}
              >
                Assign {assignStudentIds.length} Student{assignStudentIds.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Student Progress Modal */}
      <AnimatePresence>
        {showProgress && (
          <Modal onClose={() => setShowProgress(null)} title={`${showProgress.student.name}'s Progress`}>
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
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Reusable Modal ───────────────────────────────────────────── */

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
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
