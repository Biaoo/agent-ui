"use client";
import React from "react";

/**
 * Props for the CitationBlock component
 */
export interface CitationBlockProps {
  /** The citation content */
  children?: React.ReactNode;
  /** Optional source/author attribution */
  source?: string;
  /** Custom class name for styling */
  className?: string;
}

/**
 * CitationBlock - Custom markdown component for rendering blockquote citations
 *
 * This component displays quoted text in a visually distinct citation block.
 * It's designed for displaying excerpts from sources with attribution.
 *
 * Features:
 * - Left border accent for visual distinction
 * - Decorative quote mark
 * - Optional source attribution
 * - Responsive padding and margins
 * - Dark mode support
 *
 * @example
 * // In markdown: > "This is a quote from a source"
 * <CitationBlock source="Example Source">This is a quote</CitationBlock>
 */
export const CitationBlock: React.FC<CitationBlockProps> = ({
  children,
  source,
  className = "",
}) => {
  return (
    <blockquote className={`citation-block ${className}`} role="doc-pullquote">
      <div className="citation-content">{children}</div>
      {source && (
        <footer className="citation-source">
          <cite>— {source}</cite>
        </footer>
      )}
    </blockquote>
  );
};

export default CitationBlock;
