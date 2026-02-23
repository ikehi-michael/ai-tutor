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

/* ------------------------------------------------------------------ */
/*  Preprocessing – fix common AI formatting issues before rendering  */
/* ------------------------------------------------------------------ */

function preprocessContent(raw: string): string {
  if (!raw) return raw;

  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Fix bullet markers stranded on their own line:
  //   "*\nsome text"  →  "- some text"
  text = text.replace(/^([*\-•])\s*\n+\s*(?=\S)/gm, "- ");

  // Collapse 3+ blank lines into 2 (one visual paragraph break)
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

/* ------------------------------------------------------------------ */
/*  Segment splitting – separate block-math / tables from prose       */
/* ------------------------------------------------------------------ */

type Segment =
  | { type: "text"; content: string }
  | { type: "block-math"; content: string }
  | { type: "table"; content: string };

function splitIntoSegments(text: string): Segment[] {
  const blockMathRe = /\$\$([\s\S]+?)\$\$/g;
  const tableRe = /(\|[^\n]+\|\s*\n\|[\s\-:|]+\|\s*\n(?:\|[^\n]+\|\s*\n?)+)/g;

  const hits: { start: number; end: number; type: "block-math" | "table"; content: string }[] = [];

  let m: RegExpExecArray | null;
  while ((m = blockMathRe.exec(text)) !== null) {
    hits.push({ start: m.index, end: m.index + m[0].length, type: "block-math", content: m[1].trim() });
  }
  while ((m = tableRe.exec(text)) !== null) {
    const insideMath = hits.some((h) => h.type === "block-math" && m!.index >= h.start && m!.index < h.end);
    if (!insideMath) {
      hits.push({ start: m.index, end: m.index + m[0].length, type: "table", content: m[0] });
    }
  }

  hits.sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;

  for (const hit of hits) {
    if (hit.start > cursor) {
      const t = text.substring(cursor, hit.start).trim();
      if (t) segments.push({ type: "text", content: t });
    }
    segments.push({ type: hit.type, content: hit.content });
    cursor = hit.end;
  }
  if (cursor < text.length) {
    const t = text.substring(cursor).trim();
    if (t) segments.push({ type: "text", content: t });
  }

  return segments;
}

/* ------------------------------------------------------------------ */
/*  Inline-math injection into React children trees                   */
/* ------------------------------------------------------------------ */

function injectMath(
  children: React.ReactNode,
  mathMap: Map<string, string>
): React.ReactNode {
  return React.Children.map(children, (child) => {
    // Plain string → split on placeholders, insert <InlineMath>
    if (typeof child === "string") {
      const parts = child.split(/(%%MATH\d+%%)/);
      if (parts.length === 1) return child;
      return (
        <>
          {parts.map((part, i) => {
            const math = mathMap.get(part);
            if (math) {
              return (
                <span key={i} className="inline-flex items-baseline mx-0.5">
                  <InlineMath math={math} />
                </span>
              );
            }
            return part || null;
          })}
        </>
      );
    }

    // React element with children → recurse
    if (React.isValidElement(child)) {
      const el = child as React.ReactElement<{ children?: React.ReactNode }>;
      if (el.props.children != null) {
        return React.cloneElement(el, {}, injectMath(el.props.children, mathMap));
      }
    }

    return child;
  });
}

/* ------------------------------------------------------------------ */
/*  MarkdownWithMath – renders a text segment as markdown + math      */
/* ------------------------------------------------------------------ */

function MarkdownWithMath({ content }: { content: string }) {
  // 1. Replace inline $...$ with placeholders so they don't break markdown
  const mathMap = new Map<string, string>();
  let idx = 0;
  const safe = content.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    const key = `%%MATH${idx}%%`;
    mathMap.set(key, math.trim());
    idx++;
    return key;
  });

  // 2. Markdown component overrides — every leaf that can contain text
  //    runs through injectMath() so placeholders become <InlineMath>.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const components: Record<string, React.ComponentType<any>> = {
    h1: ({ children }: any) => (
      <h2 className="text-xl font-bold mt-6 mb-3 text-foreground">{injectMath(children, mathMap)}</h2>
    ),
    h2: ({ children }: any) => (
      <h3 className="text-lg font-bold mt-5 mb-3 text-foreground">{injectMath(children, mathMap)}</h3>
    ),
    h3: ({ children }: any) => (
      <h4 className="text-base font-semibold mt-4 mb-2 text-foreground">{injectMath(children, mathMap)}</h4>
    ),
    h4: ({ children }: any) => (
      <h5 className="text-sm font-semibold mt-3 mb-2 text-foreground">{injectMath(children, mathMap)}</h5>
    ),
    p: ({ children }: any) => (
      <p className="mb-3 text-sm text-muted leading-relaxed">{injectMath(children, mathMap)}</p>
    ),
    strong: ({ children }: any) => (
      <strong className="font-bold text-foreground">{injectMath(children, mathMap)}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic">{injectMath(children, mathMap)}</em>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-muted text-sm">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-muted text-sm">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="text-sm leading-relaxed">{injectMath(children, mathMap)}</li>
    ),
    code: ({ children, className: cls, ...rest }: any) => {
      if (!cls) {
        return (
          <code className="px-1 py-0.5 rounded bg-blue-light/20 text-blue text-xs font-mono" {...rest}>
            {children}
          </code>
        );
      }
      return <code className={cls} {...rest}>{children}</code>;
    },
    pre: ({ children }: any) => (
      <pre className="p-4 rounded-lg bg-card border border-blue-light/20 overflow-x-auto mb-3 text-xs">
        {children}
      </pre>
    ),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <ReactMarkdown components={components}>{safe}</ReactMarkdown>
  );
}

/* ------------------------------------------------------------------ */
/*  Public component                                                  */
/* ------------------------------------------------------------------ */

export function ContentRenderer({ content, className }: ContentRendererProps) {
  if (!content) return null;

  const processed = preprocessContent(content);
  const segments = splitIntoSegments(processed);

  return (
    <div className={cn("content-renderer", className)}>
      {segments.map((seg, i) => {
        if (seg.type === "block-math") {
          return (
            <div key={i} className="my-4 overflow-x-auto">
              <BlockMath math={seg.content} />
            </div>
          );
        }
        if (seg.type === "table") {
          return (
            <div key={i} className="my-4">
              <TableRenderer content={seg.content} />
            </div>
          );
        }
        return <MarkdownWithMath key={i} content={seg.content} />;
      })}
    </div>
  );
}
