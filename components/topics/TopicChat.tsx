"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { ContentRenderer } from "@/components/ui/ContentRenderer";
import { topicsAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  message: string;
  created_at: string;
}

interface TopicChatProps {
  lessonId: number;
  subject: string;
  topic: string;
}

export function TopicChat({ lessonId, subject, topic }: TopicChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await topicsAPI.getChatHistory(lessonId);
        setMessages(history);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadHistory();
  }, [lessonId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message to UI immediately
    const tempUserMsg: ChatMessage = {
      role: "user",
      message: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await topicsAPI.chatAboutTopic({
        lesson_id: lessonId,
        message: userMessage
      });

      // Add AI response
      const aiMsg: ChatMessage = {
        role: "assistant",
        message: response.message,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error("Chat error:", error);
      // Remove user message on error and show error message
      setMessages(prev => prev.slice(0, -1));
      const errorMsg: ChatMessage = {
        role: "assistant",
        message: "Sorry, I encountered an error. Please try again.",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card variant="glass">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Chat About This Topic</h3>
            <p className="text-xs text-muted">Ask questions about {topic}</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-[400px] overflow-y-auto mb-4 space-y-4 pr-2">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-blue animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-12 h-12 text-muted mb-4 opacity-50" />
              <p className="text-muted">Start a conversation about {topic}</p>
              <p className="text-sm text-muted mt-2">Ask questions, request examples, or clarify concepts</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl p-4",
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue to-red text-white"
                        : "bg-card text-foreground border border-[rgba(255,255,255,0.1)]"
                    )}
                  >
                    <div className="text-sm leading-relaxed">
                      <ContentRenderer content={msg.message} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card rounded-xl p-4 border border-[rgba(255,255,255,0.1)]">
                <Loader2 className="w-5 h-5 text-blue animate-spin" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${topic}...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            variant="primary"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

