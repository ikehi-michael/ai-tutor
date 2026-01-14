"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { pastQuestionsAPI } from "@/lib/api";
import Cookies from "js-cookie";

export default function PastQuestionsUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [examType, setExamType] = useState("JAMB");
  const [subject, setSubject] = useState("Biology");
  const [year, setYear] = useState("2024");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count: number; message: string } | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setResult({
        success: false,
        count: 0,
        message: "Please select a PDF file",
      });
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      const questions = await pastQuestionsAPI.upload(file, examType, subject, year);
      setResult({
        success: true,
        count: questions.length,
        message: `Successfully extracted ${questions.length} questions from the PDF!`,
      });
      // Reset file input
      setFile(null);
    } catch (error: any) {
      setResult({
        success: false,
        count: 0,
        message: error.response?.data?.detail || "Upload failed. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

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
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold font-heading text-foreground">Upload Past Questions</h1>
        <p className="text-muted text-sm">Upload PDF files containing past exam questions to add them to the question bank</p>
      </motion.div>

      {/* Upload Form */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Exam Type</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full p-3 rounded-lg bg-card border border-blue-light/20 text-foreground"
                >
                  <option value="JAMB">JAMB</option>
                  <option value="WAEC">WAEC</option>
                  <option value="NECO">NECO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Biology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Year</label>
                <Input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">PDF File</label>
                <div className="border-2 border-dashed border-blue-light/20 rounded-lg p-6 text-center hover:border-blue/40 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <FileText className="w-12 h-12 text-muted" />
                    <span className="text-sm text-muted">
                      {file ? file.name : "Click to select PDF file"}
                    </span>
                    {file && (
                      <span className="text-xs text-blue">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing PDF...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload and Extract Questions
                  </>
                )}
              </Button>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    result.success
                      ? "bg-blue/20 border border-blue/30"
                      : "bg-red/20 border border-red/30"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${result.success ? 'text-blue' : 'text-red'}`}>
                      {result.success ? "Success!" : "Error"}
                    </p>
                    <p className={`text-sm ${result.success ? 'text-blue/80' : 'text-red/80'}`}>
                      {result.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Instructions */}
      <motion.div variants={itemVariants}>
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Upload Instructions</h4>
                <ul className="text-sm text-muted space-y-1">
                  <li>• PDF should contain past exam questions with answers marked</li>
                  <li>• Questions should be numbered clearly</li>
                  <li>• Options should be labeled A, B, C, D (or E)</li>
                  <li>• Correct answers should be marked with ticks (✓) or checkmarks</li>
                  <li>• The system will automatically extract questions using AI vision</li>
                  <li>• Processing may take a few minutes for large PDFs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
