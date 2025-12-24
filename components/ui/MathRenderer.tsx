"use client";

import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * Component to render text with LaTeX math equations
 * Supports both inline math ($...$) and block math ($$...$$)
 */
export function MathRenderer({ content, className }: MathRendererProps) {
  if (!content) return null;

  const parts: (string | { type: "inline" | "block"; math: string })[] = [];
  let text = content;
  let lastIndex = 0;

  // First, process block math ($$...$$) - these take priority
  const blockMathRegex = /\$\$([\s\S]+?)\$\$/g;
  const blockMatches: Array<{ start: number; end: number; math: string }> = [];
  let match;
  
  // Reset regex lastIndex
  blockMathRegex.lastIndex = 0;
  while ((match = blockMathRegex.exec(text)) !== null) {
    blockMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      math: match[1].trim(),
    });
  }

  // Process inline math ($...$) - but skip if inside block math
  const inlineMathRegex = /\$([^\$]+?)\$/g;
  const inlineMatches: Array<{ start: number; end: number; math: string }> = [];
  
  inlineMathRegex.lastIndex = 0;
  while ((match = inlineMathRegex.exec(text)) !== null) {
    // Check if this match is inside any block math
    const isInsideBlock = blockMatches.some(
      (bm) => match!.index >= bm.start && match!.index < bm.end
    );
    if (!isInsideBlock) {
      inlineMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        math: match[1].trim(),
      });
    }
  }

  // Combine and sort all matches
  const allMatches = [
    ...blockMatches.map((m) => ({ ...m, type: "block" as const })),
    ...inlineMatches.map((m) => ({ ...m, type: "inline" as const })),
  ].sort((a, b) => a.start - b.start);

  // Build parts array
  for (const match of allMatches) {
    // Add text before match
    if (match.start > lastIndex) {
      const textPart = text.substring(lastIndex, match.start);
      if (textPart) {
        parts.push(textPart);
      }
    }
    // Add math
    parts.push({ type: match.type, math: match.math });
    lastIndex = match.end;
  }
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no math found, return plain text
  if (parts.length === 0 || (parts.length === 1 && typeof parts[0] === "string")) {
    return <span className={className}>{content}</span>;
  }

  return (
    <span className={cn("math-content", className)}>
      {parts.map((part, index) => {
        if (typeof part === "string") {
          // Preserve line breaks in text
          return (
            <span key={index}>
              {part.split('\n').map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </span>
          );
        } else if (part.type === "block") {
          return (
            <div key={index} className="my-4 overflow-x-auto">
              <BlockMath math={part.math} />
            </div>
          );
        } else {
          return <InlineMath key={index} math={part.math} />;
        }
      })}
    </span>
  );
}

/**
 * Simple component for rendering block math equations
 */
export function BlockMathRenderer({ math, className }: { math: string; className?: string }) {
  return (
    <div className={cn("my-4", className)}>
      <BlockMath math={math} />
    </div>
  );
}

/**
 * Simple component for rendering inline math
 */
export function InlineMathRenderer({ math, className }: { math: string; className?: string }) {
  return (
    <span className={className}>
      <InlineMath math={math} />
    </span>
  );
}

