import React, { useMemo } from "react";

interface MarkdownRendererProps {
  notesText: string;
}

export function MarkdownRenderer({ notesText }: MarkdownRendererProps) {
  const renderedContent = useMemo(() => {
    if (!notesText) {
      return (
        <p className="text-gray-500 italic text-sm">No notes provided for this topic.</p>
      );
    }

    const lines = notesText.split("\n");
    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Empty Lines
      if (!trimmedLine) {
        return <div key={index} className="h-2" />;
      }

      // Headers: # Header 1, ## Header 2, ### Header 3
      if (trimmedLine.startsWith("# ")) {
        return (
          <h1 key={index} className="text-xl font-bold font-display text-gray-100 mt-4 mb-2 border-b border-gray-800 pb-1">
            {trimmedLine.replace("# ", "")}
          </h1>
        );
      }
      if (trimmedLine.startsWith("## ")) {
        return (
          <h2 key={index} className="text-lg font-semibold font-display text-gray-200 mt-3 mb-2">
            {trimmedLine.replace("## ", "")}
          </h2>
        );
      }
      if (trimmedLine.startsWith("### ")) {
        return (
          <h3 key={index} className="text-base font-semibold font-display text-purple-400 mt-2 mb-1">
            {trimmedLine.replace("### ", "")}
          </h3>
        );
      }

      // Blockquotes: > quote
      if (trimmedLine.startsWith("> ")) {
        return (
          <blockquote key={index} className="border-l-4 border-purple-500 bg-purple-950/20 px-3 py-2 text-sm text-gray-300 rounded-r-md italic my-2">
            {trimmedLine.replace("> ", "")}
          </blockquote>
        );
      }

      // Unordered Lists with markdown checkboxes: - [ ] Task, - [x] Done Task
      const checkboxMatch = trimmedLine.match(/^-\s*\[([ xX])\]\s+(.*)/);
      if (checkboxMatch) {
        const checked = checkboxMatch[1].toLowerCase() === "x";
        const text = checkboxMatch[2];
        return (
          <div key={index} className="flex items-center gap-2 my-1.5 pl-2">
            <input
              type="checkbox"
              checked={checked}
              disabled
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-purple-600 focus:ring-purple-500 dark:checked:bg-purple-600"
            />
            <span className={`text-sm ${checked ? "line-through text-gray-500" : "text-gray-300"}`}>
              {parseInlineMarkdown(text)}
            </span>
          </div>
        );
      }

      // Unordered Lists: - item or * item
      if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
        const text = trimmedLine.replace(/^[-*]\s+/, "");
        return (
          <li key={index} className="list-disc list-inside text-sm text-gray-300 pl-4 my-1">
            {parseInlineMarkdown(text)}
          </li>
        );
      }

      // Code blocks or single ticks: `code`
      if (trimmedLine.startsWith("```")) {
        // Simple code block toggle (showing text directly)
        return null; // Grouping would be more ideal, but for line-by-line, we treat inline styled blocks cleanly
      }

      // Normal line
      return (
        <p key={index} className="text-gray-300 text-sm leading-relaxed my-1">
          {parseInlineMarkdown(trimmedLine)}
        </p>
      );
    });
  }, [notesText]);

  return <div className="space-y-1 font-sans">{renderedContent}</div>;
}

// Simple Helper to parse bold (**bold**), italics (*italic* or _italic_), and inline code (`code`)
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let keyIdx = 0;

  // Extremely basic inline tokenizer
  while (currentText.length > 0) {
    // 1. Double Asterisk (Bold)
    const boldMatch = currentText.match(/\*\*([^*]+)\*\*/);
    // 2. Backticks (Inline Code)
    const codeMatch = currentText.match(/`([^`]+)`/);
    // 3. Single Asterisk (Italics)
    const italicMatch = currentText.match(/\*([^*]+)\*/);

    const matches = [
      { type: "bold", index: boldMatch?.index, length: boldMatch?.[0].length, content: boldMatch?.[1] },
      { type: "code", index: codeMatch?.index, length: codeMatch?.[0].length, content: codeMatch?.[1] },
      { type: "italic", index: italicMatch?.index, length: italicMatch?.[0].length, content: italicMatch?.[1] }
    ].filter(m => m.index !== undefined) as { type: string; index: number; length: number; content: string }[];

    if (matches.length === 0) {
      parts.push(<span key={keyIdx++}>{currentText}</span>);
      break;
    }

    // Sort to find the first occurring match
    matches.sort((a, b) => a.index - b.index);
    const firstMatch = matches[0];

    // Push preceding text as plain span
    if (firstMatch.index > 0) {
      parts.push(<span key={keyIdx++}>{currentText.substring(0, firstMatch.index)}</span>);
    }

    // Push matched element with proper style
    if (firstMatch.type === "bold") {
      parts.push(<strong key={keyIdx++} className="font-semibold text-purple-300">{firstMatch.content}</strong>);
    } else if (firstMatch.type === "code") {
      parts.push(
        <code key={keyIdx++} className="bg-gray-900/80 px-1.5 py-0.5 rounded text-xs text-blue-400 font-mono border border-gray-800">
          {firstMatch.content}
        </code>
      );
    } else if (firstMatch.type === "italic") {
      parts.push(<em key={keyIdx++} className="italic text-gray-300">{firstMatch.content}</em>);
    }

    currentText = currentText.substring(firstMatch.index + firstMatch.length);
  }

  return parts;
}
