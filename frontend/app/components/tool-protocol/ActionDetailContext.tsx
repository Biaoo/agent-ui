"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * Action detail information for the canvas panel
 */
export interface ActionDetail {
  /** Unique identifier for the action execution */
  id: string;
  /** Action name (e.g., "web_search_using_tavily") */
  actionName: string;
  /** Action execution status */
  status: "inProgress" | "executing" | "complete";
  /** Request arguments */
  args: Record<string, any>;
  /** Result payload (null if not complete) */
  result: unknown;
  /** Timestamp when action was created */
  timestamp: number;
}

interface ActionDetailContextValue {
  /** Currently selected action for detail view */
  selectedAction: ActionDetail | null;
  /** All action history (latest first) */
  actionHistory: ActionDetail[];
  /** Select an action to show in detail panel */
  selectAction: (action: ActionDetail) => void;
  /** Clear the selected action */
  clearAction: () => void;
  /** Check if a specific action is selected */
  isSelected: (actionId: string) => boolean;
}

const ActionDetailContext = createContext<ActionDetailContextValue | undefined>(
  undefined
);

/**
 * Provider for managing action detail selection state
 *
 * This context manages which action is currently selected for detailed
 * viewing in the canvas panel. It provides functions to select, clear,
 * and check selection status.
 *
 * @example
 * ```tsx
 * <ActionDetailProvider>
 *   <TwoPanelLayout>
 *     <CopilotChat />
 *   </TwoPanelLayout>
 * </ActionDetailProvider>
 * ```
 */
export function ActionDetailProvider({
  children,
  defaultOpen: _defaultOpen = false,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  // _defaultOpen reserved for future use (auto-open panel on first action)
  const [selectedAction, setSelectedAction] = useState<ActionDetail | null>(
    null
  );
  const [actionHistory, setActionHistory] = useState<ActionDetail[]>([]);

  const selectAction = useCallback((action: ActionDetail) => {
    setSelectedAction(action);
    // Add to history if not already present
    setActionHistory((prev) => {
      const existingIndex = prev.findIndex((a) => a.id === action.id);
      if (existingIndex >= 0) {
        // Move to front if already exists
        const updated = [...prev];
        updated.splice(existingIndex, 1);
        return [action, ...updated];
      }
      // Add to front
      return [action, ...prev];
    });
  }, []);

  const clearAction = useCallback(() => {
    setSelectedAction(null);
  }, []);

  const isSelected = useCallback(
    (actionId: string) => {
      return selectedAction?.id === actionId;
    },
    [selectedAction]
  );

  const value: ActionDetailContextValue = {
    selectedAction,
    actionHistory,
    selectAction,
    clearAction,
    isSelected,
  };

  return (
    <ActionDetailContext.Provider value={value}>
      {children}
    </ActionDetailContext.Provider>
  );
}

/**
 * Hook to access action detail context
 *
 * Must be used within an ActionDetailProvider.
 *
 * @throws Error if used outside of ActionDetailProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { selectedAction, selectAction } = useActionDetail();
 *
 *   const handleClick = () => {
 *     selectAction({
 *       id: "action-123",
 *       actionName: "web_search",
 *       status: "complete",
 *       args: { query: "AI" },
 *       result: { ... },
 *       timestamp: Date.now(),
 *     });
 *   };
 *
 *   return <button onClick={handleClick}>Show Details</button>;
 * }
 * ```
 */
export function useActionDetail(): ActionDetailContextValue {
  const context = useContext(ActionDetailContext);
  if (!context) {
    throw new Error(
      "useActionDetail must be used within an ActionDetailProvider"
    );
  }
  return context;
}
