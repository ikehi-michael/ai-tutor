"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Upload,
  Camera,
  Mic,
  Sparkles,
  BookOpen,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Copy,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { questionsAPI, QuestionSolution, topicsAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AskAIPage() {
  const searchParams = useSearchParams();
  const [question, setQuestion] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<QuestionSolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  const [subjects] = useState([
    "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
    "Economics", "Geography", "Government", "Literature in English",
    "Commerce", "Accounting", "Agricultural Science"
  ]);

  // Pre-fill subject from URL params (only on initial mount)
  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    const topicParam = searchParams.get("topic");
    
    if (subjectParam) {
      setSelectedSubject(subjectParam);
    }
    
    // Pre-fill question with topic if provided
    if (topicParam) {
      setQuestion(`Can you help me practice questions on ${topicParam}?`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubjectOpen(false);
      }
    };

    if (isSubjectOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSubjectOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!question.trim() && !imageFile) return;

    setIsLoading(true);
    setError(null);
    setSolution(null);

    try {
      let result: QuestionSolution;

      if (imageFile) {
        // Pass any typed text as additional context along with the image
        result = await questionsAPI.solveWithImage(
          imageFile, 
          selectedSubject || undefined,
          question.trim() || undefined  // Additional context from text input
        );
      } else {
        result = await questionsAPI.solve({
          question_text: question,
          subject: selectedSubject || undefined
        });
      }

      setSolution(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to solve question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuestion("");
    setSelectedSubject(null);
    setImageFile(null);
    setImagePreview(null);
    setSolution(null);
    setError(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-foreground mb-2">
          Ask AI Tutor
        </h1>
        <p className="text-muted">
          Type your question or upload an image - get instant step-by-step solutions
        </p>
      </div>

      {/* Input Section */}
      <Card variant="glass">
        <CardContent className="p-6 space-y-4">
          {/* Image Preview */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Question"
                    className="max-h-48 rounded-xl border border-[rgba(255,255,255,0.1)]"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red text-white flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-muted mt-2">
                  Image uploaded. Add additional context below if needed.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Input */}
          <Textarea
            placeholder="Type your question here... e.g., 'Solve: 2x² + 5x - 3 = 0' or 'Explain photosynthesis'"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
          />

          {/* Actions Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Selector */}
            <div ref={subjectDropdownRef} className="relative z-[100]">
              <button
                onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  selectedSubject
                    ? "bg-red/20 text-red border border-red/30"
                    : "bg-blue-light/20 text-muted hover:text-foreground"
                )}
              >
                <BookOpen className="w-4 h-4" />
                {selectedSubject || "Select Subject"}
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  isSubjectOpen && "rotate-180"
                )} />
              </button>

              <AnimatePresence>
                {isSubjectOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 mb-2 w-64 max-h-64 overflow-y-auto rounded-xl bg-blue border border-[rgba(255,255,255,0.1)] shadow-xl z-[100]"
                  >
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setSelectedSubject(null);
                          setIsSubjectOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted hover:bg-blue-light/20"
                      >
                        Auto-detect subject
                      </button>
                      {subjects.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => {
                            setSelectedSubject(subject);
                            setIsSubjectOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            selectedSubject === subject
                              ? "bg-red/20 text-red"
                              : "text-foreground hover:bg-blue-light/20"
                          )}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-light/20 text-muted hover:text-foreground text-sm font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>

            {/* Camera Button (for mobile) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-light/20 text-muted hover:text-foreground text-sm font-medium transition-colors md:hidden"
            >
              <Camera className="w-4 h-4" />
              Camera
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Submit Button */}
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={(!question.trim() && !imageFile) || isLoading}
              isLoading={isLoading}
            >
              {isLoading ? "Solving..." : "Solve Question"}
              {!isLoading && <Send className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red/10 border border-red/20 text-red"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card variant="glass">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red/20 mb-4">
                  <Loader2 className="w-8 h-8 text-red animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  AI is thinking...
                </h3>
                <p className="text-muted text-sm">
                  Analyzing your question and preparing a detailed solution
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solution */}
      <AnimatePresence>
        {solution && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Solution Header */}
            <Card variant="glass" glow="blue">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-light/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-blue-light" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Solution Found!</h3>
                      <p className="text-sm text-muted">
                        {solution.subject} • {solution.topic}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(solution.solution)}
                      className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-blue-light/20 transition-colors"
                      title="Copy solution"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-blue-light/20 transition-colors"
                      title="Ask another question"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question */}
                <div className="p-4 rounded-xl bg-blue-light/10 mb-4">
                  <p className="text-sm text-muted mb-1">Question:</p>
                  <div className="text-foreground">
                    <ContentRenderer content={solution.question_text} />
                  </div>
                </div>

                {/* Final Answer */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-light/20 to-blue/10 border border-blue-light/20">
                  <p className="text-sm text-blue-light mb-1 font-medium">Final Answer:</p>
                  <div className="text-foreground text-lg font-semibold">
                    <ContentRenderer content={solution.solution} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step-by-Step Solution */}
            <Card variant="glass">
              <CardContent className="p-6">
                <h3 className="font-[family-name:var(--font-heading)] font-semibold text-xl text-foreground mb-6">
                  Step-by-Step Solution
                </h3>
                
                <div className="space-y-6">
                  {solution.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-8"
                    >
                      {/* Step Number */}
                      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-red/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-red">{step.step_number}</span>
                      </div>
                      
                      {/* Connector Line */}
                      {index < solution.steps.length - 1 && (
                        <div className="absolute left-[11px] top-6 w-0.5 h-full bg-blue-light/20" />
                      )}

                      <div className="pb-6">
                        <h4 className="font-semibold text-foreground mb-2">
                          {step.description}
                        </h4>
                        
                        {step.formula && (
                          <div className="inline-block px-3 py-1.5 rounded-lg bg-blue-light/10 border border-blue-light/20 text-blue-light text-sm mb-2">
                            <ContentRenderer content={step.formula} />
                          </div>
                        )}
                        
                        <div className="text-muted leading-relaxed">
                          <ContentRenderer content={step.explanation} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Topics */}
            {solution.related_topics && solution.related_topics.length > 0 && (
              <Card variant="glass">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {solution.related_topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-full bg-blue-light/20 text-sm text-muted"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ask Another */}
            <div className="text-center">
              <Button variant="secondary" onClick={handleReset}>
                <Sparkles className="w-4 h-4" />
                Ask Another Question
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && !solution && !error && (
        <Card variant="gradient">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red/10 mb-4">
              <Sparkles className="w-8 h-8 text-red" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ready to Help!
            </h3>
            <p className="text-muted text-sm max-w-md mx-auto">
              Type any question from your WAEC, NECO, or JAMB prep, or upload an image 
              of a question from your textbook. I'll explain it step by step!
            </p>
            
            {/* Example Questions */}
            <div className="mt-6 grid gap-2 max-w-lg mx-auto">
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Try these:</p>
              {[
                "Solve: x² - 5x + 6 = 0",
                "Explain the law of demand",
                "What are the types of waves in Physics?"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuestion(example)}
                  className="p-3 rounded-xl bg-blue-light/10 text-left text-sm text-muted hover:text-foreground hover:bg-blue-light/20 transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
