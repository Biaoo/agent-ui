"use client";
import React from "react";

/**
 * Props for the FootnoteReference component
 */
export interface FootnoteReferenceProps {
  /** The footnote number or text */
  children?: React.ReactNode;
  /** Optional ID for linking to footnote definitions */
  id?: string;
  /** Custom class name for styling */
  className?: string;
}

/**
 * FootnoteReference - Custom markdown component for rendering inline footnote references
 *
 * This component displays footnote markers as superscript elements with custom styling.
 * It can be used for academic-style citations or additional context markers.
 *
 * Features:
 * - Superscript display with custom badge styling
 * - Hover effects for interactivity
 * - Click to jump to footnote definition
 * - Smooth scroll behavior
 * - Accessible with proper semantic HTML and ARIA attributes
 *
 * @example
 * // In markdown: [1](#ref:1)
 * <FootnoteReference id="1">1</FootnoteReference>
 */
export const FootnoteReference: React.FC<FootnoteReferenceProps> = ({
  children,
  id,
  className = "",
}) => {
  // console.log("[FootnoteReference] Rendering with:", { id, children, className });

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = `footnote-def-${id}`;
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Add temporary highlight effect
      targetElement.classList.add("footnote-highlight");
      setTimeout(() => {
        targetElement.classList.remove("footnote-highlight");
      }, 2000);
    } else {
      console.warn(`Footnote definition not found: ${targetId}`);
    }
  };

  return (
    <span
      id={`footnote-ref-${id}`}
      className={`footnote-reference${className ? ' ' + className : ''}`}
      role="doc-noteref"
    >
      <a
        href={`#footnote-def-${id}`}
        onClick={handleClick}
        aria-label={`Jump to footnote ${children}`}
        className="footnote-ref-link"
      >
        {children}
      </a>
    </span>
  );
};

export default FootnoteReference;
