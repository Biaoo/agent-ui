"use client";

import React from "react";
import { ActionDetailProvider, useActionDetail } from "./tool-protocol/ActionDetailContext";
import { ActionDetailPanel, ActionDetailRendererProps } from "./tool-protocol/ActionDetailPanel";

export interface TwoPanelLayoutProps {
  /** Main content (typically CopilotChat) */
  children: React.ReactNode;
  /** Map of action names to their detail renderer components */
  actionRenderers: Record<string, React.ComponentType<ActionDetailRendererProps>>;
  /** Whether the detail panel should be open by default */
  defaultOpen?: boolean;
  /** Custom class name for the layout container */
  className?: string;
}

/**
 * Two-panel layout with chat on the left and detail canvas on the right
 *
 * This component provides the main layout structure for displaying
 * action executions. The left panel contains the chat interface with
 * action summary cards, and the right panel (canvas) shows detailed
 * information when an action is selected.
 *
 * Layout structure:
 * - Mobile: Full-width chat, overlay canvas panel
 * - Desktop: Chat shrinks to left, canvas appears on right (600px)
 *
 * Features:
 * - Responsive layout with smooth transitions
 * - Chat area dynamically adjusts width when panel opens
 * - Context provider integration
 * - Smooth slide-in animations
 *
 * @example
 * ```tsx
 * <TwoPanelLayout
 *   actionRenderers={{
 *     "web_search_using_tavily": TavilyDetailRenderer,
 *   }}
 * >
 *   <CopilotChat />
 * </TwoPanelLayout>
 * ```
 */
export const TwoPanelLayout: React.FC<TwoPanelLayoutProps> = ({
  children,
  actionRenderers,
  defaultOpen = false,
  className = "",
}) => {
  return (
    <ActionDetailProvider defaultOpen={defaultOpen}>
      <TwoPanelLayoutContent actionRenderers={actionRenderers} className={className}>
        {children}
      </TwoPanelLayoutContent>
    </ActionDetailProvider>
  );
};

function TwoPanelLayoutContent({
  children,
  actionRenderers,
  className = "",
}: TwoPanelLayoutProps) {
  const { selectedAction } = useActionDetail();
  const isPanelOpen = selectedAction !== null;

  return (
    <div className={`flex h-full w-full ${className}`}>
      {/* Main content area (chat) - shrinks when panel opens */}
      <div
        className={`h-full transition-all duration-300 ease-in-out ${
          isPanelOpen ? "w-full lg:w-[calc(100%-600px)]" : "w-full"
        }`}
      >
        {children}
      </div>

      {/* Detail panel (canvas) - slides in from right */}
      <ActionDetailPanel renderers={actionRenderers} />
    </div>
  );
}

export default TwoPanelLayout;
