import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import katex from "katex";
import { TopicTeachResponse } from "./api";

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export async function generateLessonPDF(
  lessonContent: TopicTeachResponse,
  subject: string,
  topic: string
): Promise<void> {
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "absolute",
    left: "-9999px",
    top: "0",
    width: "794px",           // A4 at 96 DPI ≈ 794px
    padding: "48px 56px",
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: "15px",
    lineHeight: "1.7",
    boxSizing: "border-box",
    overflow: "visible",
  });

  document.body.appendChild(container);

  try {
    // Build lesson HTML
    const lessonHTML = buildLessonHTML(lessonContent, subject, topic);

    // Collect KaTeX CSS from the page so rendered math displays correctly
    let katexCSS = "";
    document.querySelectorAll("style").forEach((s) => {
      if (s.textContent && s.textContent.includes(".katex")) {
        katexCSS += s.textContent;
      }
    });
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const href = (link as HTMLLinkElement).href;
      if (href && href.includes("katex")) {
        katexCSS += `@import url("${href}");`;
      }
    });

    // Make math larger and give plenty of room so html2canvas captures everything
    const katexFixes = `
      .katex { font-size: 1.4em !important; }
      .katex-display { margin: 18px 0 !important; overflow: visible !important; }
      .katex-display > .katex { padding: 12px 0 !important; overflow: visible !important; }
      .katex .katex-html { overflow: visible !important; }
      .katex .base { padding: 2px 0 !important; }
      .katex .strut { overflow: visible !important; }
      .katex .vlist-t, .katex .vlist-t2, .katex .vlist { overflow: visible !important; }
      .katex .mfrac { padding: 4px 0 !important; }
      .katex .mfrac > .vlist-t2 { overflow: visible !important; }
      .katex .sqrt { padding-top: 4px !important; }
    `;

    container.innerHTML = `<style>${katexCSS}\n${katexFixes}</style>${lessonHTML}`;

    // Let KaTeX CSS and fonts settle
    await new Promise((r) => setTimeout(r, 800));

    // Gather safe page-break points (between sections) before capturing
    const breakCandidates: number[] = [0];
    container.querySelectorAll("[data-pdf-block]").forEach((el) => {
      const htmlEl = el as HTMLElement;
      breakCandidates.push(htmlEl.offsetTop);
    });
    breakCandidates.sort((a, b) => a - b);

    const canvasScale = 2;
    const canvas = await html2canvas(container, {
      scale: canvasScale,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const usableW = pageW - margin * 2;
    const usableH = pageH - margin * 2;

    const pxToCanvas = canvasScale; // multiply DOM px by this to get canvas px
    const imgScale = usableW / canvas.width; // canvas px to mm
    const pageHeightPx = Math.floor(usableH / imgScale); // canvas px per page

    let yOffset = 0;
    let pageNum = 0;

    while (yOffset < canvas.height) {
      if (pageNum > 0) pdf.addPage();

      let idealEnd = yOffset + pageHeightPx;

      // If we're not at the end, find the best break point
      if (idealEnd < canvas.height) {
        // Find the largest break candidate (in canvas px) that fits on this page
        let bestBreak = idealEnd;
        for (const bp of breakCandidates) {
          const bpCanvas = bp * pxToCanvas;
          if (bpCanvas > yOffset + 100 && bpCanvas <= idealEnd) {
            bestBreak = bpCanvas;
          }
        }
        // If bestBreak is too close to yOffset (less than 30% of page), use idealEnd
        if (bestBreak - yOffset < pageHeightPx * 0.3) {
          bestBreak = idealEnd;
        }
        idealEnd = bestBreak;
      } else {
        idealEnd = canvas.height;
      }

      const sliceH = Math.min(idealEnd - yOffset, canvas.height - yOffset);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceH;
      const ctx = pageCanvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0, yOffset, canvas.width, sliceH,
        0, 0, canvas.width, sliceH
      );

      const imgData = pageCanvas.toDataURL("image/png");
      const imgH = sliceH * imgScale;
      pdf.addImage(imgData, "PNG", margin, margin, usableW, imgH);

      yOffset += sliceH;
      pageNum++;
    }

    const filename = `${subject}_${topic.replace(/[^a-z0-9]/gi, "_")}_Lesson.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}

/* ------------------------------------------------------------------ */
/*  Build the full lesson HTML                                        */
/* ------------------------------------------------------------------ */

function buildLessonHTML(lesson: TopicTeachResponse, subject: string, topic: string): string {
  let html = "";

  // Title header
  html += `
    <div style="margin-bottom:28px; border-bottom:3px solid #1e40af; padding-bottom:14px;">
      <h1 style="margin:0 0 6px; font-size:26px; color:#1e40af;">${esc(subject)}: ${esc(topic)}</h1>
      <p style="margin:0; font-size:13px; color:#888;">Generated by The Stem Studio</p>
    </div>
  `;

  // Summary
  if (lesson.summary) {
    html += `<div data-pdf-block>`;
    html += sectionCard("Quick Summary", lesson.summary, "#3b82f6");
    html += `</div>`;
  }

  // Detailed explanation
  if (lesson.detailed_explanation) {
    html += `
      <div data-pdf-block style="margin-bottom:24px;">
        <h2 style="font-size:20px; color:#1e40af; margin:0 0 14px; padding-bottom:8px; border-bottom:1px solid #e5e7eb;">
          Detailed Explanation
        </h2>
        <div>${renderContent(lesson.detailed_explanation)}</div>
      </div>
    `;
  }

  // Examples
  if (lesson.examples?.length) {
    html += `
      <div data-pdf-block style="margin-bottom:24px;">
        <h2 style="font-size:20px; color:#1e40af; margin:0 0 14px; padding-bottom:8px; border-bottom:1px solid #e5e7eb;">
          Worked Examples
        </h2>
    `;
    lesson.examples.forEach((ex, i) => {
      html += `
        <div data-pdf-block style="margin-bottom:16px; padding:14px 16px; background:#fffbeb; border-left:4px solid #f59e0b; border-radius:6px;">
          <p style="margin:0 0 8px; font-weight:700; color:#92400e; font-size:14px;">Example ${i + 1}</p>
          <div>${renderContent(ex)}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  // Practice questions
  if (lesson.practice_questions?.length) {
    html += `
      <div data-pdf-block style="margin-bottom:24px;">
        <h2 style="font-size:20px; color:#1e40af; margin:0 0 14px; padding-bottom:8px; border-bottom:1px solid #e5e7eb;">
          Practice Questions
        </h2>
    `;
    lesson.practice_questions.forEach((q, i) => {
      html += `
        <div data-pdf-block style="margin-bottom:12px; padding:12px 16px; background:#f0f4ff; border-radius:6px; display:flex; gap:10px;">
          <span style="font-weight:700; color:#1e40af; flex-shrink:0;">${i + 1}.</span>
          <div>${renderContent(q)}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  return html;
}

/* ------------------------------------------------------------------ */
/*  Render content: markdown + LaTeX math + tables → HTML             */
/* ------------------------------------------------------------------ */

function renderContent(raw: string): string {
  if (!raw) return "";

  // Fix broken bullets
  let text = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/^([*\-•])\s*\n+\s*(?=\S)/gm, "- ");

  // Split out block math and tables first, render text segments as markdown
  const blockMathRe = /\$\$([\s\S]+?)\$\$/g;
  const tableRe = /(\|[^\n]+\|\s*\n\|[\s\-:|]+\|\s*\n(?:\|[^\n]+\|\s*\n?)+)/g;

  type Hit = { start: number; end: number; type: "math" | "table"; raw: string };
  const hits: Hit[] = [];

  let m: RegExpExecArray | null;
  while ((m = blockMathRe.exec(text)) !== null) {
    hits.push({ start: m.index, end: m.index + m[0].length, type: "math", raw: m[1].trim() });
  }
  while ((m = tableRe.exec(text)) !== null) {
    const inside = hits.some((h) => m!.index >= h.start && m!.index < h.end);
    if (!inside) hits.push({ start: m.index, end: m.index + m[0].length, type: "table", raw: m[0] });
  }
  hits.sort((a, b) => a.start - b.start);

  let result = "";
  let cursor = 0;

  for (const hit of hits) {
    if (hit.start > cursor) {
      result += markdownToHTML(text.substring(cursor, hit.start));
    }
    if (hit.type === "math") {
      result += renderBlockMath(hit.raw);
    } else {
      result += renderTable(hit.raw);
    }
    cursor = hit.end;
  }
  if (cursor < text.length) {
    result += markdownToHTML(text.substring(cursor));
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  Markdown → HTML (with inline math rendered via KaTeX)             */
/* ------------------------------------------------------------------ */

function markdownToHTML(md: string): string {
  if (!md.trim()) return "";

  // 1. Extract inline math into placeholders BEFORE any HTML processing
  const mathStore: string[] = [];
  let html = md.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    mathStore.push(math.trim());
    return `%%IMATH${mathStore.length - 1}%%`;
  });

  // 2. Escape HTML (placeholders are safe – they contain no < > & ")
  html = esc(html);

  // 3. Markdown conversions (all on escaped text, safe to insert HTML tags)

  // Headers (process ### before ## before #)
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:17px; font-weight:700; margin:18px 0 8px; color:#1e40af;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:19px; font-weight:700; margin:20px 0 10px; color:#1e40af;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:22px; font-weight:700; margin:22px 0 12px; color:#1e40af;">$1</h1>');

  // Bold & italic (bold first to avoid conflict)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+?)`/g,
    '<code style="background:#eef2ff; padding:2px 5px; border-radius:3px; font-family:\'Courier New\',monospace; font-size:13px;">$1</code>'
  );

  // Lists: collect consecutive bullet/number lines into <ul>/<ol>
  html = html.replace(/(^[*\-+] .+$(\n|$))+/gm, (block) => {
    const items = block.trim().split("\n").map((line) => {
      const text = line.replace(/^[*\-+] /, "");
      return `<li style="margin-bottom:4px;">${text}</li>`;
    }).join("");
    return `<ul style="margin:10px 0; padding-left:22px; list-style:disc;">${items}</ul>`;
  });

  html = html.replace(/(^\d+\. .+$(\n|$))+/gm, (block) => {
    const items = block.trim().split("\n").map((line) => {
      const text = line.replace(/^\d+\. /, "");
      return `<li style="margin-bottom:4px;">${text}</li>`;
    }).join("");
    return `<ol style="margin:10px 0; padding-left:22px; list-style:decimal;">${items}</ol>`;
  });

  // Paragraphs: split on double newlines
  const paragraphs = html.split(/\n{2,}/);
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (/^<(h[1-4]|ul|ol|pre|div|blockquote)/i.test(trimmed)) return trimmed;
      return `<p style="margin:0 0 12px; line-height:1.7;">${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");

  // 4. LAST STEP: replace math placeholders with rendered KaTeX HTML
  mathStore.forEach((tex, i) => {
    html = html.replace(`%%IMATH${i}%%`, renderInlineMath(tex));
  });

  return html;
}

/* ------------------------------------------------------------------ */
/*  KaTeX rendering helpers                                           */
/* ------------------------------------------------------------------ */

function renderInlineMath(tex: string): string {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode: false });
  } catch {
    return `<code style="background:#fee2e2; padding:2px 4px; border-radius:3px; font-size:13px;">${esc(tex)}</code>`;
  }
}

function renderBlockMath(tex: string): string {
  try {
    const rendered = katex.renderToString(tex, { throwOnError: false, displayMode: true });
    return `<div data-pdf-block style="margin:20px 0; padding:24px 14px; background:#f8f9ff; border-radius:6px; text-align:center; overflow:visible;">${rendered}</div>`;
  } catch {
    return `<div data-pdf-block style="margin:16px 0; padding:14px; background:#fee2e2; border-radius:6px; text-align:center; font-family:monospace;">${esc(tex)}</div>`;
  }
}

/* ------------------------------------------------------------------ */
/*  Table rendering                                                   */
/* ------------------------------------------------------------------ */

function renderTable(raw: string): string {
  const lines = raw.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 3) return esc(raw);

  const parseCells = (line: string) =>
    line.split("|").map((c) => c.trim()).filter((c) => c.length > 0);

  const headers = parseCells(lines[0]);
  const rows = lines.slice(2).map(parseCells);

  let html = `<table data-pdf-block style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">`;

  // Header
  html += `<thead><tr style="background:#e0e7ff;">`;
  headers.forEach((h) => {
    html += `<th style="padding:10px 12px; text-align:left; border:1px solid #c7d2fe; font-weight:700; color:#1e40af;">${renderCellContent(h)}</th>`;
  });
  html += `</tr></thead>`;

  // Body
  html += `<tbody>`;
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? "#f8fafc" : "#ffffff";
    html += `<tr style="background:${bg};">`;
    headers.forEach((_, ci) => {
      const cell = row[ci] || "";
      html += `<td style="padding:8px 12px; border:1px solid #e2e8f0;">${renderCellContent(cell)}</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody></table>`;

  return html;
}

function renderCellContent(cell: string): string {
  // Render inline math in table cells
  return cell.replace(/\$([^\$]+?)\$/g, (_, math) => renderInlineMath(math.trim()));
}

/* ------------------------------------------------------------------ */
/*  Summary card helper                                               */
/* ------------------------------------------------------------------ */

function sectionCard(title: string, content: string, accentColor: string): string {
  return `
    <div style="margin-bottom:24px; padding:16px 18px; background:#f0f7ff; border-left:4px solid ${accentColor}; border-radius:6px;">
      <h2 style="margin:0 0 10px; font-size:18px; color:#1e40af;">${esc(title)}</h2>
      <div>${renderContent(content)}</div>
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/*  Utility                                                           */
/* ------------------------------------------------------------------ */

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
