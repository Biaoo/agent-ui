"use client";
import React, { useMemo } from "react";
import { SourceReference } from "./SourceReference";
import { FootnoteReference } from "./FootnoteReference";
import { FootnoteDefinition } from "./FootnoteDefinition";
import { CitationBlock } from "./CitationBlock";

/**
 * Type definitions for markdown renderer props
 */
export interface MarkdownComponentProps {
  children?: React.ReactNode;
  href?: string;
  [key: string]: any;
}

/**
 * Custom markdown tag renderers for CopilotKit
 *
 * This module provides custom React components for rendering markdown elements
 * in CopilotKit chat interfaces. It's designed to work with the search agent's
 * markdown output format.
 *
 * Supported custom formats:
 * - `[text](source:URL)` → SourceReference component
 * - `[text](ref:id)` → FootnoteReference component
 * - `> quote` → CitationBlock component
 * - `http(s)://...` → Automatically converted to SourceReference
 *
 * @example
 * ```tsx
 * import { useMarkdownRenderers } from '@/app/components/markdown';
 *
 * function SearchPage() {
 *   const markdownRenderers = useMarkdownRenderers();
 *
 *   return (
 *     <CopilotChat
 *       markdownTagRenderers={markdownRenderers}
 *       // ... other props
 *     />
 *   );
 * }
 * ```
 */

/**
 * Hook to get custom markdown tag renderers
 *
 * Returns a memoized object of custom markdown renderers for use with CopilotKit.
 * The renderers are memoized to prevent unnecessary re-renders.
 *
 * @returns Object with custom renderer functions for markdown tags
 */
export function useMarkdownRenderers() {
  const markdownTagRenderers = useMemo(
    () => ({
      /**
       * Custom link renderer
       * Handles source references, footnotes, and regular links
       */
      a: ({ children, href, ...props }: MarkdownComponentProps) => {
        // Handle source: prefix - can be either citation or footnote definition
        // Format 1: #source:1:https://example.com (footnote definition with ID)
        // Format 2: #source:https://example.com (regular citation)
        if (href?.startsWith("#source:")) {
          // console.log("[Link Renderer] Detected source link:", href);
          const sourceContent = href.replace(/^#source:/, "");
          // console.log("[Link Renderer] Source content:", sourceContent);

          // Check if it contains an ID (format: ID:URL)
          // Split only on the first two colons to handle URLs with colons
          const firstColonIndex = sourceContent.indexOf(":");

          if (firstColonIndex > 0) {
            const potentialId = sourceContent.substring(0, firstColonIndex);
            const potentialUrl = sourceContent.substring(firstColonIndex + 1);

            // console.log("[Link Renderer] Potential ID:", potentialId, "URL:", potentialUrl);

            // Check if ID is a number (footnote definition)
            if (/^\d+$/.test(potentialId)) {
              // console.log("[Link Renderer] ✅ Rendering as FootnoteDefinition");
              return (
                <FootnoteDefinition
                  id={potentialId}
                  href={potentialUrl}
                  {...props}
                >
                  {children}
                </FootnoteDefinition>
              );
            }
          }

          // Otherwise, treat as regular source reference
          // console.log("[Link Renderer] ❌ Rendering as SourceReference");
          return (
            <SourceReference href={href} {...props}>
              {children}
            </SourceReference>
          );
        }

        // Handle ref: prefix for footnotes
        if (href?.startsWith("#ref:")) {
          console.log("Detected footnote reference:", href);
          const refId = href.replace(/^#?ref:/, "");
          return (
            <FootnoteReference id={refId} {...props}>
              {children}
            </FootnoteReference>
          );
        }

        // Regular links (fallback)
        return (
          <a
            href={href || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="copilotKitMarkdownElement markdown-link"
            {...props}
          >
            {children}
          </a>
        );
      },

      /**
       * Custom blockquote renderer
       * Used for citation blocks
       */
      blockquote: ({ children, ...props }: MarkdownComponentProps) => (
        <CitationBlock {...props}>{children}</CitationBlock>
      ),

      /**
       * Custom code block renderer
       * Adds syntax highlighting support
       */
      code: ({ children, className, ...props }: MarkdownComponentProps) => {
        const isInline = !className;

        if (isInline) {
          return (
            <code className="markdown-inline-code" {...props}>
              {children}
            </code>
          );
        }

        return (
          <code className={`markdown-code-block ${className || ""}`} {...props}>
            {children}
          </code>
        );
      },

      /**
       * Custom pre block renderer
       * Wraps code blocks with proper styling
       */
      pre: ({ children, ...props }: MarkdownComponentProps) => (
        <pre className="markdown-pre" {...props}>
          {children}
        </pre>
      ),

      /**
       * Custom heading renderers
       * Adds proper semantic structure and styling
       */
      h1: ({ children, ...props }: MarkdownComponentProps) => (
        <h1 className="markdown-h1" {...props}>
          {children}
        </h1>
      ),
      h2: ({ children, ...props }: MarkdownComponentProps) => (
        <h2 className="markdown-h2" {...props}>
          {children}
        </h2>
      ),
      h3: ({ children, ...props }: MarkdownComponentProps) => (
        <h3 className="markdown-h3" {...props}>
          {children}
        </h3>
      ),

      /**
       * Custom list renderers
       * Adds proper styling for ordered and unordered lists
       */
      ul: ({ children, ...props }: MarkdownComponentProps) => (
        <ul className="markdown-list markdown-list-unordered" {...props}>
          {children}
        </ul>
      ),
      ol: ({ children, ...props }: MarkdownComponentProps) => {
        // Ordered list rendering
        // Footnote definitions are automatically handled by the `a` tag renderer
        return (
          <ol className="markdown-list markdown-list-ordered" {...props}>
            {children}
          </ol>
        );
      },
      li: ({ children, ...props }: MarkdownComponentProps) => {
        // Default list item rendering
        // FootnoteDefinition is now a <span>, so no need to unwrap
        return (
          <li className="markdown-list-item" {...props}>
            {children}
          </li>
        );
      },

      /**
       * Custom table renderers
       * Adds responsive table styling
       */
      table: ({ children, ...props }: MarkdownComponentProps) => (
        <div className="markdown-table-wrapper">
          <table className="markdown-table" {...props}>
            {children}
          </table>
        </div>
      ),
    }),
    []
  );

  return markdownTagRenderers;
}

// Re-export individual components for direct use
export { SourceReference, FootnoteReference, FootnoteDefinition, CitationBlock };
export type { SourceReferenceProps } from "./SourceReference";
export type { FootnoteReferenceProps } from "./FootnoteReference";
export type { FootnoteDefinitionProps } from "./FootnoteDefinition";
export type { CitationBlockProps } from "./CitationBlock";

// Export default hook
export default useMarkdownRenderers;
