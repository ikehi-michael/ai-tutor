"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { studyPlansAPI, StudyPlan } from "@/lib/api";
import { StudyPlanContent } from "@/components/study-plan/StudyPlanContent";
import { CreateStudyPlan } from "@/components/study-plan/CreateStudyPlan";
import { EmptyStudyPlan } from "@/components/study-plan/EmptyStudyPlan";

type ViewState = "loading" | "overview" | "create" | "empty";

export default function StudyPlanPage() {
  const [view, setView] = useState<ViewState>("loading");
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch active study plan on mount
  useEffect(() => {
    fetchActivePlan();
  }, []);

  const fetchActivePlan = async () => {
    setView("loading");
    try {
      const plan = await studyPlansAPI.getActive();
      setActivePlan(plan);
      setView("overview");
    } catch (err: any) {
      // No active plan or error
      if (err.response?.status === 404) {
        setView("empty");
      } else {
        setError(err.response?.data?.detail || "Failed to load study plan");
        setView("empty");
      }
    }
  };

  const handlePlanCreated = (plan: StudyPlan) => {
    setActivePlan(plan);
    setView("overview");
  };

  // Loading View
  if (view === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue animate-spin mb-4" />
        <p className="text-muted">Loading your study plan...</p>
      </div>
    );
  }

  // Create Plan View
  if (view === "create") {
    return (
      <CreateStudyPlan
        onBack={() => setView(activePlan ? "overview" : "empty")}
        onPlanCreated={handlePlanCreated}
      />
    );
  }

  // Empty State
  if (view === "empty") {
    return (
      <EmptyStudyPlan onCreatePlan={() => setView("create")} />
    );
  }

  // Overview (Main View)
  if (!activePlan) {
    return null;
  }

  return (
    <StudyPlanContent 
      activePlan={activePlan} 
      onCreateNew={() => setView("create")}
    />
  );
}
