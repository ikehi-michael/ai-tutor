"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore, useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, isInitialized, user, checkAuth } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect to login only AFTER we've checked auth
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Redirect users to their role-specific dashboard if they access the wrong section
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user) return;

    const role = user.role;
    const roleRedirects: Record<string, { allowed: string[]; fallback: string }> = {
      parent: {
        allowed: ["/dashboard/parent", "/dashboard/settings"],
        fallback: "/dashboard/parent",
      },
      school: {
        allowed: ["/dashboard/school", "/dashboard/settings"],
        fallback: "/dashboard/school",
      },
      teacher: {
        allowed: ["/dashboard/teacher", "/dashboard/settings"],
        fallback: "/dashboard/teacher",
      },
    };

    const config = roleRedirects[role];
    if (config && !config.allowed.some((p) => pathname?.startsWith(p))) {
      router.push(config.fallback);
    }
  }, [isInitialized, isAuthenticated, user, pathname, router]);

  // Show loading while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ocean">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-coral border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated after check
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      {/* Mobile Menu Button - Only show when sidebar is closed */}
      <AnimatePresence>
        {isMobile && !isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 left-4 z-50 md:hidden"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="bg-blue/50 backdrop-blur-xl border border-[rgba(255,255,255,0.1)]"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          // Desktop: fixed margin, Mobile: no margin (sidebar overlays)
          isMobile ? "ml-0" : "ml-[280px]"
        )}
      >
        <div className={cn(
          "p-4 md:p-8",
          isMobile && "pt-20" // Add top padding for mobile menu button
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
