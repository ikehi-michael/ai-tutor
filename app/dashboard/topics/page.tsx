"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Search,
  ArrowLeft,
  Copy
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LessonContent } from "@/components/topics/LessonContent";
import { cn } from "@/lib/utils";
import { topicsAPI, TopicTeachResponse } from "@/lib/api";

// WAEC/JAMB Subject list with topics
const SUBJECTS_DATA = [
  {
    name: "Mathematics",
    icon: "📐",
    color: "from-blue to-blue-light",
    topics: [
      "Number Bases",
      "Indices & Logarithms",
      "Surds",
      "Sequences & Series",
      "Quadratic Equations",
      "Polynomials",
      "Simultaneous Equations",
      "Sets & Venn Diagrams",
      "Functions",
      "Probability",
      "Statistics",
      "Trigonometry",
      "Coordinate Geometry",
      "Mensuration",
      "Vectors",
      "Differentiation",
      "Integration",
      "Matrices & Determinants",
      "Linear Programming"
    ]
  },

  {
    name: "Physics",
    icon: "⚛️",
    color: "from-red to-red-light",
    topics: [
      "Physical Quantities & Units",
      "Scalars & Vectors",
      "Motion",
      "Newton’s Laws of Motion",
      "Work, Energy & Power",
      "Momentum & Collisions",
      "Pressure",
      "Elasticity",
      "Heat & Temperature",
      "Thermal Expansion",
      "Waves",
      "Sound",
      "Light & Optics",
      "Electric Charges & Fields",
      "Current Electricity",
      "Magnetism",
      "Electromagnetic Induction",
      "Alternating Current",
      "Atomic Physics",
      "Nuclear Physics"
    ]
  },

  {
    name: "Chemistry",
    icon: "🧪",
    color: "from-green-500 to-emerald-400",
    topics: [
      "Symbols, Formulae & Equations",
      "Atomic Structure",
      "Periodic Table",
      "Chemical Bonding",
      "States of Matter",
      "Stoichiometry",
      "Acids, Bases & Salts",
      "Redox Reactions",
      "Electrolysis",
      "Energetics",
      "Rates of Reaction",
      "Chemical Equilibrium",
      "Organic Chemistry",
      "Hydrocarbons",
      "Alcohols & Acids",
      "Polymers",
      "Chemistry of Life",
      "Environmental Chemistry"
    ]
  },

  {
    name: "Biology",
    icon: "🧬",
    color: "from-emerald-500 to-teal-400",
    topics: [
      "Characteristics of Living Things",
      "Cell Structure & Organization",
      "Cell Division (Mitosis & Meiosis)",
      "Nutrition",
      "Digestive System",
      "Respiration",
      "Transport Systems",
      "Excretion",
      "Homeostasis",
      "Nervous System",
      "Hormonal Coordination",
      "Reproduction",
      "Growth & Development",
      "Ecology",
      "Population Studies",
      "Evolution",
      "Genetics",
      "Variation & Adaptation",
      "Human Health & Diseases"
    ]
  },

  {
    name: "English Language",
    icon: "📚",
    color: "from-purple-500 to-violet-400",
    topics: [
      "Comprehension",
      "Summary Writing",
      "Essay Writing",
      "Argumentative Essays",
      "Descriptive Essays",
      "Narrative Essays",
      "Letter Writing",
      "Speech Writing",
      "Articles & Reports",
      "Vocabulary Development",
      "Lexis & Structure",
      "Grammar",
      "Tenses",
      "Concord",
      "Sentence Structure",
      "Punctuation",
      "Figures of Speech",
      "Oral English (Phonetics)"
    ]
  },

  {
    name: "Economics",
    icon: "📊",
    color: "from-amber-500 to-orange-400",
    topics: [
      "Basic Economic Concepts",
      "Production",
      "Division of Labour",
      "Demand & Supply",
      "Elasticity",
      "Theory of Cost",
      "Market Structures",
      "National Income",
      "Money & Banking",
      "Inflation & Deflation",
      "Public Finance",
      "International Trade",
      "Balance of Payments",
      "Economic Growth & Development",
      "Economic Systems",
      "Agricultural Economics"
    ]
  },

  {
    name: "Literature in English",
    icon: "📖",
    color: "from-pink-500 to-rose-400",
    topics: [
      "Literary Appreciation",
      "Poetry",
      "Prose",
      "Drama",
      "African Poetry",
      "Non-African Poetry",
      "African Prose",
      "Non-African Prose",
      "African Drama",
      "Non-African Drama",
      "Figures of Speech",
      "Themes & Motifs",
      "Characterization",
      "Plot & Setting"
    ]
  },

  {
    name: "Geography",
    icon: "🌍",
    color: "from-cyan-500 to-sky-400",
    topics: [
      "The Earth & Solar System",
      "Latitude & Longitude",
      "Map Reading",
      "Rocks",
      "Weather & Climate",
      "Drainage Systems",
      "Vegetation",
      "Soil",
      "Population Geography",
      "Settlement",
      "Transportation",
      "Environmental Hazards",
      "Economic Geography of Nigeria",
      "Natural Resources"
    ]
  },

  {
    name: "Agricultural Science",
    icon: "🌾",
    color: "from-lime-500 to-green-400",
    topics: [
      "Introduction to Agriculture",
      "Soil Formation",
      "Soil Fertility",
      "Farm Tools & Machinery",
      "Crop Production",
      "Crop Improvement",
      "Animal Husbandry",
      "Animal Nutrition",
      "Pests & Diseases",
      "Farm Management",
      "Agricultural Economics",
      "Fisheries",
      "Forestry"
    ]
  }
];

