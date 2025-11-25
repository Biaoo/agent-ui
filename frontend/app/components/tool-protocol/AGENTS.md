# Tool Protocol - AI Development Guide

This guide helps AI assistants develop new tool frontend components following the established patterns in this codebase.

## Quick Reference

**Purpose**: Create frontend UI for backend agent tools using two-panel architecture

**Key Files**:

- `index.tsx`: Action registration + summary card renderer
- `{Tool}DetailRenderer.tsx`: Canvas panel renderer for detailed results

**Pattern**: Summary in chat (left) → Click → Details in canvas (right)

## Step-by-Step: Create a New Tool

### Step 1: Create Directory Structure

```bash
mkdir -p app/components/tool-protocol/MyToolPanel
cd app/components/tool-protocol/MyToolPanel
touch index.tsx
touch MyToolDetailRenderer.tsx
```

### Step 2: Implement index.tsx

**Template**:

```tsx
"use client";

import React, { useMemo, useId } from "react";
import { useCopilotAction } from "@copilotkit/react-core";
import { ActionSummaryCard } from "../ActionSummaryCard";
import { useActionDetail, ActionDetail } from "../ActionDetailContext";
import { generateActionId } from "../utils";

type ActionStatus = "inProgress" | "executing" | "complete";

// 1. Define request argument types (from backend)
interface MyToolRequestArguments {
  query?: string;
  filter?: string;
}

// 2. Define response payload types (from backend)
interface MyToolResponsePayload {
  results?: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  total?: number;
}

/**
 * Hook to register MyTool action with CopilotKit
 */
export function useMyToolAction(): void {
  const { selectAction } = useActionDetail();

  useCopilotAction({
    name: "my_tool_action_name",  // 3. Must match backend action name EXACTLY
    description: "Render MyTool results inside the chat.",
    parameters: [
      // 4. Define parameters (must match backend)
      {
        name: "query",
        type: "string",
        description: "Search query",
        required: true,
      },
    ],
    render: ({ args, status, result }) => (
      <MyToolRenderer
        args={args as MyToolRequestArguments}
        status={status as ActionStatus}
        result={result}
        selectAction={selectAction}
      />
    ),
  });
}

interface MyToolRendererProps {
  args: MyToolRequestArguments;
  status: ActionStatus;
  result: unknown;
  selectAction: (action: ActionDetail) => void;
}

function MyToolRenderer({
  args,
  status,
  result,
  selectAction,
}: MyToolRendererProps) {
  // 5. Generate stable unique ID (DO NOT use random() or Date.now() directly)
  const uniqueId = useId();

  // 6. Parse result data with safeParse
  const payload = useMemo(
    () => safeParse<MyToolResponsePayload>(result),
    [result]
  );

  // 7. Create action detail object with stable ID
  const actionDetail = useMemo((): ActionDetail => {
    return {
      id: generateActionId("mytool", uniqueId, args, status),
      actionName: "my_tool_action_name",
      status,
      args,
      result,
      timestamp: Date.now(),
    };
  }, [status, args, result, uniqueId]);

  // 8. Auto-select on completion (IMPORTANT: only depend on status!)
  React.useEffect(() => {
    if (status === "complete" && payload) {
      selectAction(actionDetail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // 9. Prepare parameter summary
  const parameterSummary = (
    <div className="flex flex-wrap gap-2">
      {args.query && (
        <span className="text-xs">
          <span className="font-medium">Query:</span> {args.query}
        </span>
      )}
    </div>
  );

  // 10. Prepare result summary (only for completed actions)
  const resultSummary = status === "complete" && payload ? (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-700">
        Found {payload.total ?? 0} results
      </span>
    </div>
  ) : null;

  // 11. Render ActionSummaryCard
  return (
    <ActionSummaryCard
      action={actionDetail}
      displayName="My Tool"
      icon="🔧"
      description={
        status === "complete"
          ? "Search completed"
          : "Searching..."
      }
      parameterSummary={parameterSummary}
      resultSummary={resultSummary}
    />
  );
}

// 12. safeParse utility function
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

// 13. Export detail renderer
export { MyToolDetailRenderer } from "./MyToolDetailRenderer";
```

**Critical Points**:

✅ **DO**:

- Use `generateActionId()` for Unicode-safe IDs
- Use `useId()` for stable component IDs
- Use `useMemo()` for actionDetail to prevent infinite loops
- Only depend on `status` in useEffect (not actionDetail!)
- Use `safeParse()` for type-safe result parsing
- Match backend action name exactly
- Export detail renderer at the end

