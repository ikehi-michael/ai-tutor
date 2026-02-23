"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  MapPin,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { institutionAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { authAPI } from "@/lib/api";

const schema = z.object({
  school_name: z.string().min(2, "School name must be at least 2 characters"),
  admin_name: z.string().min(2, "Admin name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SchoolFormData = z.infer<typeof schema>;

export default function SchoolRegisterPage() {
  const router = useRouter();
  const { login, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schema),
  });

  const handleSubmit = async (data: SchoolFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await institutionAPI.register({
        school_name: data.school_name,
        admin_name: data.admin_name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: data.address,
      });

      login(response.access_token, response.user_id, response.role);
      const userProfile = await authAPI.getProfile();
      setUser(userProfile);
      router.push("/dashboard/school");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-light/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          className="w-full max-w-lg relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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

          <div className="mb-8">
            <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white mb-2">
              Register Your School
            </h1>
            <p className="text-muted">
              Set up your institution to manage teachers and students
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red/10 border border-red/20 text-red text-sm"
            >
              {error}
            </motion.div>
          )}

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            <Input
              label="School Name"
              placeholder="e.g. Greenfield Academy"
              leftIcon={<Building2 className="w-5 h-5" />}
              error={form.formState.errors.school_name?.message}
              {...form.register("school_name")}
            />

            <Input
              label="Administrator Name"
              placeholder="Full name of the school admin"
              leftIcon={<User className="w-5 h-5" />}
              error={form.formState.errors.admin_name?.message}
              {...form.register("admin_name")}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="school@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="08012345678"
              leftIcon={<Phone className="w-5 h-5" />}
              {...form.register("phone")}
            />

            <Input
              label="Address (Optional)"
              placeholder="School address"
              leftIcon={<MapPin className="w-5 h-5" />}
              {...form.register("address")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              leftIcon={<Lock className="w-5 h-5" />}
              error={form.formState.errors.password?.message}
              hint="Must be at least 8 characters"
              {...form.register("password")}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Register School
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <p className="mt-8 text-center text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-red font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
          <p className="mt-2 text-center text-muted">
            Registering as a student?{" "}
            <Link
              href="/register"
              className="text-blue-light font-semibold hover:underline"
            >
              Student registration
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative bg-gradient-to-br from-blue to-blue-dark p-12">
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
          <div className="glass-card p-8">
            <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-white mb-6">
              Why Register Your School?
            </h2>
            <ul className="space-y-4">
              {[
                "Manage all your students in one place",
                "Add teachers and assign them students",
                "Monitor student progress and performance",
                "Share an invite code for easy student onboarding",
                "Assign topics and track completion",
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
