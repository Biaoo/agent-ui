"use client";
import React from "react";

/**
 * Props for the SearchResultCard component
 */
export interface SearchResultCardProps {
  /** The title of the search result */
  title: string;
  /** The URL of the source */
  url: string;
  /** Snippet or description of the content */
  snippet?: string;
  /** Relevance score (0-1) */
  score?: number;
  /** Custom class name for styling */
  className?: string;
}

/**
 * SearchResultCard - Custom component for displaying rich search results
 *
 * This component provides a card-based layout for search results with metadata.
 * It's designed to display information from tools like Tavily in a structured format.
 *
 * Features:
 * - Card-based layout with hover effects
 * - Title, URL, and snippet display
 * - Optional relevance score indicator
 * - Truncated text with ellipsis
 * - Accessible with proper semantic HTML
 *
 * @example
 * <SearchResultCard
 *   title="Example Article"
 *   url="https://example.com"
 *   snippet="This is a brief description..."
 *   score={0.95}
 * />
 */
export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  title,
  url,
  snippet,
  score,
  className = "",
}) => {
  // Extract domain from URL for display
  const domain = (() => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  })();

  return (
    <article className={`search-result-card ${className}`}>
      <header className="search-result-header">
        <h3 className="search-result-title">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="search-result-link"
          >
            {title}
          </a>
        </h3>
        <div className="search-result-meta">
          <span className="search-result-domain" title={url}>
            {domain}
          </span>
          {score !== undefined && (
            <span
              className="search-result-score"
              aria-label={`Relevance score: ${Math.round(score * 100)}%`}
            >
              {Math.round(score * 100)}%
            </span>
          )}
        </div>
      </header>
      {snippet && (
        <p className="search-result-snippet" title={snippet}>
          {snippet}
        </p>
      )}
    </article>
  );
};

export default SearchResultCard;
