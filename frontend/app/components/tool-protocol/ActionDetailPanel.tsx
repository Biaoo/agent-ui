"use client";

import React, { useState } from "react";
import { useActionDetail } from "./ActionDetailContext";

export interface ActionDetailRendererProps {
  /** Action name */
  actionName: string;
  /** Action execution status */
  status: "inProgress" | "executing" | "complete";
  /** Request arguments */
  args: Record<string, any>;
  /** Result payload */
  result: unknown;
}

export interface ActionDetailPanelProps {
  /** Map of action names to their detail renderer components */
  renderers: Record<string, React.ComponentType<ActionDetailRendererProps>>;
  /** Custom class name for the panel */
  className?: string;
}

/**
 * Canvas panel for displaying detailed action results
 *
 * This component renders on the right side of the screen and shows
 * detailed information about the selected action. It uses registered
 * renderer components to display action-specific content.
 *
 * Features:
 * - Fixed/sticky positioning on the right side
 * - Displays action-specific detailed content
 * - Dropdown switcher for multiple actions
 * - Close button to dismiss
 * - Responsive design
 * - Scrollable content area
 *
 * @example
 * ```tsx
 * <ActionDetailPanel
 *   renderers={{
 *     "web_search_using_tavily": TavilyDetailRenderer,
 *   }}
 * />
 * ```
 */
export const ActionDetailPanel: React.FC<ActionDetailPanelProps> = ({
  renderers,
  className = "",
}) => {
  const { selectedAction, actionHistory, selectAction, clearAction } = useActionDetail();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Don't render if no action is selected
  if (!selectedAction) {
    return null;
  }

  // Get the appropriate renderer for this action
  const Renderer = renderers[selectedAction.actionName];

  // Show switcher only if there are multiple actions
  const showSwitcher = actionHistory.length > 1;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
        onClick={clearAction}
      />

      {/* Panel - fixed positioning, sticky on scroll, below navigation */}
      <div
        className={`
          fixed
          top-16 bottom-0 right-0
          w-full lg:w-[600px]
          bg-white border-l border-slate-200 shadow-2xl
          z-40
          flex flex-col
          overflow-hidden
          ${className}
        `}
        style={{
          maxHeight: 'calc(100vh - 4rem)', // 4rem = top-16
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Action Details
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-500 truncate">
                {selectedAction.actionName}
              </p>
              <code className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono">
                {selectedAction.id}
              </code>
            </div>
          </div>
          <button
            type="button"
            onClick={clearAction}
            className="shrink-0 p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900"
            aria-label="Close detail panel"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Action Switcher Dropdown */}
        {showSwitcher && (
          <div className="px-6 py-3 border-b border-slate-200 bg-white shrink-0 relative">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 shrink-0">
                Switch Action:
              </span>
              <div className="flex-1 relative">
                {/* Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors text-sm"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span>{getActionIcon(selectedAction.actionName)}</span>
                    <span className="font-medium text-slate-900 truncate">
                      {getActionDisplayName(selectedAction.actionName)}
                    </span>
                    <code className="text-[10px] px-1 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {selectedAction.id.split('-').slice(0, 2).join('-')}...
                    </code>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
                      {actionHistory.map((action, index) => {
                        const isActive = action.id === selectedAction.id;
                        const displayName = getActionDisplayName(action.actionName);
                        const icon = getActionIcon(action.actionName);
                        const statusColor = getStatusColor(action.status);

                        return (
                          <button
                            key={action.id}
                            type="button"
                            onClick={() => {
                              if (!isActive) {
                                selectAction(action);
                              }
                              setDropdownOpen(false);
                            }}
                            className={`
                              w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors
                              ${isActive ? 'bg-blue-50' : ''}
                              ${index !== actionHistory.length - 1 ? 'border-b border-slate-100' : ''}
                            `}
                            title={action.id}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-xl shrink-0">{icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm text-slate-900 truncate">
                                    {displayName}
                                  </span>
                                  {index === 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                                      LATEST
                                    </span>
                                  )}
                                  {isActive && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                                      CURRENT
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <code className="text-[10px] px-1 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                                    {action.id}
                                  </code>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColor}`}>
                                    {action.status}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {new Date(action.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                {/* Show args preview on hover */}
                                {action.args && Object.keys(action.args).length > 0 && (
                                  <div className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                                    {Object.entries(action.args)
                                      .filter(([key]) => !key.startsWith('_'))
                                      .slice(0, 2)
                                      .map(([key, val]) => `${key}: ${String(val).slice(0, 30)}`)
                                      .join(' · ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {Renderer ? (
            <Renderer
              actionName={selectedAction.actionName}
              status={selectedAction.status}
              args={selectedAction.args}
              result={selectedAction.result}
            />
          ) : (
            <DefaultDetailRenderer action={selectedAction} />
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <p className="text-xs text-slate-500">
            Executed at{" "}
            {new Date(selectedAction.timestamp).toLocaleString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
      </div>
    </>
  );
};

/**
 * Default renderer for actions without a custom renderer
 */
function DefaultDetailRenderer({ action }: { action: any }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          Request Arguments
        </h3>
        <pre className="bg-slate-50 rounded-lg p-4 text-xs overflow-x-auto border border-slate-200">
          {JSON.stringify(action.args, null, 2)}
        </pre>
      </div>

      {action.status === "complete" && action.result && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Result</h3>
          <pre className="bg-slate-50 rounded-lg p-4 text-xs overflow-x-auto border border-slate-200">
            {JSON.stringify(action.result, null, 2)}
          </pre>
        </div>
      )}

      {action.status !== "complete" && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-blue-700">
            Action is still {action.status}...
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Get display name for an action
 */
function getActionDisplayName(actionName: string): string {
  const names: Record<string, string> = {
    web_search_using_tavily: "Web Search",
    ask_user_question: "User Question",
  };
  return names[actionName] || actionName;
}

/**
 * Get icon for an action
 */
function getActionIcon(actionName: string): string {
  const icons: Record<string, string> = {
    web_search_using_tavily: "🔍",
    ask_user_question: "❓",
  };
  return icons[actionName] || "⚙️";
}

/**
 * Get status color classes
 */
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    inProgress: "bg-yellow-100 text-yellow-700",
    executing: "bg-blue-100 text-blue-700",
    complete: "bg-green-100 text-green-700",
  };
  return colors[status] || "bg-slate-100 text-slate-700";
}

export default ActionDetailPanel;
