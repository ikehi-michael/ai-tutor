"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Mail, 
  Lock, 
  User, 
  Phone,
  Atom, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { authAPI, RegisterData } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Subjects list
const SUBJECTS = [
  "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
  "Economics", "Geography", "Government", "Literature in English",
  "Commerce", "Accounting", "Agricultural Science", "Civic Education",
  "Computer Studies", "Further Mathematics"
];

// Validation schemas for each step
const step1Schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const step2Schema = z.object({
  role: z.enum(["student", "parent"]),
  student_class: z.enum(["SS1", "SS2", "SS3", "JAMB"]).optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login, setUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data storage
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data || {},
  });

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data || { role: "student" },
  });

  const handleStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: Step2Data) => {
    // For parents, explicitly clear student_class
    if (data.role === "parent") {
      setStep2Data({ role: "parent", student_class: undefined });
    } else {
      setStep2Data(data);
    }
    setCurrentStep(3);
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleFinalSubmit = async () => {
    if (!step1Data || !step2Data) return;
    if (step2Data.role === "student" && selectedSubjects.length < 4) {
      setError("Please select at least 4 subjects");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registerData: RegisterData = {
        ...step1Data,
        ...step2Data,
        subjects: selectedSubjects,
      };

      const response = await authAPI.register(registerData);
      // Set token in cookie
      login(response.access_token, response.user_id, response.role);
      // Fetch and set user data
      const userProfile = await authAPI.getProfile();
      setUser(userProfile);
      // Navigate to appropriate dashboard based on role
      if (step2Data.role === "parent") {
        router.push("/dashboard/parent");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-light/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          className="w-full max-w-lg relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src="/images/logo.png" 
                alt="The Stem Studio" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-[family-name:var(--font-heading)] font-bold text-xl text-white">
              The Stem Studio
            </span>
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    currentStep >= step
                      ? "bg-gradient-to-br from-red to-red-light text-white"
                      : "bg-blue-light/20 text-muted"
                  )}
                >
                  {currentStep > step ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={cn(
                      "w-12 h-1 rounded-full transition-all",
                      currentStep > step ? "bg-red" : "bg-blue-light/20"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red/10 border border-red/20 text-red text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-muted">
                    Start your journey to exam success
                  </p>
                </div>

                <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-5">
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    leftIcon={<User className="w-5 h-5" />}
                    error={step1Form.formState.errors.full_name?.message}
                    {...step1Form.register("full_name")}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    leftIcon={<Mail className="w-5 h-5" />}
                    error={step1Form.formState.errors.email?.message}
                    {...step1Form.register("email")}
                  />

                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    placeholder="08012345678"
                    leftIcon={<Phone className="w-5 h-5" />}
                    error={step1Form.formState.errors.phone?.message}
                    {...step1Form.register("phone")}
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a strong password"
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={step1Form.formState.errors.password?.message}
                    hint="Must be at least 8 characters"
                    {...step1Form.register("password")}
                  />

                  <Button type="submit" variant="primary" size="lg" fullWidth>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Role & Class */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white mb-2">
                    Tell Us About Yourself
                  </h1>
                  <p className="text-muted">
                    This helps us personalize your experience
                  </p>
                </div>

                <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
                  {/* Form Error Display */}
                  {step2Form.formState.errors.role && (
                    <div className="p-3 rounded-lg bg-red/10 border border-red/20 text-red text-sm">
                      {step2Form.formState.errors.role.message}
                    </div>
                  )}

                  {/* Role Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/90">
                      I am a...
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: "student", label: "Student", icon: Atom },
                        { value: "parent", label: "Parent", icon: User },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            "flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all",
                            step2Form.watch("role") === option.value
                              ? "border-red bg-red/10"
                              : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                          )}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            {...step2Form.register("role", {
                              onChange: (e) => {
                                // Clear student_class when switching to parent
                                if (e.target.value === "parent") {
                                  step2Form.setValue("student_class", undefined);
                                }
                              }
                            })}
                            className="sr-only"
                          />
                          <option.icon className={cn(
                            "w-8 h-8",
                            step2Form.watch("role") === option.value ? "text-red" : "text-muted"
                          )} />
                          <span className={cn(
                            "font-medium",
                            step2Form.watch("role") === option.value ? "text-white" : "text-muted"
                          )}>
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Class Selection (for students) */}
                  {step2Form.watch("role") === "student" && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-white/90">
                        Your Current Class
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {["SS1", "SS2", "SS3", "JAMB"].map((cls) => (
                          <label
                            key={cls}
                            className={cn(
                              "flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                              step2Form.watch("student_class") === cls
                                ? "border-blue-light bg-blue-light/10 text-blue-light"
                                : "border-[rgba(255,255,255,0.1)] text-muted hover:border-[rgba(255,255,255,0.2)]"
                            )}
                          >
                            <input
                              type="radio"
                              value={cls}
                              {...step2Form.register("student_class")}
                              className="sr-only"
                            />
                            <span className="font-semibold">{cls}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </Button>
                    <Button type="submit" variant="primary" size="lg" fullWidth>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Subject Selection */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white mb-2">
                    {step2Data?.role === "student" ? "Select Your Subjects" : "Almost Done!"}
                  </h1>
                  <p className="text-muted">
                    {step2Data?.role === "student" 
                      ? "Choose at least 4 subjects you're preparing for"
                      : "Click below to complete your registration"
                    }
                  </p>
                </div>

                {step2Data?.role === "student" && (
                  <>
                    <div className="flex flex-wrap gap-3 mb-8">
                      {SUBJECTS.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={cn(
                            "px-4 py-2.5 rounded-full text-sm font-medium transition-all",
                            selectedSubjects.includes(subject)
                              ? "bg-gradient-to-r from-red to-red-light text-white shadow-lg shadow-red/30"
                              : "bg-blue-light/20 text-muted hover:text-white"
                          )}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-muted mb-6">
                      {selectedSubjects.length} of 4+ subjects selected
                    </p>
                  </>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                    onClick={handleFinalSubmit}
                    disabled={step2Data?.role === "student" && selectedSubjects.length < 4}
                  >
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Link */}
          <p className="mt-8 text-center text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-red font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative bg-gradient-to-br from-blue to-blue-dark p-12">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 border border-blue-light/20 rounded-full" />
          <div className="absolute bottom-32 right-20 w-40 h-40 border border-red/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-light/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          className="relative z-10 max-w-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Feature List */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-white mb-6">
              What You'll Get
            </h2>
            <ul className="space-y-4">
              {[
                "AI-powered question solving",
                "Personalized study plans",
                "Topic-by-topic explanations",
                "Mock exams with instant feedback",
                "Progress tracking dashboard",
                "10 free questions every week"
              ].map((item, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-3 text-muted"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-light/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-light" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
