"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface ChildReportsProps {
  itemVariants: any;
}

export function ChildReports({ itemVariants }: ChildReportsProps) {
  // TODO: Replace with actual reports from API
  const reports = [
    "Dec 16-22, 2025",
    "Dec 9-15, 2025",
    "Dec 2-8, 2025",
    "Nov 25 - Dec 1, 2025"
  ];

  return (
    <motion.div variants={itemVariants}>
      <Card variant="glass">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Weekly Reports</h3>
          <div className="space-y-3">
            {reports.map((week, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-card hover:bg-blue-light/10 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{week}</p>
                    <p className="text-sm text-muted">Weekly Progress Report</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted group-hover:text-foreground transition-colors" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

