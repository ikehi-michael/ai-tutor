"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lightbulb,
  BookMarked,
  Sparkles,
  Brain,
  Play,
  RefreshCw,
  ArrowLeft,
  Copy
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { TopicChat } from "./TopicChat";
import { TopicTeachResponse } from "@/lib/api";

interface LessonContentProps {
  lessonContent: TopicTeachResponse;
  selectedSubject: { name: string; color: string };
  difficulty: "simple" | "medium" | "advanced";
  onBack: () => void;
  onSimplify: () => void;
  onCopy: (text: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function LessonContent({
  lessonContent,
  selectedSubject,
  difficulty,
  onBack,
  onSimplify,
  onCopy
}: LessonContentProps) {
  const router = useRouter();

  const handlePracticeWithAI = () => {
    // Navigate to Ask AI page with subject and topic pre-filled
    const params = new URLSearchParams({
      subject: selectedSubject.name,
      topic: lessonContent.topic
    });
    router.push(`/dashboard/ask?${params.toString()}`);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Summary Card */}
      <motion.div variants={itemVariants}>
        <Card variant="gradient" glow="blue">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Quick Summary</h3>
                <div className="text-muted leading-relaxed">
                  <ContentRenderer content={lessonContent.summary} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Explanation */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red/20 flex items-center justify-center">
                  <BookMarked className="w-5 h-5 text-red" />
                </div>
                <h3 className="font-semibold text-foreground">Detailed Explanation</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onCopy(lessonContent.detailed_explanation)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onSimplify}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Simplify
                </Button>
              </div>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="text-muted leading-relaxed">
                <ContentRenderer content={lessonContent.detailed_explanation} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Examples */}
      {lessonContent.examples && lessonContent.examples.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground">Worked Examples</h3>
              </div>
              <div className="space-y-4">
                {lessonContent.examples.map((example, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-blue-light/10 border border-blue-light/20"
                  >
                    <p className="text-sm text-muted mb-2">Example {index + 1}</p>
                    <div className="text-foreground">
                      <ContentRenderer content={example} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Practice Questions */}
      {lessonContent.practice_questions && lessonContent.practice_questions.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-red" />
                </div>
                <h3 className="font-semibold text-foreground">Practice Questions</h3>
              </div>
              <div className="space-y-3">
                {lessonContent.practice_questions.map((question, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-card hover:bg-blue-light/10 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue/20 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="text-muted group-hover:text-foreground transition-colors">
                        <ContentRenderer content={question} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* YouTube Video Embed */}
      {lessonContent.youtube_video_id && (
        <motion.div variants={itemVariants}>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red/20 flex items-center justify-center">
                  <Play className="w-5 h-5 text-red" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Video Lesson</h3>
                  <p className="text-sm text-muted">Watch a visual explanation of this topic</p>
                </div>
              </div>
              <YouTubeEmbed videoId={lessonContent.youtube_video_id} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Topic Chat */}
      {lessonContent.lesson_id && (
        <motion.div variants={itemVariants}>
          <TopicChat
            lessonId={lessonContent.lesson_id}
            subject={selectedSubject.name}
            topic={lessonContent.topic}
          />
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex gap-4">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Topics
        </Button>
        {/* <Button variant="primary" className="flex-1" onClick={handlePracticeWithAI}>
          <Brain className="w-4 h-4 mr-2" />
          Practice with AI
        </Button> */}
      </motion.div>
    </motion.div>
  );
}