❌ **DON'T**:

- Don't use `btoa()` directly (fails with Unicode)
- Don't use `Date.now()` or `Math.random()` in ID generation
- Don't depend on `actionDetail` in useEffect
- Don't forget to export detail renderer
- Don't mismatch action name with backend

### Step 3: Implement MyToolDetailRenderer.tsx

**Template**:

```tsx
"use client";

import React, { useState } from "react";
import { ActionDetailRendererProps } from "../ActionDetailPanel";

const MAX_ITEMS_PER_PAGE = 5;

// 1. Define same interfaces as index.tsx (or import from shared file)
interface MyToolResponsePayload {
  results?: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  total?: number;
}

/**
 * Detail renderer for MyTool in the canvas panel
 */
export const MyToolDetailRenderer: React.FC<ActionDetailRendererProps> = ({
  status,
  args,
  result,
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  // 2. Handle loading state
  if (status !== "complete" || !result) {
    return <LoadingView status={status} args={args} />;
  }

  // 3. Parse result data
  const payload = safeParse<MyToolResponsePayload>(result);
  if (!payload) {
    return <ErrorView />;
  }

  // 4. Extract data
  const results = payload.results ?? [];
  const total = payload.total ?? results.length;

  // 5. Implement pagination
  const totalPages = Math.max(1, Math.ceil(results.length / MAX_ITEMS_PER_PAGE));
  const startIdx = currentPage * MAX_ITEMS_PER_PAGE;
  const visibleResults = results.slice(startIdx, startIdx + MAX_ITEMS_PER_PAGE);

  // 6. Render detailed content
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          My Tool Results
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
          {total} total results
        </span>
      </div>

      {/* Results list */}
      {visibleResults.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-600">No results found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleResults.map((item) => (
            <ResultCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              currentPage === 0
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
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
  );
};

// 7. Result card component
function ResultCard({ item }: { item: { id: string; title: string; content: string } }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-900 mb-1">{item.title}</p>
      <p className="text-xs text-slate-600">{item.content}</p>
    </div>
  );
}

// 8. Loading view
function LoadingView({ status, args }: { status: string; args: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
      <p className="text-sm font-medium text-slate-700">
        {status === "inProgress" ? "Preparing..." : "Executing..."}
      </p>
    </div>
  );
}

// 9. Error view
function ErrorView() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-medium text-red-800">
        Failed to load results
      </p>
      <p className="text-xs text-red-600 mt-1">
        The result data could not be parsed.
      </p>
    </div>
  );
}

// 10. safeParse utility
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

export default MyToolDetailRenderer;
```

**Key Elements**:

1. **Loading State**: Show spinner when status is not "complete"
2. **Error State**: Show error message when parsing fails
3. **Empty State**: Show helpful message when no results
4. **Pagination**: Implement for large datasets
5. **Styling**: Use Tailwind classes consistently
6. **Type Safety**: Use TypeScript interfaces

### Step 4: Register in Page

```tsx
// app/pages/my-page/page.tsx
import { TwoPanelLayout } from "@/app/components/TwoPanelLayout";
import {
  useMyToolAction,
  MyToolDetailRenderer
} from "@/app/components/tool-protocol/MyToolPanel";

export default function MyPage() {
  return (
    <TwoPanelLayout
      actionRenderers={{
        my_tool_action_name: MyToolDetailRenderer,  // Register here
      }}
    >
      <MyPageContent />
    </TwoPanelLayout>
  );
}

function MyPageContent() {
  useMyToolAction();  // Must be inside TwoPanelLayout

  return (
    <div className="flex justify-center items-center h-full w-full">
      <CopilotChat
        className="h-full rounded-2xl max-w-6xl mx-auto"
        labels={{ initial: "Hi! How can I help you?" }}
      />
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Displaying Metadata Badges

```tsx
<div className="flex flex-wrap gap-2">
  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
    {queryTime} ms
  </span>
  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
    {total} results
  </span>
