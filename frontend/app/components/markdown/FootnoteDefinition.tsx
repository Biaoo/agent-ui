"use client";
import React from "react";

/**
 * Props for the FootnoteDefinition component
 */
export interface FootnoteDefinitionProps {
  /** The footnote number or ID */
  id: string;
  /** The content/URL of the footnote */
  children?: React.ReactNode;
  /** The URL if it's a link footnote */
  href?: string;
  /** Custom class name for styling */
  className?: string;
  [key: string]: any;
}

/**
 * FootnoteDefinition - Component for rendering footnote definitions/sources
 *
 * This component displays clickable source links in footnote lists.
 * It's designed to be used within list items created by markdown.
 *
 * Features:
 * - Displays source links with proper formatting
 * - Can be jumped to from footnote references
 * - Supports both text and link footnotes
 * - Accessible with proper ARIA attributes
 *
 * @example
 * // In markdown: 1. [Source Title](#source:1:https://example.com)
 * // Renders as: <li><FootnoteDefinition id="1" href="https://example.com">Source Title</FootnoteDefinition></li>
 */
export const FootnoteDefinition: React.FC<FootnoteDefinitionProps> = ({
  id,
  children,
  href,
  className = "",
  ...rest
}) => {
  // Reserved for future use: back navigation to footnote reference
  // const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  //   e.preventDefault();
  //   const refId = `footnote-ref-${id}`;
  //   const refElement = document.getElementById(refId);
  //   if (refElement) {
  //     refElement.scrollIntoView({ behavior: "smooth", block: "center" });
  //     refElement.classList.add("footnote-highlight");
  //     setTimeout(() => refElement.classList.remove("footnote-highlight"), 2000);
  //   }
  // };

  return (
    <span
      id={`footnote-def-${id}`}
      className={`footnote-definition ${className}`}
      role="doc-endnote"
      {...rest}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="footnote-link"
        >
          {children}
        </a>
      ) : (
        <span className="footnote-text">{children}</span>
      )}
    </span>
  );
};

export default FootnoteDefinition;
