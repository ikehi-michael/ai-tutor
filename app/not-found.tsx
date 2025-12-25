"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Home, 
  ArrowLeft, 
  Search,
  BookOpen,
  Brain,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const
    }
  }
};

const numberVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15
    }
  }
};

export default function NotFound() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full text-center"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-8">
          <img 
            src="/images/logo.png" 
            alt="The Stem Studio" 
            className="h-16 mx-auto mb-4"
          />
        </motion.div>

        {/* 404 Number */}
        <motion.div 
          variants={numberVariants}
          className="relative mb-6"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.span
              className="text-9xl md:text-[12rem] font-bold font-heading bg-gradient-to-r from-red via-red-light to-red bg-clip-text text-transparent"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              4
            </motion.span>
            <motion.div
              className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue to-red flex items-center justify-center"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <AlertCircle className="w-10 h-10 md:w-16 md:h-16 text-white" />
            </motion.div>
            <motion.span
              className="text-9xl md:text-[12rem] font-bold font-heading bg-gradient-to-r from-blue via-blue-light to-blue bg-clip-text text-transparent"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              4
            </motion.span>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto">
            Oops! The page you're looking for seems to have wandered off into the quantum realm. 
            Don't worry, even Einstein got lost sometimes!
          </p>
        </motion.div>

        {/* Decorative Icons */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center gap-8 mb-12 opacity-20"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Brain className="w-8 h-8 text-blue" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <BookOpen className="w-8 h-8 text-red" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            <Search className="w-8 h-8 text-gold" />
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            variant="primary"
            onClick={() => router.back()}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => router.push(isAuthenticated ? "/dashboard" : "/")}
            className="group"
          >
            <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            {isAuthenticated ? "Go to Dashboard" : "Go Home"}
          </Button>
        </motion.div>

        {/* Helpful Links */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.1)]"
        >
          <p className="text-sm text-muted mb-4">Maybe you were looking for:</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/dashboard/ask" 
              className="text-blue hover:text-blue-light transition-colors text-sm"
            >
              Ask AI Tutor
            </Link>
            <span className="text-muted">•</span>
            <Link 
              href="/dashboard/topics" 
              className="text-blue hover:text-blue-light transition-colors text-sm"
            >
              Learn Topics
            </Link>
            <span className="text-muted">•</span>
            <Link 
              href="/dashboard/exams" 
              className="text-blue hover:text-blue-light transition-colors text-sm"
            >
              Mock Exams
            </Link>
            <span className="text-muted">•</span>
            <Link 
              href="/dashboard/study-plan" 
              className="text-blue hover:text-blue-light transition-colors text-sm"
            >
              Study Plan
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

