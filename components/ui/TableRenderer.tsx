"use client";

import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

// Helper to render cell content (may contain LaTeX)
function renderCellContent(content: string) {
  // Check if content contains LaTeX math
  const mathRegex = /\$([^\$]+?)\$/g;
  const parts: (string | { math: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mathRegex.exec(content)) !== null) {
    // Add text before math
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    // Add math
    parts.push({ math: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  if (parts.length === 0) {
    return content;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === "string") {
          return <span key={index}>{part}</span>;
        } else {
          return <InlineMath key={index} math={part.math} />;
        }
      })}
    </>
  );
}

interface TableRendererProps {
  content: string;
  className?: string;
}

/**
 * Component to render markdown-style tables
 * Supports markdown table format:
 * | Header 1 | Header 2 |
 * |----------|----------|
 * | Cell 1   | Cell 2   |
 */
export function TableRenderer({ content, className }: TableRendererProps) {
  if (!content) return null;

  // Parse markdown table format
  const lines = content.trim().split('\n').filter(line => line.trim());
  
  if (lines.length < 2) return null;

  // Check if it's a markdown table (starts with |)
  const isMarkdownTable = lines[0].trim().startsWith('|') && lines[1].includes('---');
  
  if (!isMarkdownTable) return null;

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0);

  // Skip separator line (line 1)
  // Parse data rows
  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i]
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  if (headers.length === 0) return null;

  return (
    <div className={cn("my-6 overflow-x-auto", className)}>
      <table className="w-full border-collapse rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
        <thead>
          <tr className="bg-blue-light/20">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-[rgba(255,255,255,0.1)]"
              >
                {renderCellContent(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "border-b border-[rgba(255,255,255,0.05)] transition-colors",
                rowIndex % 2 === 0 ? "bg-blue-light/5" : "bg-transparent",
                "hover:bg-blue-light/10"
              )}
            >
              {headers.map((_, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 text-sm text-muted border-r border-[rgba(255,255,255,0.05)] last:border-r-0"
                >
                  {renderCellContent(row[cellIndex] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Component to render a table from structured data
 */
interface StructuredTableProps {
  headers: string[];
  rows: string[][];
  className?: string;
}

export function StructuredTable({ headers, rows, className }: StructuredTableProps) {
  return (
    <div className={cn("my-6 overflow-x-auto", className)}>
      <table className="w-full border-collapse rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
        <thead>
          <tr className="bg-blue-light/20">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-[rgba(255,255,255,0.1)]"
              >
                {renderCellContent(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "border-b border-[rgba(255,255,255,0.05)] transition-colors",
                rowIndex % 2 === 0 ? "bg-blue-light/5" : "bg-transparent",
                "hover:bg-blue-light/10"
              )}
            >
              {headers.map((_, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 text-sm text-muted border-r border-[rgba(255,255,255,0.05)] last:border-r-0"
                >
                  {renderCellContent(row[cellIndex] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

