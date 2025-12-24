"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Atom, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(data);
      // Set token in cookie
      login(response.access_token, response.user_id, response.role);
      // Fetch and set user data
      const userProfile = await authAPI.getProfile();
      setUser(userProfile);
      // Navigate to appropriate dashboard based on role
      if (response.role === "parent") {
        router.push("/dashboard/parent");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Background Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-10">
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

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white mb-2">
              Welcome Back!
            </h1>
            <p className="text-muted">
              Log in to continue your learning journey
            </p>
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

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-2 border-muted/50 bg-transparent checked:bg-red checked:border-red"
                />
                <span className="text-sm text-muted">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-red hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Log In
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-muted">
            Don't have an account?{" "}
            <Link href="/register" className="text-red font-semibold hover:underline">
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative bg-gradient-to-br from-blue to-blue-dark p-12">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 border border-red/20 rounded-full" />
          <div className="absolute bottom-32 left-20 w-40 h-40 border border-blue-light/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          className="relative z-10 text-center max-w-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Feature Card */}
          <div className="glass-card p-8 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red to-red-light flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-white mb-4">
              Learn Smarter with AI
            </h2>
            <p className="text-muted leading-relaxed">
              Get instant solutions to any question, personalized study plans, 
              and track your progress towards acing your WAEC and JAMB exams.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <div className="text-2xl font-bold gradient-text">10K+</div>
              <div className="text-xs text-muted">Students</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold gradient-text">500K+</div>
              <div className="text-xs text-muted">Questions Solved</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold gradient-text">98%</div>
              <div className="text-xs text-muted">Pass Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
