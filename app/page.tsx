"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Brain, 
  BookOpen, 
  Target, 
  Clock, 
  TrendingUp, 
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  Star,
  Zap,
  LayoutDashboard,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuthStore } from "@/lib/store";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export default function LandingPage() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
    setIsInitialized(true);
  }, [checkAuth]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [isAuthenticated]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Determine dashboard URL based on user role
  const dashboardUrl = user?.role === "parent" ? "/dashboard/parent" : "/dashboard";

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-blue-dark/80 border-b border-[rgba(255,255,255,0.05)]">
        <div className="container-app">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/logo.png" 
                  alt="The Stem Studio" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <span className="font-[family-name:var(--font-heading)] font-bold text-xl text-white">
                  The Stem Studio
                </span>
              </div>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-muted hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#subjects" className="text-muted hover:text-white transition-colors">
                Subjects
              </Link>
              <Link href="#pricing" className="text-muted hover:text-white transition-colors">
                Pricing
              </Link>
            </div>

            {/* Auth Buttons - Desktop Only */}
            <div className="hidden md:flex items-center gap-3">
              {isInitialized && isAuthenticated ? (
                <Link href={dashboardUrl}>
                  <Button variant="primary" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Log In</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger Menu Button - Mobile Only */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-red transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer - Slides from Right */}
      <motion.div
        initial={false}
        animate={{
          x: isMobileMenuOpen ? 0 : "100%"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-blue-dark border-l border-[rgba(255,255,255,0.05)] z-50 md:hidden overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-white hover:text-red transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-4">
            <Link 
              href="#features" 
              className="text-white hover:text-red transition-colors py-2 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#subjects" 
              className="text-white hover:text-red transition-colors py-2 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Subjects
            </Link>
            <Link 
              href="#pricing" 
              className="text-white hover:text-red transition-colors py-2 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
          </div>

          {/* Mobile Auth Buttons */}
          <div className="flex flex-col gap-3 pt-6 border-t border-[rgba(255,255,255,0.1)]">
            {isInitialized && isAuthenticated ? (
              <Link href={dashboardUrl} onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Log In</Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-light/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="container-app py-20">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Badge */}
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red/10 border border-red/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-red" />
              <span className="text-sm font-medium text-red">AI-Powered STEM Learning</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-[family-name:var(--font-heading)] font-bold text-white mb-6"
            >
              The Future of{" "}
              <span className="gradient-text">Nigerian Education</span>
              <br />
              Starts Here
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10"
            >
              Are you ready to ace your exams? Step-by-step solutions, personalized study plans, 
              and instant topic mastery—powered by AI, built for Nigerian students.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              {isInitialized && isAuthenticated ? (
                <Link href={dashboardUrl}>
                  <Button variant="primary" size="lg">
                    <LayoutDashboard className="w-5 h-5" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button variant="primary" size="lg">
                      <Zap className="w-5 h-5" />
                      Start Learning
                    </Button>
                  </Link>
                  <Button variant="secondary" size="lg">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </Button>
                </>
              )}
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center gap-8 text-muted"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-red/50 to-blue-light/50 border-2 border-blue-dark"
                    />
                  ))}
                </div>
                <span className="text-sm">10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-sm">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="text-sm">WAEC/JAMB Aligned</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        {/* <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-red" />
          </div>
        </motion.div> */}
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container-app">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.span 
              variants={fadeInUp}
              className="text-red font-semibold mb-4 block"
            >
              FEATURES
            </motion.span>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-white mb-4"
            >
              Everything You Need to{" "}
              <span className="gradient-text">Succeed</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-muted max-w-2xl mx-auto"
            >
              Powerful AI tools designed specifically for Nigerian secondary school students
            </motion.p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={scaleIn}>
                <Card variant="glass" hover className="h-full">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-[family-name:var(--font-heading)] font-semibold text-xl text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red/5 to-transparent" />
        
        <div className="container-app relative">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.span 
              variants={fadeInUp}
              className="text-blue-light font-semibold mb-4 block"
            >
              HOW IT WORKS
            </motion.span>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-white mb-4"
            >
              Start Learning in{" "}
              <span className="text-blue-light">3 Simple Steps</span>
            </motion.h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-red/50 to-transparent" />
                )}
                
                <div className="text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red/20 to-blue-light/20 flex items-center justify-center">
                      <span className="text-4xl font-[family-name:var(--font-heading)] font-bold gradient-text">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] font-semibold text-xl text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container-app">
          <motion.div 
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red via-red-dark to-blue-dark p-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            <div className="bg-blue-dark rounded-[22px] p-12 md:p-16 text-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-40 h-40 border border-white/30 rounded-full" />
                <div className="absolute bottom-10 right-10 w-60 h-60 border border-white/30 rounded-full" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-white mb-6">
                  Ready to Transform Your{" "}
                  <span className="gradient-text">Study Life?</span>
                </h2>
                <p className="text-muted text-lg max-w-2xl mx-auto mb-10">
                  Join thousands of Nigerian students already using The Stem Studio to prepare for their exams smarter, not harder.
                </p>
                {isInitialized && isAuthenticated ? (
                  <Link href={dashboardUrl}>
                    <Button variant="primary" size="lg">
                      <LayoutDashboard className="w-5 h-5" />
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button variant="primary" size="lg">
                      <Zap className="w-5 h-5" />
                      Get Started
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
                {/* <p className="text-muted/70 text-sm mt-6">
                  No credit card required • 10 free questions per week
                </p> */}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[rgba(255,255,255,0.05)]">
        <div className="container-app">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/logo.png" 
                  alt="The Stem Studio" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-[family-name:var(--font-heading)] font-bold text-white">
                The Stem Studio
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted">
              <Link href="/" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>

            <p className="text-sm text-muted">
              © 2025 The Stem Studio.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Features data
const features = [
  {
    icon: Brain,
    title: "AI Question Solver",
    description: "Upload any question or snap a photo - get instant step-by-step solutions with explanations you can actually understand.",
    color: "bg-gradient-to-br from-red to-red-light"
  },
  {
    icon: BookOpen,
    title: "Topic-by-Topic Teaching",
    description: "Learn any topic from the WAEC/JAMB syllabus with clear explanations, examples, and practice questions.",
    color: "bg-gradient-to-br from-blue-light to-sky"
  },
  {
    icon: Target,
    title: "Mock Exams",
    description: "Take realistic mock tests with timed questions from past papers. Get instant scoring and detailed feedback.",
    color: "bg-gradient-to-br from-blue to-blue-light"
  },
  {
    icon: Clock,
    title: "Personalized Study Plans",
    description: "AI generates a custom study schedule based on your available time, weak areas, and exam date.",
    color: "bg-gradient-to-br from-gold to-warning"
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "See your improvement over time, identify weak topics, and stay motivated with study streaks.",
    color: "bg-gradient-to-br from-success to-blue-lighter"
  },
  {
    icon: Users,
    title: "Parent Dashboard",
    description: "Parents can monitor progress, see study time, and get recommendations to support their child's learning.",
    color: "bg-gradient-to-br from-blue-dark to-navy"
  }
];

// Steps data
const steps = [
  {
    title: "Sign Up & Choose Subjects",
    description: "Create your free account in seconds and select the subjects you're preparing for."
  },
  {
    title: "Ask Questions or Study Topics",
    description: "Type any question, upload an image, or browse topics. Our AI tutors you instantly."
  },
  {
    title: "Practice & Track Progress",
    description: "Take mock exams, follow your study plan, and watch your scores improve day by day."
  }
];