type ViewState = "subjects" | "topics" | "learning";

export default function TopicsPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewState>("subjects");
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS_DATA[0] | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lessonContent, setLessonContent] = useState<TopicTeachResponse | null>(null);
  const [difficulty, setDifficulty] = useState<"simple" | "medium" | "advanced">("medium");

  // Auto-select subject from URL query parameter
  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam) {
      const subject = SUBJECTS_DATA.find(
        s => s.name.toLowerCase() === subjectParam.toLowerCase()
      );
      if (subject) {
        setSelectedSubject(subject);
        setView("topics");
      }
    }
  }, [searchParams]);

  // Filter subjects based on search
  const filteredSubjects = SUBJECTS_DATA.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle topic selection and fetch content
  const handleTopicSelect = async (topic: string) => {
    if (!selectedSubject) return;
    
    setSelectedTopic(topic);
    setView("learning");
    setIsLoading(true);

    try {
      const content = await topicsAPI.teach({
        subject: selectedSubject.name,
        topic: topic,
        difficulty_level: difficulty
      });
      setLessonContent(content);
    } catch (error) {
      console.error("Failed to fetch topic content:", error);
      // Set mock content for demo
      setLessonContent({
        subject: selectedSubject.name,
        topic: topic,
        summary: `This lesson covers ${topic} in ${selectedSubject.name}. Understanding this topic is essential for WAEC and JAMB exams.`,
        detailed_explanation: `${topic} is a fundamental concept in ${selectedSubject.name}. Let's break it down step by step...

**Key Points:**
• First, understand the basic definition and concepts
• Learn the formulas and methods involved
• Practice with examples from past WAEC/JAMB questions
• Apply the knowledge to solve real problems

This topic often appears in exam questions, so make sure you understand it thoroughly.`,
        examples: [
          `Example 1: A basic ${topic} problem that demonstrates the core concept.`,
          `Example 2: A more complex ${topic} question similar to JAMB style.`
        ],
        practice_questions: [
          `Question 1: Practice problem on ${topic}`,
          `Question 2: Another practice problem`,
          `Question 3: Challenge question`
        ],
        video_link: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy content to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Re-explain in simpler terms
  const handleSimplify = async () => {
    if (!selectedSubject || !selectedTopic) return;
    setDifficulty("simple");
    setIsLoading(true);
    
    try {
      const content = await topicsAPI.teach({
        subject: selectedSubject.name,
        topic: selectedTopic,
        difficulty_level: "simple"
      });
      setLessonContent(content);
    } catch (error) {
      console.error("Failed to simplify:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {view !== "subjects" && (
            <button
              onClick={() => {
                if (view === "learning") {
                  setView("topics");
                  setLessonContent(null);
                } else {
                  setView("subjects");
                  setSelectedSubject(null);
                }
              }}
              className="p-2 rounded-lg bg-card hover:bg-blue-light/20 text-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              {view === "subjects" && "Learn Topics"}
              {view === "topics" && selectedSubject?.name}
              {view === "learning" && selectedTopic}
            </h1>
            <p className="text-muted text-sm">
              {view === "subjects" && "Choose a subject to start learning"}
              {view === "topics" && `${selectedSubject?.topics.length} topics available`}
              {view === "learning" && `${selectedSubject?.name} • ${difficulty} level`}
            </p>
          </div>
        </div>

        {view === "learning" && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => lessonContent && copyToClipboard(lessonContent.detailed_explanation)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}
      </motion.div>

      {/* Search Bar (only on subjects view) */}
      {view === "subjects" && (
        <motion.div variants={itemVariants}>
          <Input
            placeholder="Search subjects or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </motion.div>
      )}

      {/* Subjects Grid */}
      <AnimatePresence mode="wait">
        {view === "subjects" && (
          <motion.div
            key="subjects"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -50 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredSubjects.map((subject, index) => (
              <motion.div key={subject.name} variants={itemVariants}>
                <Card
                  variant="glass"
                  hover
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedSubject(subject);
                    setView("topics");
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl",
                        `bg-gradient-to-br ${subject.color}`
                      )}>
                        {subject.icon}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-muted">
                      {subject.topics.length} topics to learn
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {subject.topics.slice(0, 3).map(topic => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 rounded-full bg-blue-light/10 text-xs text-muted"
                        >
                          {topic}
                        </span>
                      ))}
                      {subject.topics.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-muted">
                          +{subject.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Topics Grid */}
        {view === "topics" && selectedSubject && (
          <motion.div
            key="topics"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            {/* Difficulty Selector */}
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Difficulty Level:</span>
                  <div className="flex gap-2">
                    {(["simple", "medium", "advanced"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                          difficulty === level
                            ? "bg-gradient-to-r from-blue to-red text-white"
                            : "bg-blue-light/10 text-muted hover:text-white"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topics List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedSubject.topics.map((topic, index) => (
                <motion.div key={topic} variants={itemVariants}>
                  <Card
                    variant="glass"
                    hover
                    className="cursor-pointer group"
                    onClick={() => handleTopicSelect(topic)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            `bg-gradient-to-br ${selectedSubject.color} bg-opacity-20`
                          )}>
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground group-hover:text-white transition-colors">
                              {topic}
                            </h4>
                            <p className="text-xs text-muted">Tap to learn</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Learning View */}
        {view === "learning" && (
          <div key="learning">
            {isLoading ? (
              <Card variant="glass">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted">Preparing your lesson...</p>
                </CardContent>
              </Card>
            ) : lessonContent && selectedSubject ? (
              <LessonContent
                lessonContent={lessonContent}
                selectedSubject={selectedSubject}
                difficulty={difficulty}
                onBack={() => {
                  setView("topics");
                  setLessonContent(null);
                }}
                onSimplify={handleSimplify}
                onCopy={copyToClipboard}
              />
            ) : (
              <Card variant="glass">
                <CardContent className="p-12 text-center">
                  <p className="text-muted">No lesson content available. Please try again.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

