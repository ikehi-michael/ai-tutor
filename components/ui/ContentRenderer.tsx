"use client";

import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { TableRenderer } from "./TableRenderer";

interface ContentRendererProps {
  content: string;
  className?: string;
}

type ContentPart = 
  | { type: "text"; content: string }
  | { type: "inline-math"; math: string }
  | { type: "block-math"; math: string }
  | { type: "table"; tableContent: string };

/**
 * Enhanced content renderer that handles:
 * - LaTeX math (inline $...$ and block $$...$$)
 * - Markdown tables (| Header | Header | format)
 * - Regular text with line breaks
 */
export function ContentRenderer({ content, className }: ContentRendererProps) {
  if (!content) return null;

  const parts: ContentPart[] = [];
  let text = content;
  let lastIndex = 0;

  // Find all special blocks (block math, tables, inline math)
  const blockMathRegex = /\$\$([\s\S]+?)\$\$/g;
  // Match markdown tables: header row, separator row (with dashes), and data rows
  // More flexible regex that handles various markdown table formats
  const tableRegex = /(\|[^\n]+\|\s*\n\|[\s\-:|]+\|\s*\n(?:\|[^\n]+\|\s*\n?)+)/g;
  const inlineMathRegex = /\$([^\$]+?)\$/g;

  const matches: Array<{
    start: number;
    end: number;
    type: "block-math" | "table" | "inline-math";
    content: string;
  }> = [];

  // Find block math
  blockMathRegex.lastIndex = 0;
  let match;
  while ((match = blockMathRegex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "block-math",
      content: match[1].trim(),
    });
  }

  // Find tables (markdown format)
  tableRegex.lastIndex = 0;
  while ((match = tableRegex.exec(text)) !== null) {
    // Check if this match is inside any block math
    const isInsideBlock = matches.some(
      (m) => m.type === "block-math" && match!.index >= m.start && match!.index < m.end
    );
    if (!isInsideBlock) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "table",
        content: match[0],
      });
    }
  }

  // Find inline math (but skip if inside block math or table)
  inlineMathRegex.lastIndex = 0;
  while ((match = inlineMathRegex.exec(text)) !== null) {
    const isInsideSpecial = matches.some(
      (m) => match!.index >= m.start && match!.index < m.end
    );
    if (!isInsideSpecial) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "inline-math",
        content: match[1].trim(),
      });
    }
  }

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Build parts array
  for (const match of matches) {
    // Add text before match
    if (match.start > lastIndex) {
      const textPart = text.substring(lastIndex, match.start);
      if (textPart.trim()) {
        parts.push({ type: "text", content: textPart });
      }
    }
    // Add special content
    if (match.type === "block-math") {
      parts.push({ type: "block-math", math: match.content });
    } else if (match.type === "table") {
      parts.push({ type: "table", tableContent: match.content });
    } else if (match.type === "inline-math") {
      parts.push({ type: "inline-math", math: match.content });
    }
    lastIndex = match.end;
  }
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText.trim()) {
      parts.push({ type: "text", content: remainingText });
    }
  }

  // If no special content found, return plain text
  if (parts.length === 0 || (parts.length === 1 && parts[0].type === "text")) {
    return (
      <div className={className}>
        {content.split('\n').map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("content-renderer", className)}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <span key={index} className="block">
              {part.content.split('\n').map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </span>
          );
        } else if (part.type === "block-math") {
          return (
            <div key={index} className="my-4 overflow-x-auto">
              <BlockMath math={part.math} />
            </div>
          );
        } else if (part.type === "inline-math") {
          return <InlineMath key={index} math={part.math} />;
        } else if (part.type === "table") {
          return <TableRenderer key={index} content={part.tableContent} />;
        }
        return null;
      })}
    </div>
  );
}

