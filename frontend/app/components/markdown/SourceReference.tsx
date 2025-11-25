"use client";
import React from "react";

/**
 * Props for the SourceReference component
 */
export interface SourceReferenceProps {
  /** The text content of the link */
  children?: React.ReactNode;
  /** The URL to link to (with or without "source:" prefix) */
  href?: string;
  /** Custom class name for styling */
  className?: string;
}

/**
 * SourceReference - Custom markdown component for rendering source citations
 *
 * This component is used to display clickable source references in search results.
 * It supports the "source:" prefix format from the search agent.
 *
 * Features:
 * - Displays a paperclip icon for visual identification
 * - Opens links in a new tab with proper security attributes
 * - Supports hover and active states
 * - Accessible with proper ARIA attributes
 *
 * @example
 * // In markdown: [Google](source:https://google.com)
 * <SourceReference href="source:https://google.com">Google</SourceReference>
 */
export const SourceReference: React.FC<SourceReferenceProps> = ({
  children,
  href,
  className = "",
}) => {
  // Remove "source:" or "#source:" prefix if present
  const sourceUrl = href?.replace(/^#?source:/, "") || "#";
  console.log("[SourceReference] Rendering with:", { href, sourceUrl, children, className });

  // Check if URL is valid
  const isValidUrl = sourceUrl !== "#" && sourceUrl.length > 0;

  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`source-reference ${className}`}
      aria-label={`Source: ${children || sourceUrl}`}
      data-valid-url={isValidUrl}
    >
      <span className="source-icon" aria-hidden="true">
        📎
      </span>
      <span className="source-text">{children || "Source"}</span>
    </a>
  );
};

export default SourceReference;
