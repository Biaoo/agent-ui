"use client";

import React from "react";
import { useActionDetail, ActionDetail } from "./ActionDetailContext";

export interface ActionSummaryCardProps {
  /** Action execution details */
  action: ActionDetail;
  /** Action display name (human-readable) */
  displayName: string;
  /** Icon or emoji for the action */
  icon?: string;
  /** Brief description of what the action does */
  description?: string;
  /** Summary of key parameters */
  parameterSummary?: React.ReactNode;
  /** Summary of results (for completed actions) */
  resultSummary?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

/**
 * Unified action summary card for displaying in CopilotChat
 *
 * This component provides a consistent UI for all action executions in the chat.
 * It shows basic information and status, with a click handler to show full details
 * in the canvas panel.
 *
 * Features:
 * - Status indicator (in progress, executing, complete)
 * - Action icon and name
 * - Parameter summary
 * - Result summary (for completed actions)
 * - Click to view full details in canvas
 * - Visual feedback when selected
 *
 * @example
 * ```tsx
 * <ActionSummaryCard
 *   action={actionDetail}
 *   displayName="Web Search"
 *   icon="🔍"
 *   description="Searching the web using Tavily"
 *   parameterSummary={<span>Query: {args.query}</span>}
 *   resultSummary={<span>Found {results.length} results</span>}
 * />
 * ```
 */
export const ActionSummaryCard: React.FC<ActionSummaryCardProps> = ({
  action,
  displayName,
  icon = "⚙️",
  description,
  parameterSummary,
  resultSummary,
  className = "",
}) => {
  const { selectAction, isSelected } = useActionDetail();
  const selected = isSelected(action.id);

  const handleClick = () => {
    selectAction(action);
  };

  const getStatusInfo = () => {
    switch (action.status) {
      case "inProgress":
        return {
          label: "Preparing",
          color: "bg-yellow-50 border-yellow-200 text-yellow-700",
          dotColor: "bg-yellow-400",
          animate: true,
        };
      case "executing":
        return {
          label: "Executing",
          color: "bg-blue-50 border-blue-200 text-blue-700",
          dotColor: "bg-blue-400",
          animate: true,
        };
      case "complete":
        return {
          label: "Complete",
          color: "bg-green-50 border-green-200 text-green-700",
          dotColor: "bg-green-400",
          animate: false,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={`w-full max-w-2xl rounded-2xl border bg-white p-4 shadow-sm transition-all cursor-pointer hover:shadow-md ${
        selected
          ? "border-blue-500 ring-2 ring-blue-200"
          : "border-slate-200 hover:border-blue-300"
      } ${className}`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="text-2xl shrink-0">{icon}</div>

          {/* Title and description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {displayName}
              </h3>
              {/* Action ID badge */}
              <code className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                {action.id.split("-").slice(0, 2).join("-")}...
              </code>
              {/* Status badge */}
              <span
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusInfo.color}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor} ${
                    statusInfo.animate ? "animate-pulse" : ""
                  }`}
                />
                {statusInfo.label}
              </span>
            </div>
            {description && (
              <p className="text-xs text-slate-500 line-clamp-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* View details button */}
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          View Details →
        </button>
      </div>

      {/* Parameter summary */}
      {parameterSummary && (
        <div className="mb-2 pb-2 border-b border-slate-100">
          <div className="text-xs text-slate-600">{parameterSummary}</div>
        </div>
      )}

      {/* Result summary (only for complete actions) */}
      {action.status === "complete" && resultSummary && (
        <div className="mt-2">
          <div className="text-xs text-slate-700 font-medium">
            {resultSummary}
          </div>
        </div>
      )}

      {/* Click hint */}
      <div className="mt-3 pt-2 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400">
          {selected
            ? "Selected - Showing details in canvas →"
            : "Click to view full details in canvas →"}
        </p>
      </div>
    </div>
  );
};

export default ActionSummaryCard;
