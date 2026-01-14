"use client";

import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
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
 * - Markdown formatting (bold, headings, italic, etc.)
 * - Regular text with line breaks
 */

// Markdown component styles
const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-xl font-bold mt-5 mb-3 text-foreground">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
  h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-base font-semibold mt-3 mb-2 text-foreground">{children}</h4>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-4 text-muted leading-relaxed">{children}</p>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-foreground">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-muted">{children}</em>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside mb-4 space-y-2 text-muted">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-muted">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="ml-4">{children}</li>,
  code: (props: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) => {
    const { children, className, ...rest } = props;
    const isInline = !className;
    if (isInline) {
      return <code className="px-1.5 py-0.5 rounded bg-blue-light/20 text-blue text-sm font-mono" {...rest}>{children}</code>;
    }
    return <code className={className} {...rest}>{children}</code>;
  },
  pre: ({ children }: { children?: React.ReactNode }) => <pre className="p-4 rounded-lg bg-card border border-blue-light/20 overflow-x-auto mb-4">{children}</pre>,
};

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

  // If no special content found, render as markdown
  if (parts.length === 0 || (parts.length === 1 && parts[0].type === "text")) {
    return (
      <div className={cn("prose prose-invert max-w-none", className)}>
        <ReactMarkdown components={markdownComponents}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Group consecutive text and inline math parts together for inline rendering
  const groupedParts: Array<{
    type: "inline-group" | "block-math" | "table";
    content: ContentPart[];
    mathMap?: Map<string, string>; // For inline groups: placeholder -> math
  }> = [];
  
  let currentInlineGroup: ContentPart[] = [];
  
  for (const part of parts) {
    if (part.type === "text" || part.type === "inline-math") {
      currentInlineGroup.push(part);
    } else {
      // If we have accumulated inline parts, add them as a group
      if (currentInlineGroup.length > 0) {
        // Create a combined string with placeholders for math
        const mathMap = new Map<string, string>();
        let combinedText = "";
        let placeholderIndex = 0;
        
        for (const p of currentInlineGroup) {
          if (p.type === "text") {
            combinedText += p.content;
          } else if (p.type === "inline-math") {
            const placeholder = `__MATH_PLACEHOLDER_${placeholderIndex}__`;
            mathMap.set(placeholder, p.math);
            combinedText += placeholder;
            placeholderIndex++;
          }
        }
        
        groupedParts.push({ 
          type: "inline-group", 
          content: currentInlineGroup,
          mathMap 
        });
        currentInlineGroup = [];
      }
      // Add the block element
      if (part.type === "block-math") {
        groupedParts.push({ type: "block-math", content: [part] });
      } else if (part.type === "table") {
        groupedParts.push({ type: "table", content: [part] });
      }
    }
  }
  
  // Add any remaining inline group
  if (currentInlineGroup.length > 0) {
    const mathMap = new Map<string, string>();
    let combinedText = "";
    let placeholderIndex = 0;
    
    for (const p of currentInlineGroup) {
      if (p.type === "text") {
        combinedText += p.content;
      } else if (p.type === "inline-math") {
        const placeholder = `__MATH_PLACEHOLDER_${placeholderIndex}__`;
        mathMap.set(placeholder, p.math);
        combinedText += placeholder;
        placeholderIndex++;
      }
    }
    
    groupedParts.push({ 
      type: "inline-group", 
      content: currentInlineGroup,
      mathMap 
    });
  }

  // Custom component to replace math placeholders with actual math
  const InlineTextWithMath = ({ text, mathMap }: { text: string; mathMap: Map<string, string> }) => {
    // Split text by placeholders and render
    const parts: React.ReactNode[] = [];
    const regex = /__MATH_PLACEHOLDER_(\d+)__/g;
    let lastIndex = 0;
    let match;
    let key = 0;
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before placeholder
      if (match.index > lastIndex) {
        const textPart = text.substring(lastIndex, match.index);
        // Render markdown for this text part
        parts.push(
          <ReactMarkdown 
            key={key++} 
            components={{
              ...markdownComponents,
              p: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
            }}
          >
            {textPart}
          </ReactMarkdown>
        );
      }
      // Add math component
      const placeholder = match[0];
      const math = mathMap.get(placeholder);
      if (math) {
        parts.push(<InlineMath key={key++} math={math} />);
      }
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      const textPart = text.substring(lastIndex);
      parts.push(
        <ReactMarkdown 
          key={key++} 
          components={{
            ...markdownComponents,
            p: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
          }}
        >
          {textPart}
        </ReactMarkdown>
      );
    }
    
    return (
      <span className="prose prose-invert max-w-none inline">
        {parts}
      </span>
    );
  };

  return (
    <div className={cn("content-renderer", className)}>
      {groupedParts.map((group, groupIndex) => {
        if (group.type === "inline-group" && group.mathMap) {
          // Combine all text parts with correct placeholder mapping
          let combinedText = "";
          const mathMap = new Map<string, string>();
          let mathIndex = 0;
          
          for (const p of group.content) {
            if (p.type === "text") {
              combinedText += p.content;
            } else if (p.type === "inline-math") {
              const placeholder = `__MATH_PLACEHOLDER_${mathIndex}__`;
              mathMap.set(placeholder, p.math);
              combinedText += placeholder;
              mathIndex++;
            }
          }
          
          return <InlineTextWithMath key={groupIndex} text={combinedText} mathMap={mathMap} />;
        } else if (group.type === "block-math") {
          const part = group.content[0] as { type: "block-math"; math: string };
          return (
            <div key={groupIndex} className="my-4 overflow-x-auto">
              <BlockMath math={part.math} />
            </div>
          );
        } else if (group.type === "table") {
          const part = group.content[0] as { type: "table"; tableContent: string };
          return <TableRenderer key={groupIndex} content={part.tableContent} />;
        }
        return null;
      })}
    </div>
  );
}

