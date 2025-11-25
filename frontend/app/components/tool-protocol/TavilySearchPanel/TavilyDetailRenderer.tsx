"use client";

import React, { useState } from "react";
import { ActionDetailRendererProps } from "../ActionDetailPanel";

const MAX_RESULTS_PER_PAGE = 5;

interface TavilySearchResult {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
}

interface TavilyResponsePayload {
  query?: string;
  answer?: string | null;
  results?: TavilySearchResult[];
  images?: string[];
  response_time?: number;
}

/**
 * Detail renderer for Tavily search results in the canvas panel
 */
export const TavilyDetailRenderer: React.FC<ActionDetailRendererProps> = ({
  status,
  args,
  result,
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  if (status !== "complete" || !result) {
    return <LoadingView status={status} args={args} />;
  }

  const payload = safeParse<TavilyResponsePayload>(result);
  if (!payload) {
    return <ErrorView />;
  }

  const results = payload.results ?? [];
  const totalResults = results.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalResults / MAX_RESULTS_PER_PAGE)
  );
  const startIdx = currentPage * MAX_RESULTS_PER_PAGE;
  const visibleResults = results.slice(
    startIdx,
    startIdx + MAX_RESULTS_PER_PAGE
  );

  const handlePageChange = (nextPage: number) => {
    if (nextPage >= 0 && nextPage < totalPages) {
      setCurrentPage(nextPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Query info */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {payload.query || "Web Search"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {args.search_depth && (
            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
              {args.search_depth} search
            </span>
          )}
          {payload.response_time && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {payload.response_time.toFixed(0)} ms
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {totalResults} results
          </span>
        </div>
      </div>

      {/* AI-generated answer */}
      {payload.answer && (
        <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
          <h4 className="text-sm font-semibold text-purple-900 mb-2">
            AI-Generated Answer
          </h4>
          <p className="text-sm text-purple-800 leading-relaxed">
            {payload.answer}
          </p>
        </div>
      )}

      {/* Search results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-700">
            Search Results
          </h4>
          {totalPages > 1 && (
            <span className="text-xs text-slate-500">
              Page {currentPage + 1} of {totalPages}
            </span>
          )}
        </div>

        {visibleResults.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No search results found.
          </div>
        ) : (
          <div className="space-y-4">
            {visibleResults.map((result, idx) => (
              <SearchResultCard
                key={`${result.url}-${startIdx + idx}`}
                result={result}
                index={startIdx + idx + 1}
              />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                currentPage === 0
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                currentPage === totalPages - 1
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Images */}
      {payload.images && payload.images.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Related Images
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {payload.images.slice(0, 6).map((imageUrl, idx) => (
              <a
                key={`img-${idx}`}
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-video rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 transition-colors"
              >
                <img
                  src={imageUrl}
                  alt={`Search result ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function SearchResultCard({
  result,
  index,
}: {
  result: TavilySearchResult;
  index: number;
}) {
  const title = result.title ?? "Untitled";
  const url = result.url ?? "#";
  const content = result.content ?? "";
  const score = result.score;

  const domain = (() => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  })();

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
          {index}
        </div>

        <div className="flex-1 min-w-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors block mb-1"
          >
            {title}
          </a>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-500 truncate">{domain}</span>
            {score !== undefined && (
              <span className="text-xs text-slate-400">
                • {Math.round(score * 100)}% relevant
              </span>
            )}
          </div>
          {content && (
            <p className="text-sm text-slate-600 line-clamp-3">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingView({ status, args }: { status: string; args: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
      <p className="text-sm font-medium text-slate-700">
        {status === "inProgress"
          ? "Preparing search..."
          : "Searching the web..."}
      </p>
      {args.query && (
        <p className="text-xs text-slate-500 mt-2">Query: {args.query}</p>
      )}
    </div>
  );
}

function ErrorView() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-medium text-red-800">
        Failed to load search results
      </p>
      <p className="text-xs text-red-600 mt-1">
        The result data could not be parsed.
      </p>
    </div>
  );
}

function safeParse<T>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return null;
}

export default TavilyDetailRenderer;
