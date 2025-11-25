"use client";

import React, { useMemo, useId } from "react";
import { useCopilotAction } from "@copilotkit/react-core";
import { ActionSummaryCard } from "../ActionSummaryCard";
import { useActionDetail, ActionDetail } from "../ActionDetailContext";
import { generateActionId } from "../utils";

type ActionStatus = "inProgress" | "executing" | "complete";

interface TavilyRequestArguments {
  query?: string;
  max_results?: number | string;
  search_depth?: string;
  include_answer?: boolean | string;
  include_images?: boolean | string;
}

interface TavilyResponsePayload {
  query?: string;
  answer?: string | null;
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    score?: number;
  }>;
  images?: string[];
  response_time?: number;
}

/**
 * Hook to register Tavily search action with CopilotKit
 *
 * This renders a summary card in the chat and integrates with
 * the ActionDetailContext for showing full details in the canvas panel.
 */
export function useTavilySearchAction(): void {
  const { selectAction } = useActionDetail();

  useCopilotAction({
    name: "web_search_using_tavily",
    description: "Render Tavily web search results inside the chat.",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "The search query string.",
        required: true,
      },
      {
        name: "max_results",
        type: "number",
        description: "Maximum number of search results to return (default: 5).",
      },
      {
        name: "search_depth",
        type: "string",
        description: "Search depth: 'basic' or 'advanced' (default: 'basic').",
      },
      {
        name: "include_answer",
        type: "boolean",
        description: "Whether to include an AI-generated answer (default: false).",
      },
      {
        name: "include_images",
        type: "boolean",
        description: "Whether to include image results (default: false).",
      },
    ],
    render: ({ args, status, result }) => (
      <TavilySearchRenderer
        args={args as TavilyRequestArguments}
        status={status as ActionStatus}
        result={result}
        selectAction={selectAction}
      />
    ),
  });
}

interface TavilySearchRendererProps {
  args: TavilyRequestArguments;
  status: ActionStatus;
  result: unknown;
  selectAction: (action: ActionDetail) => void;
}

function TavilySearchRenderer({
  args,
  status,
  result,
  selectAction,
}: TavilySearchRendererProps) {
  // Generate stable unique ID using React's useId hook
  const uniqueId = useId();
  
  // Create action detail object with memoized ID to avoid impure function calls during render
  const actionDetail = useMemo((): ActionDetail => {
    // Use a hash of the args + status + uniqueId to create a stable ID
    return {
      id: generateActionId("tavily", uniqueId, args, status),
      actionName: "web_search_using_tavily",
      status,
      args,
      result,
      timestamp: 0, // Use 0 as placeholder since exact timestamp isn't critical for uniqueness
    };
  }, [status, args, result, uniqueId]);

  // Parse result for summary
  const payload = useMemo(
    () => safeParse<TavilyResponsePayload>(result),
    [result]
  );

  // Auto-select on complete (only once when status changes to complete)
  React.useEffect(() => {
    if (status === "complete" && payload) {
      selectAction(actionDetail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); // Only trigger when status changes

  // Prepare parameter summary
  const parameterSummary = (
    <div className="flex flex-wrap gap-2">
      <span className="text-xs">
        <span className="font-medium">Query:</span> {args.query || "N/A"}
      </span>
      {args.search_depth && (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
          {args.search_depth}
        </span>
      )}
    </div>
  );

  // Prepare result summary
  const resultSummary =
    status === "complete" && payload ? (
      <span className="text-xs">
        Found <span className="font-semibold">{payload.results?.length || 0}</span>{" "}
        results
        {payload.answer && " • AI answer included"}
      </span>
    ) : null;

  return (
    <ActionSummaryCard
      action={actionDetail}
      displayName="Web Search"
      icon="🔍"
      description="Searching the web using Tavily"
      parameterSummary={parameterSummary}
      resultSummary={resultSummary}
    />
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

// Re-export the detail renderer
export { TavilyDetailRenderer, default as TavilyDetailRendererDefault } from "./TavilyDetailRenderer";