</div>
```

### Pattern 2: Status Indicators

```tsx
const getStatusInfo = (status: ActionStatus) => {
  switch (status) {
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
```

### Pattern 3: Expandable Sections

```tsx
const [expanded, setExpanded] = useState(false);

return (
  <div className="rounded-lg border border-slate-200 bg-white p-4">
    <button
      onClick={() => setExpanded(!expanded)}
      className="flex items-center justify-between w-full text-left"
    >
      <h4 className="text-sm font-semibold text-slate-900">
        Details
      </h4>
      <svg
        className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {expanded && (
      <div className="mt-3 pt-3 border-t border-slate-100">
        {/* Expanded content */}
      </div>
    )}
  </div>
);
```

### Pattern 4: Multi-page Pagination State

```tsx
const [pageByQuery, setPageByQuery] = useState<Record<string, number>>({});

const handlePageChange = (key: string, nextPage: number) => {
  setPageByQuery((prev) => {
    const current = prev[key] ?? 0;
    if (current === nextPage) return prev;
    return { ...prev, [key]: nextPage };
  });
};

const getPage = (key: string, totalPages: number): number => {
  const stored = pageByQuery[key];
  if (typeof stored !== "number" || stored < 0) return 0;
  if (stored >= totalPages) return totalPages - 1;
  return stored;
};
```

### Pattern 5: Conditional Content Display

```tsx
{/* Show filters if they exist */}
{filters && Object.keys(filters).length > 0 && (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <h4 className="text-sm font-semibold text-slate-700 mb-2">
      Applied Filters
    </h4>
    <div className="flex flex-wrap gap-2">
      {Object.entries(filters).map(([key, value]) => (
        <span
          key={`${key}-${value}`}
          className="rounded-md bg-white border border-slate-200 px-2 py-1 text-xs text-slate-700"
        >
          {key}: {String(value)}
        </span>
      ))}
    </div>
  </div>
)}
```

## HITL (Human-in-the-Loop) Pattern

For interactive user input during agent execution:

**Key Differences**:

- Use `renderAndWaitForResponse` instead of `render`
- Store `respond` callback in `actionDetail.args`
- Auto-open canvas when status is "executing"
- Provide interactive form in detail renderer
- Call `respond()` when user submits

**Example** (see `AskUserQuestionPanel/` for full implementation):

```tsx
useCopilotAction({
  name: "ask_user_question",
  renderAndWaitForResponse: ({ args, status, respond }) => {
    // Store respond callback in args
    const actionDetail = {
      // ...
      args: {
        ...args,
        _respond: respond,
        _onSubmit: (answers) => {
          if (respond) {
            respond({ answers, status: "completed" });
          }
        }
      }
    };

    // Auto-open canvas
    React.useEffect(() => {
      if (status === "executing") {
        selectAction(actionDetail);
      }
    }, [status]);

    return <ActionSummaryCard {...} />;
  }
});
```

## Troubleshooting

### Issue: "useActionDetail must be used within an ActionDetailProvider"

**Cause**: Hook called outside `TwoPanelLayout`

**Solution**:

```tsx
// ❌ Wrong
function MyPage() {
  useMyToolAction();  // Called too early
  return <TwoPanelLayout>...</TwoPanelLayout>;
}

// ✅ Correct
function MyPage() {
  return (
    <TwoPanelLayout>
      <MyPageContent />
    </TwoPanelLayout>
  );
}

function MyPageContent() {
  useMyToolAction();  // Called inside layout
  return <CopilotChat />;
}
```

### Issue: Infinite re-renders

**Cause**: Depending on `actionDetail` in useEffect

**Solution**:

```tsx
// ❌ Wrong - causes infinite loop
React.useEffect(() => {
  if (status === "complete") {
    selectAction(actionDetail);
  }
}, [status, actionDetail, selectAction]);

// ✅ Correct - only depend on status
React.useEffect(() => {
  if (status === "complete") {
    selectAction(actionDetail);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [status]);
```

### Issue: InvalidCharacterError with Chinese text

**Cause**: Using `btoa()` directly with Unicode characters

**Solution**:

```tsx
// ❌ Wrong
id: `mytool-${uniqueId}-${btoa(argsHash)}`

// ✅ Correct
id: generateActionId("mytool", uniqueId, args, status)
```

### Issue: Action not showing in history

**Cause**: Unstable ID generation

**Solution**:

```tsx
// ❌ Wrong - ID changes every render
id: `mytool-${Math.random()}`

// ✅ Correct - Stable ID with useId() and useMemo()
const uniqueId = useId();
const actionDetail = useMemo(() => ({
  id: generateActionId("mytool", uniqueId, args, status),
  // ...
}), [status, args, result, uniqueId]);
```

## Testing Checklist

Before considering a tool implementation complete:

- [ ] Action name matches backend exactly
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Summary card displays in chat
- [ ] Detail panel opens on click
- [ ] Loading state shows during execution
- [ ] Error state handles failures gracefully
- [ ] Result data parses correctly
- [ ] Pagination works (if applicable)
- [ ] Mobile responsive (test at 375px width)
- [ ] Desktop layout works (test at 1024px+ width)
- [ ] Multiple executions tracked in history
- [ ] Switching between actions works
- [ ] Unicode characters work (test with Chinese text)
- [ ] Canvas positioning is correct (fixed, below navigation)

## Code Quality Guidelines

### TypeScript

- Always define interfaces for request/response types
- Use `type` for union types (`ActionStatus`)
- Use `interface` for object shapes
- Enable strict mode in tsconfig.json
- Use `unknown` for parsed data before validation

### React

- Use functional components with hooks
- Use `useMemo()` for expensive computations
- Use `useCallback()` for event handlers passed as props
- Keep components small (< 200 lines)
- Extract reusable components

### Styling

- Use Tailwind utility classes
- Follow color palette in README.md
- Use consistent spacing: `space-y-6` (major sections), `space-y-3` (items)
- Use consistent border radius: `rounded-2xl` (cards), `rounded-lg` (panels)
- Use responsive classes: `lg:w-[600px]`, `lg:hidden`

### Performance

- Memoize expensive computations
- Implement pagination for large datasets
- Avoid inline object/array creation in JSX
- Use `React.memo()` for pure components
- Debounce search inputs

## Reference Implementations

Study these for best practices:

1. **TavilySearchPanel**: Complete example with pagination, images, AI answer
2. **AskUserQuestionPanel**: HITL pattern with interactive form, submission handling

## Resources

- **README.md**: Tool overview, available tools, integration guide
- **utils.ts**: Unicode-safe encoding, ID generation
- **ActionDetailContext.tsx**: State management implementation
- **CopilotKit Docs**: <https://docs.copilotkit.ai>
- **AG-UI Protocol**: <https://github.com/agentstation/ag-ui-protocol>

## Development Commands

```bash
# TypeScript type checking
npx tsc --noEmit

# Start dev server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## Quick Tips for AI Assistants

1. **Always start with existing tool as template** - Copy TavilySearchPanel for standard tools
2. **Match backend action name exactly** - Case-sensitive, use underscores not dashes
3. **Use generateActionId(), never btoa()** - Handles Unicode correctly
4. **Only depend on [status] in useEffect** - Prevents infinite loops
5. **Parse with safeParse()** - Type-safe, handles string/object/null
6. **Implement loading/error states** - Essential for good UX
7. **Add pagination for > 5 items** - Prevents overwhelming UI
8. **Test with Chinese text** - Ensures Unicode handling works
9. **Export detail renderer** - Easy to forget, causes registration errors
10. **Register in TwoPanelLayout** - Required for canvas to work

## File Size Guidelines

- **index.tsx**: 150-250 lines (registration + summary)
- **DetailRenderer.tsx**: 200-400 lines (detailed view + helpers)
- Total per tool: 350-650 lines

If larger, consider:

- Extracting shared utilities
- Splitting into sub-components
- Moving types to separate file

## Common Mistakes to Avoid

1. ❌ Using `render` instead of `renderAndWaitForResponse` for HITL
2. ❌ Forgetting to export detail renderer from index.tsx
3. ❌ Mismatching action name between frontend and backend
4. ❌ Using btoa() with non-Latin1 characters
5. ❌ Depending on actionDetail in useEffect dependencies
6. ❌ Not implementing pagination for large datasets
7. ❌ Forgetting mobile responsive design
8. ❌ Not handling loading/error states
9. ❌ Calling useAction hook outside TwoPanelLayout
10. ❌ Creating new ID on every render (use useMemo + useId)

## Success Criteria

A well-implemented tool should:

✅ Display summary in chat with clear status
✅ Open detailed view on click
✅ Handle loading and error states gracefully
✅ Work on mobile and desktop
✅ Support Unicode in all text fields
✅ Track multiple executions in history
✅ Use consistent styling with other tools
✅ Have type-safe interfaces
✅ Pass TypeScript compilation
✅ Be under 650 lines total

Good luck! Refer to existing tools for working examples.
