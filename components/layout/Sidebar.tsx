"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Atom,
  LayoutDashboard,
  Brain,
  BookOpen,
  FileQuestion,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
  Crown,
  Users,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, useUIStore } from "@/lib/store";
import { dashboardAPI } from "@/lib/api";

// Student navigation
const studentNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ask AI", href: "/dashboard/ask", icon: Brain },
  { name: "Learn Topics", href: "/dashboard/topics", icon: BookOpen },
  { name: "Mock Exams", href: "/dashboard/exams", icon: FileQuestion },
  { name: "Study Plan", href: "/dashboard/study-plan", icon: Calendar },
  { name: "Progress", href: "/dashboard/progress", icon: TrendingUp },
];

// Parent navigation
const parentNavigation = [
  { name: "Children Overview", href: "/dashboard/parent", icon: LayoutDashboard },
];

const bottomNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
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

  // Fetch streak for students
  useEffect(() => {
    if (user?.role === "student") {
      const fetchStreak = async () => {
        try {
          const data = await dashboardAPI.getStudentOverview();
          setStreak(data.stats.study_streak_days);
        } catch (error) {
          // Silently fail - streak will show 0
          setStreak(0);
        }
      };
      fetchStreak();
    }
  }, [user?.role]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      <motion.aside
        className={cn(
          "fixed left-0 top-0 h-screen z-40 flex flex-col",
          "bg-blue/50 backdrop-blur-xl border-r border-[rgba(255,255,255,0.05)]",
          "transition-all duration-300",
          // Mobile: slide in/out, Desktop: always visible
          isMobile && !isSidebarOpen && "-translate-x-full"
        )}
        animate={{ 
          width: isMobile ? 280 : (isCollapsed ? 80 : 280),
          x: isMobile && !isSidebarOpen ? -280 : 0
        }}
      >
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.05)]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img 
              src="/images/logo.png" 
              alt="The Stem Studio" 
              className="w-full h-full object-contain"
            />
          </div>
          <AnimatePresence>
            {(!isCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <span className="font-[family-name:var(--font-heading)] font-bold text-lg text-white whitespace-nowrap">
                  The Stem Studio
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-lg bg-blue-light/20 flex items-center justify-center text-muted hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg bg-blue-light/20 flex items-center justify-center text-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.05)]">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-blue-light/10",
          isCollapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red to-red-light flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">
              {user?.full_name?.charAt(0) || "?"}
            </span>
          </div>
          <AnimatePresence>
            {(!isCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="font-medium text-white text-sm truncate">
                  {user?.full_name || "Loading..."}
                </p>
                {user?.role === "student" && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 text-gold">
                      <Flame className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {streak !== null ? `${streak} day${streak !== 1 ? 's' : ''} streak` : '...'}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Main Navigation - Show based on user role */}
        {(user?.role === "parent" ? parentNavigation : studentNavigation).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive
                  ? "bg-gradient-to-r from-red/20 to-red-light/10 text-red"
                  : "text-muted hover:bg-blue-light/10 hover:text-white",
                isCollapsed && !isMobile && "justify-center px-3"
              )}
              onClick={() => isMobile && toggleSidebar()}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {(!isCollapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (!isCollapsed || isMobile) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-red"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner */}
      {(!isCollapsed || isMobile) && user?.subscription_tier === "free" && (
        <div className="p-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-red/20 to-blue-light/10 border border-red/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-gold" />
              <span className="font-semibold text-white">Go Premium</span>
            </div>
            <p className="text-xs text-muted mb-3">
              Unlimited questions & all features
            </p>
            <Link
              href="/dashboard/upgrade"
              className="block w-full py-2 text-center text-sm font-semibold rounded-lg bg-gradient-to-r from-red to-red-light text-white"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.05)] space-y-2">
        {bottomNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-blue-light/10 hover:text-white transition-all",
              isCollapsed && !isMobile && "justify-center px-3"
            )}
            onClick={() => isMobile && toggleSidebar()}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="font-medium">{item.name}</span>
            )}
          </Link>
        ))}
        <button
          onClick={() => {
            if (isMobile) toggleSidebar();
            logout();
          }}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl w-full text-muted hover:bg-red/10 hover:text-red transition-all",
            isCollapsed && !isMobile && "justify-center px-3"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span className="font-medium">Log Out</span>
          )}
        </button>
      </div>
    </motion.aside>
    </>
  );
}
